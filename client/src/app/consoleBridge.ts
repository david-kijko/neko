// The console's header drives the embedded viewer (embed.ts), and the viewer tells it what to show.
//
// Messages: the console sends { type: 'hands:viewer-command', v: 1, cmd, value?, id?, x? } to this frame's
// window; the viewer answers with { type: 'hands:viewer-state', v: 1, ... } whenever something it shows
// changes. Only the parent window may command, and after its first 'hello' only from that origin; the
// website lets no page but the console frame the viewer. Every room change is an API call with this
// viewer's own session, so Neko itself refuses it unless the session is an admin (the Hand's owner).
import { selectControlling, selectIsAdmin, selectSession } from '@m1k1o/neko'
import type { NekoApp } from '@/state/app'
import { actions } from '@/state/actions'
import { api } from '@/state/api'
import { remember } from '@/state/storage'
import { handsAvatar } from '@/components/Avatar'
import { embedded, fitScreen } from '@/lib/embed'

interface Command {
  type: 'hands:viewer-command'
  v: 1
  cmd: string
  value?: unknown
  id?: string
  x?: number
}

export function startConsoleBridge(neko: NekoApp): () => void {
  if (!embedded) return () => {}
  const { client, app, overlay } = neko
  // chat messages so far, for the unread dot on the console's chat button
  let messages = 0
  let parentOrigin: string | null = null
  // the viewer's session is gone (website restarted, End, network): connected once, then not for 3 s
  let wasReady = false
  let ended = false
  let endTimer = 0
  let last = ''
  let queued = 0
  // the microphone: like the bottom bar's mic button, only while this session has control and may share media
  let mic: { track: MediaStreamTrack; stop: () => void } | null = null
  const micAllowed = () =>
    selectControlling(client.state) &&
    !!selectSession(client.state)?.profile.can_share_media &&
    !!navigator.mediaDevices
  const micOff = () => {
    if (!mic) return
    mic.stop()
    mic.track.stop()
    mic = null
    queue()
  }
  const micOn = async () => {
    if (mic || !micAllowed()) return
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const track = stream.getAudioTracks()[0]
      if (!micAllowed()) return stream.getTracks().forEach((t) => t.stop())
      mic = { track, stop: client.shareMedia(stream) }
    } catch {
      mic = null
    }
    queue()
  }

  const state = () => {
    const s = client.state
    const me = s.session_id
    return {
      type: 'hands:viewer-state',
      v: 1,
      ready: s.connection.status === 'connected' && !!me,
      ended,
      admin: selectIsAdmin(s),
      hosting: selectControlling(s),
      guestsCanControl: !s.settings.locked_controls,
      playing: s.video.playing,
      muted: s.video.muted,
      volume: Math.round(s.video.volume * 100) / 100,
      chat: app.getState().side,
      messages,
      touch: client.isTouchDevice,
      micAllowed: micAllowed(),
      mic: !!mic,
      members: Object.values(s.sessions)
        .filter((m) => m.id === me || m.state.is_connected)
        .map((m) => ({
          id: m.id,
          name: m.profile.name,
          avatar: handsAvatar(m.profile.avatar),
          admin: m.profile.is_admin,
          host: m.id === s.control.host_id,
          self: m.id === me,
        })),
    }
  }
  const post = () => {
    queued = 0
    if (!parentOrigin) return
    const now = state()
    const json = JSON.stringify(now)
    if (json === last) return
    last = json
    window.parent.postMessage(now, parentOrigin)
  }
  const queue = () => (queued ||= window.setTimeout(post, 40))

  const run = (c: Command) => {
    const s = client.state
    const admin = selectIsAdmin(s)
    switch (c.cmd) {
      case 'hello':
        last = ''
        return queue()
      case 'guests-control': {
        if (!admin || typeof c.value !== 'boolean') return
        void api(neko, 'POST', '/room/settings', { locked_controls: !c.value })
        // switching guests off also takes the keyboard and mouse back from a guest who has them: the owner takes them
        const host = s.control.host_id
        if (!c.value && host && !s.sessions[host]?.profile.is_admin) void actions(neko).take()
        return
      }
      case 'pause':
        if (c.value === true) client.pause()
        else if (c.value === false) client.play().catch(() => {})
        return
      case 'chat':
        if (typeof c.value !== 'boolean') return
        app.setState({ side: c.value })
        return remember('side', c.value)
      case 'volume': {
        const v = Number(c.value)
        if (!Number.isFinite(v)) return
        client.setVolume(Math.min(1, Math.max(0, v)))
        if (v > 0 && s.video.muted) client.unmute()
        return
      }
      case 'mute':
        if (c.value === true) client.mute()
        else if (c.value === false) client.unmute()
        return
      case 'member': {
        // the participant menu (give or take control, remove), under the avatar clicked in the header
        if (typeof c.id !== 'string' || c.id === s.session_id || !s.sessions[c.id]) return
        const x = Math.min(window.innerWidth - 8, Math.max(8, Number(c.x) || 8))
        return app.setState({ menu: { x, y: 8, id: c.id } })
      }
      case 'keyboard':
        return overlay.mobileKeyboardToggle()
      case 'mic':
        return c.value === true ? void micOn() : micOff()
    }
  }
  const onMessage = (e: MessageEvent) => {
    if (e.source !== window.parent || e.source === window) return
    const c = e.data as Command
    if (!c || c.type !== 'hands:viewer-command' || c.v !== 1 || typeof c.cmd !== 'string') return
    if (parentOrigin === null) {
      if (c.cmd !== 'hello') return
      parentOrigin = e.origin
    } else if (e.origin !== parentOrigin) return
    run(c)
  }

  // The owner has no control button here: their viewer takes the free keyboard and mouse when it connects
  // and when they click the desktop. A guest's control is taken back from the participant menu only.
  const claim = () => {
    const s = client.state
    if (selectIsAdmin(s) && !s.control.host_id && s.connection.status === 'connected') client.request()
  }

  // The owner's viewer sets the desktop to its own shape (fitScreen), so the picture fills it without bars;
  // a guest never changes the screen. Debounced: a window drag resizes once, after it settles.
  let fitTimer = 0
  let fitting = false
  const fit = () => {
    window.clearTimeout(fitTimer)
    fitTimer = window.setTimeout(async () => {
      const s = client.state
      if (fitting || !selectIsAdmin(s) || s.connection.status !== 'connected') return
      const target = fitScreen(window.innerWidth, window.innerHeight)
      const now = s.screen.size
      if (!target || (Math.abs(now.width - target.width) < 16 && Math.abs(now.height - target.height) < 16)) return
      fitting = true
      try {
        await api(neko, 'POST', '/room/screen', { ...target, rate: now.rate || 30 })
      } finally {
        fitting = false
      }
    }, 500)
  }

  const unsubscribe = [
    client.store.subscribe(queue),
    app.subscribe(queue),
    client.events.on('message', (event) => event === 'chat/message' && (messages++, queue())),
    // drop the mic when control is lost or the connection is re-made (the track belonged to the old peer)
    client.store.subscribe((s) => {
      if (mic && (!micAllowed() || s.connection.status !== 'connected')) micOff()
    }),
    client.store.subscribe((s) => {
      const ready = s.connection.status === 'connected' && !!s.session_id
      if (ready) {
        wasReady = true
        window.clearTimeout(endTimer)
        endTimer = 0
        if (ended) ((ended = false), queue())
      } else if (wasReady && !endTimer && !ended && s.connection.status !== 'connecting' && !s.authenticating)
        endTimer = window.setTimeout(() => {
          const now = client.state
          endTimer = 0
          if (now.connection.status !== 'connected' && now.connection.status !== 'connecting') ((ended = true), queue())
        }, 3000)
    }),
    client.store.subscribe((s, old) => {
      const ready = s.connection.status === 'connected' && !!s.session_id
      const wasReady = old.connection.status === 'connected' && !!old.session_id
      if (ready && (!wasReady || selectIsAdmin(s) !== selectIsAdmin(old))) {
        window.setTimeout(claim, 300)
        fit()
      }
    }),
  ]
  const offClick = client.events.on('overlay.click', claim)
  window.addEventListener('message', onMessage)
  window.addEventListener('resize', fit)
  return () => {
    for (const u of unsubscribe) u()
    offClick()
    window.removeEventListener('message', onMessage)
    window.removeEventListener('resize', fit)
    window.clearTimeout(fitTimer)
    window.clearTimeout(queued)
    window.clearTimeout(endTimer)
    micOff()
  }
}
