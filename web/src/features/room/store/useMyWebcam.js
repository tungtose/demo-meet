import create from 'zustand';
import { combine } from 'zustand/middleware';

export const useMyWebcamStore = create(
  combine(
    {
      track: null
    },
    set => ({
      addTrack: (track) => {
        set(state => {
          return {
            ...state, track
          }
        });
      }
    })
  )
);
