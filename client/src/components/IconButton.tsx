import type { ComponentProps } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const iconButton = cva(
  'inline-flex cursor-pointer items-center justify-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-style-primary aria-disabled:cursor-default aria-disabled:opacity-60 aria-disabled:hover:bg-transparent',
  {
    variants: {
      variant: {
        // the icon alone: the chat, the files
        plain: '',
        // the room bar under the video: the console's rounded icon buttons (36px, 9px corners)
        bar: 'h-9 min-w-9 rounded-hands-sm px-1.5 text-interactive-normal transition-colors hover:bg-background-secondary hover:text-interactive-hover max-sm:h-11 max-sm:min-w-11',
        // the header menu: a 32px rounded box, like the console's toolbar buttons
        header:
          'flex h-8 w-8 rounded-hands-sm text-interactive-normal transition-colors hover:bg-background-secondary hover:text-interactive-hover max-sm:h-11 max-sm:w-11',
        // the menus over the video: a dark rounded 32px box that stays readable on any desktop picture
        video:
          'h-8 w-8 rounded-hands-sm border border-white/10 bg-background-tertiary/75 text-text-normal/80 transition-colors hover:bg-background-secondary hover:text-text-normal max-sm:h-11 max-sm:w-11',
      },
    },
    defaultVariants: { variant: 'plain' },
  },
)

// An icon control: a real button, so Enter, Space and focus come for free, named by its label
// (the accessible name and the tooltip); the icon is the child.
export function IconButton({
  label,
  variant,
  className,
  ...props
}: { label: string } & VariantProps<typeof iconButton> & Omit<ComponentProps<'button'>, 'aria-label' | 'title'>) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn(iconButton({ variant }), className)}
      {...props}
    />
  )
}
