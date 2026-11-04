// The Hands avatars a person can pick during sign-up (get-hands-app public/assets/hand-avatars), shipped with
// this client in public/hands-avatars so they load from the Computer's own origin. Hands sets a member's
// profile.avatar to `hands:<colour>`; anything else (empty, unknown, an outside URL) shows the neutral
// Hands logo, so no image is ever fetched from another site.
const HANDS_AVATARS = ['logo', 'cream', 'night', 'sage', 'orange'] as const
type HandsAvatar = (typeof HANDS_AVATARS)[number]

export function handsAvatar(avatar?: string): HandsAvatar {
  const colour = /^hands:([a-z]+)$/.exec(avatar ?? '')?.[1]
  return HANDS_AVATARS.find((a) => a === colour) ?? 'logo'
}

export function Avatar({ seed, avatar, size }: { seed: string; avatar?: string; size: number }) {
  const colour = handsAvatar(avatar)
  return (
    <span
      className="inline-block shrink-0 overflow-hidden rounded-full bg-background-secondary align-middle select-none"
      style={{ width: size, height: size }}
      data-avatar={colour}
    >
      <img
        src={`${import.meta.env.BASE_URL}hands-avatars/hands-${colour}.png`}
        alt={seed}
        width={size}
        height={size}
        draggable={false}
        className="block h-full w-full object-cover"
      />
    </span>
  )
}
