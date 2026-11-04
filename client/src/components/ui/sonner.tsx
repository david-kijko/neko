import type { CSSProperties } from 'react'
import { Toaster as Sonner } from 'sonner'

// shadcn/ui's sonner toaster, at the top left: 290px toasts in the console's rounded dark surface with a
// coloured left edge per kind (the Hands accent, sage, amber, red), no icons (state/dialogs.ts toast())
export function Toaster() {
  return (
    <Sonner
      position="top-left"
      offset={{ top: 50, left: 5 }}
      mobileOffset={{ top: 50, left: 5 }}
      gap={5}
      expand
      visibleToasts={9}
      style={{ '--width': '290px' } as CSSProperties}
      icons={{ info: null, success: null, warning: null, error: null }}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            'rounded-hands-md border border-l-4 border-background-accent bg-background-floating px-3.5 py-2.5 text-[13px] text-text-normal shadow-elevation-high',
          title: 'font-semibold',
          description: 'mt-0.5 text-text-muted',
          info: 'border-l-style-primary',
          success: 'border-l-[#a4b986]',
          warning: 'border-l-[#f3aa78]',
          error: 'border-l-style-error',
        },
      }}
    />
  )
}
