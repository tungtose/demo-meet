import useStore from './store';

export const loadDevice = async (routerRtpCapabilities: any) => {
  const { device } = useStore.getState();
  if (!device?.loaded) {
    await device.load({ routerRtpCapabilities });
  }
};
