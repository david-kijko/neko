import logo from '@/assets/images/hands-mark.png'
import { cn } from '@/lib/utils'

export function HandsBrand({ compact = false }: { compact?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5" data-testid="hands-brand">
      <img src={logo} alt="Hands" className={cn('shrink-0 object-contain', compact ? 'size-7.5' : 'size-[72px]')} />
      <span
        aria-hidden="true"
        className={cn('font-brand leading-none text-[#f3eadb]', compact ? 'text-[24px]' : 'text-[32px]')}
      >
        Hands
      </span>
    </span>
  )
}
