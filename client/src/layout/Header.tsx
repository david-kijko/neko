import { useState, type ReactNode } from 'react'
import { useStore } from 'zustand'
import { selectIsAdmin } from '@m1k1o/neko'
import { useTranslation } from 'react-i18next'
import { ChatCircleDotsIcon, LockIcon, LockOpenIcon, MouseIcon } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { useActions } from '@/state/actions'
import { isLocked, type LockResource } from '@/state/app'
import { useApp, useNeko } from '@/state/provider'
import { remember } from '@/state/storage'
import { IconButton } from '@/components/IconButton'
import { useSlot } from '@/plugins'
import { EachHook } from '@/components/EachHook'
import { HandsBrand } from '@/components/HandsBrand'

const zero = () => 0
// Inside the Hands console the page already shows the Hands brand above this frame; a guest who opened an
// invitation link has the viewer as the whole page and keeps it.
const embedded = (() => {
  try {
    return window.self !== window.top
  } catch {
    return true
  }
})()

export function Header() {
  const { t } = useTranslation()
  const { client, app } = useNeko()
  const actions = useActions()
  const admin = useStore(client.store, selectIsAdmin)
  const settings = useStore(client.store, (s) => s.settings)
  const side = useStore(app, (s) => s.side)
  const items = useSlot('header.item')
  const tabs = useSlot('side.tab')

  // a lock: admins toggle it, users only see its state
  const lock = (r: LockResource, icon: ReactNode) => {
    const locked = isLocked(r, settings)
    const tip = admin
      ? t(`locks.${r}.${locked ? 'unlock' : 'lock'}`)
      : t(`locks.${r}.${locked ? 'locked' : 'unlocked'}`)
    return (
      <li className="inline-flex">
        <IconButton
          variant="header"
          label={tip}
          className={cn(locked && 'text-style-error')}
          data-testid={`lock-${r}`}
          data-locked={locked || undefined}
          aria-disabled={!admin}
          onClick={() => admin && actions.toggleLock(r)}
        >
          {icon}
        </IconButton>
      </li>
    )
  }

  return (
    <div className="flex flex-1 flex-row items-center">
      {embedded ? (
        <span className="flex-1" />
      ) : (
        <a
          href="https://gethands.nl"
          title="Hands"
          target="_blank"
          rel="noreferrer"
          className="ml-5 flex min-w-0 flex-1 max-sm:ml-3 items-center justify-start"
        >
          <HandsBrand compact />
        </a>
      )}
      <ul className="mr-2.5 flex shrink-0 items-center gap-1.5 whitespace-nowrap max-sm:mr-1">
        {lock('control', <MouseIcon className="size-4" />)}
        {lock(
          'login',
          isLocked('login', settings) ? <LockIcon className="size-4" /> : <LockOpenIcon className="size-4" />,
        )}
        {items.map(({ id, component: Item }) => (
          <Item key={id} />
        ))}
        {/* what the side panel has to show, for the badge on its toggle */}
        <EachHook items={tabs} use={(tab) => tab.useBadge ?? zero}>
          {(counts) => <Toggle side={side} unread={counts.reduce((n, c) => n + c, 0)} />}
        </EachHook>
      </ul>
    </div>
  )
}

// the side panel's toggle, with a badge when the unread count changed while the panel was closed
function Toggle({ side, unread }: { side: boolean; unread: number }) {
  const app = useApp()
  const [read, setRead] = useState(unread)
  return (
    <li className="relative inline-flex">
      {!side && read !== unread && (
        <span className="pointer-events-none absolute top-0.5 right-0.5 z-10 size-2.5 rounded-full border-2 border-background-tertiary bg-style-primary" />
      )}
      <IconButton
        variant="header"
        label="Chat"
        className={cn(side && 'bg-background-secondary text-text-normal')}
        data-testid="side-toggle"
        aria-expanded={side}
        onClick={() => {
          app.setState({ side: !side })
          remember('side', !side)
          setRead(unread)
        }}
      >
        <ChatCircleDotsIcon className="size-5" />
      </IconButton>
    </li>
  )
}
