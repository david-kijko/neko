// the 4 KB Hands logo: Vite inlines it as a data URL, so it shows even when the page's session is gone
import logo from '@/assets/images/hands-logo.png'
import { cn } from '@/lib/utils'

export function HandsBrand({ compact = false }: { compact?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5" data-testid="hands-brand">
      <img src={logo} alt="Hands" className={cn('shrink-0 object-contain', compact ? 'size-7.5' : 'size-[72px]')} />
      <span
        aria-hidden="true"
        className={cn(
          'font-brand leading-none text-[#f3eadb]',
          compact ? 'text-[24px] max-[360px]:hidden' : 'text-[32px]',
        )}
      >
        Hands
      </span>
    </span>
  )
}
