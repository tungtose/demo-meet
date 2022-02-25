import create from 'zustand';
import produce from 'immer';
import { rtcSlice } from './rtcSlice';
import { consumerSlice } from './consumerSlice';
import { roomSlice } from './roomSlice';
import { producerSlice } from './producerSlice';

const immer = config => (set, get, api) =>
  config(
    (partial, replace) => {
      const nextState = typeof partial === 'function' ? produce(partial) : partial;
      return set(nextState, replace);
    },
    get,
    api
  );

const log = config => (set, get, api) =>
  config(
    args => {
      console.log('  applying', args);
      set(args);
      console.log('  new state', get());
    },
    get,
    api
  );

export const useStore = create(
  log(
    immer((set, get) => ({
      ...rtcSlice(set, get),
      ...consumerSlice(set, get),
      ...roomSlice(set, get),
      ...producerSlice(set, get)
    }))
  )
);

export default useStore;
