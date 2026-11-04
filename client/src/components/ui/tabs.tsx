import type { ComponentProps } from 'react'
import * as TabsPrimitive from '@radix-ui/react-tabs'
import { cn } from '@/lib/utils'

// shadcn/ui tabs on Radix (the side panel): real buttons with role=tab, arrow keys between them
function Tabs(props: ComponentProps<typeof TabsPrimitive.Root>) {
  return <TabsPrimitive.Root data-slot="tabs" {...props} />
}

function TabsList({ className, ...props }: ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn('m-2.5 flex max-w-full shrink-0 gap-1 rounded-hands-md bg-background-tertiary p-1', className)}
      {...props}
    />
  )
}

function TabsTrigger({ className, ...props }: ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        'inline-flex min-w-0 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-hands-sm px-3 py-2 text-[13px] font-semibold text-interactive-normal transition-colors hover:text-interactive-hover focus-visible:outline-2 focus-visible:outline-style-primary data-[state=active]:bg-background-secondary data-[state=active]:text-text-normal data-[state=active]:shadow-elevation-low',
        className,
      )}
      {...props}
    />
  )
}

function TabsContent({ className, ...props }: ComponentProps<typeof TabsPrimitive.Content>) {
  return <TabsPrimitive.Content data-slot="tabs-content" className={cn('outline-hidden', className)} {...props} />
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
