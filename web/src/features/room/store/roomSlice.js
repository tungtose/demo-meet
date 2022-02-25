
export const roomSlice = (set, get) => ({
  roomId: null,
  peerId: null,
  isShareScreen: false,
  roomMessages: [],
  nullify: () =>
    set({
      roomId: null,
      peerId: null,
      isShareScreen: false,
      roomMessages: [],
    }),

  setRoomId: roomId => {
    set(state => ({ ...state, roomId }));
  },
  setIsShareScreen: isShareScreen => {
    set(state => ({ ...state, isShareScreen }))
  },
  setPeerId: peerId => {
    set(state => ({ ...state, peerId }));
  },
  addNewMessage: message => {
    const { roomMessages } = get();
    set(state => ({ ...state, roomMessages: [...roomMessages, message] }));
  },
  initRoomMessages: roomMessages => {
    set(state => ({ ...state, roomMessages }));
  }
});
