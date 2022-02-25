import create from 'zustand';
import { combine } from 'zustand/middleware';

export const producerSlice = (set, get) => ({
  camProducer: null,
  micProducer: null,
  screenProducer: null,

  addScreenProducer: producer => {
    set(state => {
      if (state.screenProducer && !state.screenProducer.closed) {
        state.screenProducer.close()
      }
      return { screenProducer: producer };
    })
  },

  closeScreenProducer: () =>
    set(state => {
      if (state.screenProducer && !s.producer.closed) {
        s.producer.close();
      }
      return {
        screenProducer: null
      };
    }),
})
