import { Box, HStack, SimpleGrid, VStack } from "@chakra-ui/react";
import { MdPlusOne } from "react-icons/md";
import { useWindowSize } from "react-use";
import useStore from "./store";
import StreamerVideo from './StreamerVideo';

interface IVideoLayoutProps {
}

function VideoLayout(props: IVideoLayoutProps) {
  const {
    videoConsumerMap,
    sharescreenConsumer,
    isShareScreen
  } = useStore();
  const { width: windowWidth, height: windowHeight } = useWindowSize();
  const consumerKeys = Object.keys(videoConsumerMap);
  const consumerLength = consumerKeys.length;
  const isOneConsumer = consumerLength === 1;

  if (isShareScreen) {
    return (
      <Box p={4} pos="relative">
        <StreamerVideo userName={'sharescreen'} track={sharescreenConsumer.track} width={windowWidth / 2} height={windowHeight} />
      </Box>
    );
  }

  if (isOneConsumer) {
    const [consumerKey] = Object.keys(videoConsumerMap);
    const consumer = videoConsumerMap[consumerKey].consumer;
    return (
      <Box p={4} pos="relative">
        <StreamerVideo userName={consumerKey} track={consumer.track} width={windowWidth / 2} height={windowHeight} />
      </Box>
    )
  }

  const renderConsumerKeys = consumerLength < 5 ? consumerKeys : consumerKeys.slice(0, 5);


  return (
    <SimpleGrid columns={3} >
      {renderConsumerKeys.map((consumerKey: string) => {
        const consumer = videoConsumerMap[consumerKey].consumer;
        console.log("====== DBG consumer:", consumer, consumerKeys);
        return (
          <Box p={4} pos="relative">
            <StreamerVideo userName={consumerKey} track={consumer.track} key={consumer.id} width={(windowWidth / 3)} height={windowHeight} />
          </Box>
        )
      })}
      {
        consumerLength > 5 &&
        <Box justifyContent="center" alignItems="center" bg="gray.300" borderRadius="2xl" overflow="hidden" m={4} >
          <MdPlusOne />
        </Box>
      }
    </SimpleGrid>
  )
}


export default VideoLayout;
