import { useEffect } from 'react'
import { useStore } from 'zustand'
import { useShallow } from 'zustand/react/shallow'
import { useTranslation } from 'react-i18next'
import { actions } from '@/state/actions'
import type { NekoApp } from '@/state/app'
import { tell } from '@/state/dialogs'
import { useNeko } from '@/state/provider'
import { i18n } from '@/i18n'
import { Button } from '@/components/ui/button'
import { HandsBrand } from '@/components/HandsBrand'
import { embedded } from '@/lib/embed'

const params = new URL(location.href).searchParams
// ?pwd= invite (e.g. neko-rooms links): used for the first login attempt only, like the legacy
// client; after that the form asks for a password, so a stale invite is not a dead end
let invite = params.get('pwd')
const loginOnce = (neko: NekoApp, user: string, password: string) =>
  actions(neko)
    .login(user, password)
    .catch((err) => tell(neko.app, i18n.t('connect.error'), err.message))
    .finally(() => (invite = null))

// the connecting card; a lost connection (with Reconnect) or an ended session; never a sign-in form
export function Connect() {
  const { t } = useTranslation()
  const neko = useNeko()
  const { client, app } = neko
  const { status, authenticated, authenticating } = useStore(
    client.store,
    useShallow((s) => ({
      status: s.connection.status,
      authenticated: s.authenticated,
      authenticating: s.authenticating,
    })),
  )

  useEffect(() => {
    // ?usr=&pwd= (e.g. neko-rooms links) log in straight away, then leave the URL
    if (invite !== null || params.has('usr') || params.has('token')) {
      const url = new URL(location.href)
      for (const k of ['pwd', 'usr', 'token']) url.searchParams.delete(k)
      history.replaceState(null, '', url)
    }
    // always, even if a saved session is being resumed at the same time: the link wins
    // (login() drops the resumed websocket), and this must not depend on which answer is first
    if (invite && params.get('usr')) void loginOnce(neko, params.get('usr')!, invite)
  }, [neko, client])

  // inside the console the viewer never asks anyone to log in: it shows the connecting card, and when the
  // session is gone the console closes it and shows its own start screen (app/consoleBridge.ts 'ended')
  const connecting = embedded || authenticating || status === 'connecting'
  const dutch = navigator.language.toLowerCase().startsWith('nl')
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background-floating/80" data-testid="connect">
      <div className="w-[320px] max-w-[calc(100%-32px)] rounded-[14px] bg-background-secondary p-2.5">
        <div className="flex w-full items-center justify-center py-2.5">
          <HandsBrand />
        </div>
        {connecting ? (
          <div className="relative mx-auto h-[90px] w-[90px]">
            <div className="absolute top-0 left-0 h-full w-full animate-loader rounded-full bg-[#ff5000] opacity-60"></div>
            <div className="absolute top-0 left-0 h-full w-full animate-loader rounded-full bg-[#ff5000] opacity-60 [animation-delay:-1s]"></div>
          </div>
        ) : authenticated ? (
          // logged in but the connection is gone for good (the core gave up reconnecting): try again
          <div className="flex flex-col items-center px-2 pb-2.5 text-center">
            <span className="block leading-6">
              {dutch ? 'De verbinding is verbroken.' : 'The connection was lost.'}
            </span>
            <Button className="my-[5px] w-full" type="button" onClick={() => client.connect()}>
              {dutch ? 'Opnieuw verbinden' : 'Reconnect'}
            </Button>
          </div>
        ) : (
          // Hands viewers sign in through the Hands invitation or the console, never with a form here: without a
          // session the desktop has been closed (End) or the invitation has run out
          <div className="px-2 pb-3 text-center leading-6" data-testid="session-ended">
            {dutch
              ? 'Deze sessie is beëindigd. Vraag de eigenaar om een nieuwe uitnodiging of open Computer opnieuw in Hands.'
              : 'This session has ended. Ask the owner for a new invitation, or open Computer again in Hands.'}
          </div>
        )}
      </div>
    </div>
  )
}
