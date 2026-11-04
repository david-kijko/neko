import { Members } from '@/features/members/Members'
import { RoomMenu } from '@/features/room-menu/RoomMenu'
import { Controls } from '@/features/controls/Controls'

// the bar under the video: the members, then the room menu and the controls in a three-column grid
// (the controls stay centred; the right column is empty); not shown on a phone
export function RoomBar() {
  return (
    <div
      className="phone:hidden flex h-controls max-w-full shrink-0 flex-col bg-background-tertiary"
      data-testid="room-bar"
    >
      <Members />
      <div className="grid max-w-full flex-1 grid-cols-3">
        <RoomMenu />
        <Controls />
      </div>
    </div>
  )
}
