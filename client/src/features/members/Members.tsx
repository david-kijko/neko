import { useStore } from 'zustand'
import { useShallow } from 'zustand/react/shallow'
import { selectSession } from '@m1k1o/neko'
import { useTranslation } from 'react-i18next'
import { CrownIcon, ShieldIcon } from '@phosphor-icons/react'
import { useActions } from '@/state/actions'
import type { NekoApp } from '@/state/app'
import { useNeko } from '@/state/provider'
import { Avatar } from '@/components/Avatar'

// keyboard equivalent of right-click: the Menu key or Shift+F10 on a focused member
const menuKey = ({ client, app }: NekoApp, e: React.KeyboardEvent, id: string) => {
  if (e.key !== 'ContextMenu' && !(e.shiftKey && e.key === 'F10')) return
  e.preventDefault()
  e.stopPropagation()
  const r = (e.currentTarget as HTMLElement).getBoundingClientRect()
  if (id !== client.state.session_id) app.setState({ menu: { x: r.left, y: r.bottom, id } })
}

// a participant: their Hands avatar and their name in a rounded pill, like the console's chips
const member =
  'relative flex h-10 max-w-[200px] items-center gap-2 rounded-full bg-background-secondary py-1 pr-3.5 pl-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-style-primary'
const nameClass = 'min-w-0 truncate text-[13px] font-semibold text-text-normal'
// the badges after the name: the host (a crown, in the accent colour), an admin (a shield), you (a word)
const badge = 'size-4 shrink-0 text-style-primary'
const you = 'shrink-0 text-[12px] font-medium text-text-muted'

export function Members() {
  const { t } = useTranslation()
  const neko = useNeko()
  const { client } = neko
  const actions = useActions()
  const { me, hostId, sessions, sessionId } = useStore(
    client.store,
    useShallow((s) => ({
      me: selectSession(s),
      hostId: s.control.host_id,
      sessions: s.sessions,
      sessionId: s.session_id,
    })),
  )
  return (
    <div className="flex min-h-[64px] flex-1 items-center overflow-x-auto overflow-y-hidden px-5 [scrollbar-color:var(--color-background-accent)_var(--color-background-tertiary)] [scrollbar-width:thin]">
      <ul className="mx-auto flex items-center gap-2 whitespace-nowrap" data-testid="members">
        {me && (
          <li className="flex" title={me.profile.name}>
            <div className={member} data-testid="member" data-self data-host={me.id === hostId || undefined}>
              <Avatar seed={me.profile.name} avatar={me.profile.avatar} size={32} />
              <span className={nameClass} data-testid="member-name">
                {me.profile.name}
              </span>
              <span className={you}>({t('you')})</span>
              {me.id === hostId && <CrownIcon className={badge} aria-label="Host" />}
            </div>
          </li>
        )}
        {Object.values(sessions)
          .filter((m) => m.id !== sessionId && m.state.is_connected)
          .map((m) => (
            <li key={m.id} className="flex" title={m.profile.name}>
              <div
                className={member}
                data-testid="member"
                data-host={m.id === hostId || undefined}
                tabIndex={0}
                aria-label={m.profile.name}
                aria-haspopup="menu"
                onContextMenu={(e) => actions.openMenu(e, m.id)}
                onKeyDown={(e) => menuKey(neko, e, m.id)}
              >
                <Avatar seed={m.profile.name} avatar={m.profile.avatar} size={32} />
                <span className={nameClass} data-testid="member-name">
                  {m.profile.name}
                </span>
                {m.profile.is_admin && <ShieldIcon className={badge} aria-label="Admin" />}
                {m.id === hostId && <CrownIcon className={badge} aria-label="Host" />}
              </div>
            </li>
          ))}
      </ul>
    </div>
  )
}
