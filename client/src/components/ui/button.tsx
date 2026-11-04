import type { ComponentProps } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

// shadcn/ui's button with the variants of the legacy client's text buttons
const buttonVariants = cva(
  'inline-flex cursor-pointer items-center justify-center border-0 text-center focus-visible:outline-2 focus-visible:outline-style-primary',
  {
    variants: {
      variant: {
        // connect, settings, about, the broadcast controls
        primary:
          'rounded-hands-sm bg-style-primary px-3 py-1 leading-7.5 font-semibold text-background-tertiary hover:brightness-105',
        // the OAuth login
        outline:
          'rounded-hands-sm border border-style-primary bg-background-tertiary px-3 py-1 leading-7.5 font-semibold text-text-normal',
        // the dialog's confirm and cancel
        confirm:
          'rounded-hands-sm bg-style-primary px-[2em] py-[0.625em] text-[1.0625em] font-semibold text-background-tertiary',
        cancel:
          'rounded-hands-sm bg-background-secondary px-[2em] py-[0.625em] text-[1.0625em] font-semibold text-text-normal',
      },
    },
    defaultVariants: { variant: 'primary' },
  },
)

function Button({ className, variant, ...props }: ComponentProps<'button'> & VariantProps<typeof buttonVariants>) {
  return <button data-slot="button" className={cn(buttonVariants({ variant }), className)} {...props} />
}

export { Button, buttonVariants }
