import { useEffect, useRef, useState } from 'react'
import { useStore } from 'zustand'
import { useShallow } from 'zustand/react/shallow'
import { selectControlling, selectIsAdmin, selectSession } from '@m1k1o/neko'
import { useTranslation } from 'react-i18next'
import {
  CursorIcon,
  KeyboardIcon,
  MicrophoneIcon,
  MicrophoneSlashIcon,
  SpeakerHighIcon,
  SpeakerSlashIcon,
} from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { useActions } from '@/state/actions'
import { tell } from '@/state/dialogs'
import { useNeko } from '@/state/provider'
import { IconButton } from '@/components/IconButton'

export function Controls() {
  const { t } = useTranslation()
  const { client, app } = useNeko()
  const actions = useActions()
  const { admin, hosting, hosted, implicit, lockedControls, video, connected, canShareMedia } = useStore(
    client.store,
    useShallow((s) => ({
      admin: selectIsAdmin(s),
      hosting: selectControlling(s),
      hosted: s.control.host_id !== null,
      implicit: s.settings.implicit_hosting,
      lockedControls: s.settings.locked_controls,
      video: s.video,
      connected: s.connection.status === 'connected',
      canShareMedia: !!selectSession(s)?.profile.can_share_media,
    })),
  )
  const [shake, setShake] = useState(false)
  const mic = useRef<{ track: MediaStreamTrack; stop: () => void } | null>(null)
  const [micOn, setMicOn] = useState(false)

  const controlLocked = lockedControls && !admin
  const { playable, muted, volume } = video
  const micAllowed = hosting && canShareMedia && !!navigator.mediaDevices // none on plain http

  // clicking the video without control shakes the keyboard icon as a hint
  useEffect(() => {
    const hint = () => {
      if (client.controlling || client.state.settings.implicit_hosting) return
      setShake(true)
      setTimeout(() => setShake(false), 5000)
    }
    return client.events.on('overlay.click', hint)
  }, [client])

  const micOff = () => {
    if (!mic.current) return
    mic.current.stop()
    mic.current.track.stop()
    mic.current = null
    setMicOn(false)
  }
  // drop the mic when control is lost (the next host gets the audio input) and whenever the
  // connection is re-established: the track was attached to the old peer connection
  useEffect(() => {
    if (!micAllowed || !connected) micOff()
  }, [micAllowed, connected])

  const toggleMic = async () => {
    if (mic.current) return micOff()
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const track = stream.getAudioTracks()[0]
      mic.current = { track, stop: client.shareMedia(stream) }
      setMicOn(true)
    } catch (err: any) {
      tell(app, t('controls.mic_error'), err.message)
    }
  }

  return (
    <ul className="flex items-center justify-center gap-1 self-center">
      {!implicit && (!controlLocked || hosting) && (
        <li>
          <IconButton
            variant="bar"
            label={hosting ? t('controls.release') : t('controls.request')}
            className={cn(
              hosted && !hosting && 'text-style-error/60',
              !hosted && !hosting && 'text-text-normal/40',
              shake && !hosting && 'animate-shake',
            )}
            data-testid="control-request"
            onClick={() => playable && actions.toggleControl()}
          >
            <KeyboardIcon className="size-[22px]" />
          </IconButton>
        </li>
      )}
      {implicit && (
        <li
          className="px-[5px]"
          data-testid="control-implicit"
          title={t(controlLocked ? 'controls.hasnot' : 'controls.has')}
        >
          <CursorIcon className={cn('size-[22px]', controlLocked && 'text-style-error/40')} />
        </li>
      )}
      {micAllowed && (
        <li>
          <IconButton
            variant="bar"
            label={t(micOn ? 'controls.mic_off' : 'controls.mic_on')}
            className={cn(!micOn && 'text-text-normal/40')}
            data-testid="mic"
            data-on={micOn || undefined}
            onClick={toggleMic}
          >
            {micOn ? <MicrophoneIcon className="size-[22px]" /> : <MicrophoneSlashIcon className="size-[22px]" />}
          </IconButton>
        </li>
      )}
      <li>
        <div className="flex items-center justify-center whitespace-nowrap">
          <IconButton
            variant="bar"
            label={muted ? 'Unmute' : 'Mute'}
            data-testid="mute"
            onClick={() => (muted ? client.unmute() : client.mute())}
          >
            {volume === 0 || muted ? (
              <SpeakerSlashIcon className="size-[22px]" />
            ) : (
              <SpeakerHighIcon className="size-[22px]" />
            )}
          </IconButton>
          <input
            type="range"
            className="slider ml-1 h-5 w-[130px]"
            min="0"
            max="100"
            aria-label="Volume"
            value={Math.round(volume * 100)}
            onChange={(e) => client.setVolume(Number(e.target.value) / 100)}
          />
        </div>
      </li>
    </ul>
  )
}
