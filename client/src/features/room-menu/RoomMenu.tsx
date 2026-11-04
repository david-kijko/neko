import { useStore } from 'zustand'
import { selectIsAdmin } from '@m1k1o/neko'
import { useTranslation } from 'react-i18next'
import { ShieldIcon } from '@phosphor-icons/react'
import { useNeko } from '@/state/provider'
import { langs, setLang, type Lang } from '@/i18n'

// the admin badge and the language picker, left of the controls (Neko's licence ships as licenses.txt)
export function RoomMenu() {
  const { t, i18n } = useTranslation()
  const { client } = useNeko()
  const admin = useStore(client.store, selectIsAdmin)
  return (
    <ul className="ml-2.5 self-center">
      <li className="mr-2.5 inline-block align-middle">
        {admin && (
          <span className="inline-block" data-testid="admin-badge" title={t('admin_loggedin')}>
            <ShieldIcon className="size-5 text-interactive-normal" role="img" aria-label={t('admin_loggedin')} />
          </span>
        )}
      </li>
      <li className="mr-2.5 inline-block align-middle">
        <select
          className="inline-block h-8 cursor-pointer appearance-none rounded-hands-sm border border-background-accent bg-background-secondary px-2.5 align-middle text-[13px] font-semibold text-text-normal transition-colors hover:border-interactive-muted [&_option]:bg-background-floating [&_option]:font-normal [&_option]:text-text-normal"
          data-testid="lang"
          value={i18n.language}
          onChange={(e) => setLang(e.target.value as Lang)}
          aria-label="Language"
        >
          {langs.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
      </li>
    </ul>
  )
}
