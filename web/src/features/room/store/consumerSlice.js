import omit from 'lodash.omit';

export const consumerSlice = (set, get) => ({
  audioConsumerMap: {},
  videoConsumerMap: {},
  sharescreenConsumer: null,

  setAudioRef: (userId, audioRef) => {
    set(s => {
      if (userId in s.audioConsumerMap) {
        return {
          audioConsumerMap: {
            ...s.audioConsumerMap,
            [userId]: {
              ...s.audioConsumerMap[userId],
              audioRef
            }
          }
        };
      }
    });
  },
  setVolume: (userId, volume) => {
    set(s =>
      userId in s.audioConsumerMap
        ? {
          audioConsumerMap: {
            ...s.audioConsumerMap,
            [userId]: {
              ...s.audioConsumerMap[userId],
              volume
            }
          }
        }
        : s
    );
  },
  addSharescreenConsumer: (consumer, userId) => {
    set(state => {
      return {
        ...state,
        sharescreenConsumer: consumer,
      }
    })
  },
  addAudioConsumer: (c, userId) =>
    set(s => {
      let volume = 100;
      if (userId in s.audioConsumerMap) {
        const x = s.audioConsumerMap[userId];
        volume = x.volume;
        x.consumer.close();
      }
      return {
        audioConsumerMap: {
          ...s.audioConsumerMap,
          [userId]: { consumer: c, volume }
        }
      };
    }),
  addVideoConsumer: (c, userId) =>
    set(s => {
      if (userId in s.videoConsumerMap) {
        s.videoConsumerMap[userId].consumer.close();
      }
      return {
        videoConsumerMap: {
          ...s.videoConsumerMap,
          [userId]: { consumer: c }
        }
      };
    }),
  closeAll: () =>
    set(s => {
      Object.values(s.videoConsumerMap).forEach(({ consumer: c }) => !c.closed && c.close());
      Object.values(s.audioConsumerMap).forEach(({ consumer: c }) => !c.closed && c.close());
      return {
        videoConsumerMap: {},
        audioConsumerMap: {}
      };
    }),

  closePeer: peerId => {
    set(state => {
      const videoConsumer = state.videoConsumerMap[peerId]?.consumer;
      const audioConsumer = state.audioConsumerMap[peerId]?.consumer;

      if (!videoConsumer || !audioConsumer) return;
      // Close consumer
      !videoConsumer?.closed && videoConsumer.close();
      !audioConsumer?.closed && audioConsumer.close();

      // Then remove
      return {
        videoConsumerMap: omit(state.videoConsumerMap, peerId),
        audioConsumerMap: omit(state.audioConsumerMap, peerId)
      };
    });
  }
});

