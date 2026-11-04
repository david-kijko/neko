import { useState } from 'react'
import { useStore } from 'zustand'
import { useTranslation } from 'react-i18next'
import { ChatCircleDotsIcon } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { useApp, useNeko } from '@/state/provider'
import { remember } from '@/state/storage'
import { IconButton } from '@/components/IconButton'
import { useSlot } from '@/plugins'
import { EachHook } from '@/components/EachHook'
import { HandsBrand } from '@/components/HandsBrand'

const zero = () => 0

export function Header() {
  const { app } = useNeko()
  const side = useStore(app, (s) => s.side)
  const items = useSlot('header.item')
  const tabs = useSlot('side.tab')

  return (
    <div className="flex flex-1 flex-row items-center">
      <a
        href="https://gethands.nl"
        title="Hands"
        target="_blank"
        rel="noreferrer"
        className="ml-5 flex min-w-0 flex-1 max-sm:ml-3 items-center justify-start"
      >
        <HandsBrand compact />
      </a>
      <ul className="mr-2.5 flex shrink-0 items-center gap-1.5 whitespace-nowrap max-sm:mr-1">
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
