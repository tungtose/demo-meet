import { MyRooms } from "./RoomState";

export const deleteRoom = (roomId: string, rooms: MyRooms) => {
  if (!(roomId in rooms)) {
    return;
  }

  delete rooms[roomId];
};
