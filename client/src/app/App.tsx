import { useEffect } from 'react'
import { useStore } from 'zustand'
import { IconContext } from '@phosphor-icons/react'
import { useShallow } from 'zustand/react/shallow'
import { useTranslation } from 'react-i18next'
import { useNeko } from '@/state/provider'
import { useSlot } from '@/plugins'
import { WebRTCTransport } from '@m1k1o/neko'
import { cn } from '@/lib/utils'
import { HandsBrand } from '@/components/HandsBrand'
import { Dialog } from '@/components/Dialog'
import { Toaster } from '@/components/ui/sonner'
import { Header } from '@/layout/Header'
import { Side } from '@/layout/Side'
import { RoomBar } from '@/layout/RoomBar'
import { Stage } from '@/features/video/Stage'
import { MemberMenu } from '@/features/members/MemberMenu'
import { Connect } from '@/features/connect/Connect'
import { embedded } from './embed'
import { startConsoleBridge } from './consoleBridge'

const params = new URL(location.href).searchParams
const cast = !!params.get('cast')
const videoOnly = cast || !!params.get('embed')

export function App() {
  const { t } = useTranslation()
  const neko = useNeko()
  const { client, app } = neko
  const connected = useStore(client.store, (s) => s.connection.status === 'connected')
  const side = useStore(app, (s) => s.side)
  const memberMenu = useSlot('member.menu')
  useEffect(() => startConsoleBridge(neko), [neko])

  if (!WebRTCTransport.supported()) {
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-[320px] rounded-[5px] bg-background-secondary p-2.5">
          <div className="flex w-full items-center justify-center">
            <HandsBrand />
          </div>
          <div className="flex flex-col">
            <span className="block text-center leading-7.5 uppercase">{t('unsupported')}</span>
          </div>
        </div>
      </div>
    )
  }

  // inside the Hands console: the desktop fills the frame and the console's header has the controls; the
  // chat opens as a drawer over the right side of the desktop, so the desktop keeps its size
  if (embedded && !videoOnly) {
    return (
      <IconContext.Provider value={{ weight: 'fill' }}>
        <div id="neko" className="absolute inset-0 overflow-hidden bg-black">
          <div className="video-container absolute inset-0">
            <Stage hideControls={false} extraControls={false} consoleMode />
          </div>
          <MemberMenu items={memberMenu} />
          {side && <Side drawer />}
          {!connected && <Connect />}
          <Dialog />
        </div>
      </IconContext.Provider>
    )
  }

  const expanded = !videoOnly && side
  return (
    // every icon filled, as in the v2 client (phosphor defaults to the outline `regular` weight)
    <IconContext.Provider value={{ weight: 'fill' }}>
      <div
        id="neko"
        className="tablet:relative tablet:max-h-none tablet:flex-col absolute inset-0 flex max-h-[100vh] max-w-[100vw]"
      >
        <main
          className={cn(
            'flex min-w-0 max-w-full grow flex-col overflow-auto',
            expanded ? 'tablet:portrait:h-[40vh] tablet:landscape:h-screen' : 'tablet:h-screen',
          )}
        >
          {!videoOnly && (
            <div className="flex h-menu shrink-0 bg-background-tertiary max-sm:h-12" data-testid="header">
              <Header />
            </div>
          )}
          {/* .video-container: index.html sizes it before the app renders (iOS) */}
          <div className="video-container flex max-w-full grow bg-black/40">
            <Stage hideControls={cast} extraControls={videoOnly} consoleMode={false} />
          </div>
          {!videoOnly && <RoomBar />}
        </main>
        {!videoOnly && <MemberMenu items={memberMenu} />}
        {expanded && <Side />}
        {!connected && <Connect />}
        {!videoOnly && <Toaster />}
        <Dialog />
      </div>
    </IconContext.Provider>
  )
}
