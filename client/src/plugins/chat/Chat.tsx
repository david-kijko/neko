import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useStore } from 'zustand'
import { useShallow } from 'zustand/react/shallow'
import { useTranslation } from 'react-i18next'
import { useActions } from '@/state/actions'
import { selectMuted } from '@/state/app'
import { useNeko } from '@/state/provider'
import { cn } from '@/lib/utils'
import { Avatar } from '@/components/Avatar'
import { chat } from './store'
import { sendChat } from './actions'
import { loadEmoji } from './emoji'
import { Markdown } from './Markdown'

const time = (d: Date) =>
  d.toDateString() === new Date().toDateString()
    ? `Today at ${d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`
    : d.toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })

const MAX_MESSAGE = 512
// a line of the history: a message (an avatar and the content) or an event
const line = 'flex flex-1 flex-row flex-nowrap overflow-hidden pt-2.5 pr-2.5 pl-3 wrap-break-word select-text'

export function Chat() {
  const { t } = useTranslation()
  const neko = useNeko()
  const { client } = neko
  const actions = useActions()
  const sessions = useStore(client.store, (s) => s.sessions)
  const muted = useStore(client.store, selectMuted)
  const store = chat(neko)
  const { lines, enabled } = useStore(
    store,
    useShallow((s) => ({ lines: s.lines, enabled: s.enabled })),
  )
  const [text, setText] = useState('')
  const history = useRef<HTMLUListElement>(null)
  const input = useRef<HTMLTextAreaElement>(null)

  useEffect(() => loadEmoji(store), [store])
  const last = lines[lines.length - 1]?.seq
  useLayoutEffect(() => {
    history.current!.scrollTop = history.current!.scrollHeight
  }, [last])

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== 'Enter' || e.shiftKey || e.nativeEvent.isComposing) return
    e.preventDefault()
    if (!text.trim()) return
    sendChat(neko, text)
    setText('')
  }

  const nameOf = (m: (typeof lines)[number]) => sessions[m.id]?.profile.name ?? m.name
  return (
    <div className="flex max-h-full max-w-full flex-1 flex-col overflow-x-hidden" data-testid="chat">
      <ul
        className="max-w-full flex-1 overflow-x-hidden overflow-y-scroll selection:bg-style-primary/40 [scrollbar-color:var(--color-background-accent)_transparent] [scrollbar-width:thin]"
        ref={history}
      >
        {lines.map((m, i) => {
          const bulk = i > 0 && lines[i - 1].id === m.id && lines[i - 1].type === 'text'
          return m.type === 'text' ? (
            <li
              key={m.seq}
              className={cn(line, 'text-[14px] leading-[1.45]', bulk ? 'pt-0.5' : 'pt-3.5')}
              data-testid="chat-message"
            >
              <div
                className={cn('mr-2.5 h-9 w-9 shrink-0 grow-0 overflow-hidden rounded-full', bulk && 'invisible h-0')}
                data-testid="chat-author"
                onContextMenu={(e) => actions.openMenu(e, m.id)}
              >
                <Avatar seed={nameOf(m)} avatar={sessions[m.id]?.profile.avatar} size={36} />
              </div>
              <div className="flex min-w-0 flex-1 flex-col wrap-break-word">
                {!bulk && (
                  <div className="mb-[3px] block w-full cursor-default">
                    <span className="inline-block font-semibold text-text-normal">{nameOf(m)}</span>
                    {/* the legacy 0.7rem and 0.3rem at a 14px root */}
                    <span
                      className="ml-1.5 inline-block text-[11px] leading-3 font-medium text-text-muted first-letter:uppercase"
                      data-testid="chat-time"
                    >
                      {time(m.created)}
                    </span>
                  </div>
                )}
                <Markdown source={m.content} />
              </div>
            </li>
          ) : (
            <li key={m.seq} className={cn(line, 'cursor-default text-text-muted')} data-testid="chat-event">
              <div className="inline-block min-w-0 align-baseline leading-5 wrap-break-word" title={time(m.created)}>
                <strong className="font-semibold">{m.name}</strong> {m.content}
              </div>
            </li>
          )
        })}
      </ul>
      {enabled && !muted && (
        <div className="flex h-[86px] max-h-[86px] shrink-0 flex-col px-2.5 pt-2 pb-2.5">
          <div className="relative flex h-full w-full flex-1 rounded-hands-md border border-background-accent bg-background-tertiary transition-colors focus-within:border-style-primary">
            <textarea
              ref={input}
              className="mx-3 my-2.5 flex-1 resize-none border-0 bg-transparent text-[14px] leading-[1.4] text-text-normal caret-style-primary outline-hidden selection:bg-style-primary/40 placeholder:text-text-muted focus-visible:outline-0 [scrollbar-color:var(--color-background-accent)_transparent] [scrollbar-width:thin]"
              data-testid="chat-input"
              placeholder={t('chat:send_a_message')}
              maxLength={MAX_MESSAGE}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={onKeyDown}
            />
          </div>
        </div>
      )}
    </div>
  )
}
