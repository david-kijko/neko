import { useEffect } from 'react'
import { useStore } from 'zustand'
import { useTranslation } from 'react-i18next'
import { SlidersHorizontalIcon } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { useApp } from '@/state/provider'
import { remember } from '@/state/storage'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Settings } from '@/features/settings/Settings'
import { useSlot } from '@/plugins'
import type { PluginTab } from '@/plugins/types'
import { EachHook } from '@/components/EachHook'

// after the plugins' tabs
const settingsTab: PluginTab = {
  id: 'settings',
  icon: SlidersHorizontalIcon,
  label: 'side.settings',
  component: Settings,
}
const always = () => true

export function Side({ drawer = false }: { drawer?: boolean }) {
  const tabs = [...useSlot('side.tab'), settingsTab]
  useEffect(() => {
    if (!drawer) document.querySelector('aside')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [drawer])

  return (
    <EachHook items={tabs} use={(tab) => tab.useVisible ?? always}>
      {(visible) => <Panel tabs={tabs.filter((_, i) => visible[i])} drawer={drawer} />}
    </EachHook>
  )
}

// the tabs available now
function Panel({ tabs, drawer }: { tabs: PluginTab[]; drawer: boolean }) {
  const { t } = useTranslation()
  const app = useApp()
  const wanted = useStore(app, (s) => s.tab)
  // a remembered tab that is not available now falls back to the first one
  const tab = tabs.some((x) => x.id === wanted) ? wanted : tabs[0].id
  const Page = tabs.find((x) => x.id === tab)!.component

  return (
    <Tabs value={tab} onValueChange={(id) => (app.setState({ tab: id }), remember('tab', id))} asChild>
      <aside
        className={cn(
          'flex max-h-full max-w-full shrink-0 flex-col bg-background-primary',
          drawer
            ? 'absolute inset-y-0 right-0 z-20 w-[min(360px,100%)] border-l border-background-accent shadow-elevation-high'
            : 'tablet:w-full tablet:portrait:h-[60vh] tablet:landscape:h-screen w-side border-l border-background-secondary tablet:border-t tablet:border-l-0',
        )}
        data-testid="side"
      >
        <TabsList data-testid="tabs">
          {tabs.map(({ id, icon: Icon, label }) => (
            <TabsTrigger key={id} value={id}>
              <Icon className="size-[18px] shrink-0" />
              <span className="truncate">{t(label)}</span>
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value={tab} className="flex max-h-full grow overflow-auto">
          <Page />
        </TabsContent>
      </aside>
    </Tabs>
  )
}
