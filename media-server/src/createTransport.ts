import { Router, WebRtcTransport } from "mediasoup/node/lib/types";
import { config } from "./config";
import Logger from "./utils/Logger";

const log = new Logger("create-transport")

type VoiceSendDirection = "recv" | "send";

export const transportToOptions = ({
  id,
  iceParameters,
  iceCandidates,
  dtlsParameters,
}: WebRtcTransport) => ({ id, iceParameters, iceCandidates, dtlsParameters });

export type TransportOptions = ReturnType<typeof transportToOptions>;

export const createTransport = async (
  direction: VoiceSendDirection,
  router: Router,
  peerId: string
) => {
  log.info(direction);
  const {
    listenIps,
    initialAvailableOutgoingBitrate,
  } = config.mediasoup.webRtcTransport;

  const transport = await router.createWebRtcTransport({
    listenIps: listenIps,
    enableUdp: true,
    enableTcp: true,
    preferUdp: true,
    initialAvailableOutgoingBitrate: initialAvailableOutgoingBitrate,
    appData: { peerId, clientDirection: direction },
  });
  return transport;
};
