import { getSafeRoomImage } from "../utils/roomMedia";

export default function RoomDetails({ room }) {
  return (
    <div className="w-full rounded-xl bg-[#edf7ff] p-6 shadow dark:bg-[#0f1f33] dark:ring-1 dark:ring-white/10">
      <div className="w-full overflow-hidden rounded-xl aspect-[4/3]">
        <img
          src={getSafeRoomImage(room)}
          alt={room.roomName || "room"}
          onError={(e) => {
            e.currentTarget.src = getSafeRoomImage({ type: room?.type });
          }}
          className="h-full w-full object-cover"
        />
      </div>
    </div>
  );
}
