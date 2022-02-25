import React, { useEffect, useState } from 'react';
import { Text, HStack, IconButton, useClipboard } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { MdCopyAll, MdDone, MdDoneAll, MdMessage, MdMic, MdMicOff } from 'react-icons/md';
import Chat from './Chat';
import ShareScreen from './ShareScreen';

function ControlBar() {
  const { asPath } = useRouter();
  const [url, setUrl] = useState('');
  const { hasCopied, onCopy } = useClipboard(url);

  useEffect(() => {
    if (!window) return;
    setUrl(`${window.location.host}${asPath}`);
  }, [window])
  const [isMute, setIsMute] = useState(false);

  return (
    <HStack pos="absolute" spacing={2} justifyContent="start" w="full" bottom={0} left={0} p={2} pl={4} pt={0}>
      <HStack pos="absolute">
        <Text color="cyan.100">{asPath}</Text>
        <IconButton
          onClick={onCopy}
          aria-label="copy"
          size="lg"
          isRound
          variant="ghost"
          icon={hasCopied ? <MdDone /> : <MdCopyAll />}
        />
      </HStack>
      <HStack spacing={2} w="full" justifyContent="center" >
        <IconButton
          onClick={() => setIsMute(!isMute)}
          aria-label="mute / unmute"
          size="lg"
          isRound
          color={isMute ? "gray" : "cyan.100"}
          icon={isMute ? <MdMicOff /> : <MdMic />}
        />
        <Chat />
        <ShareScreen />
      </HStack>
    </HStack>
  );
}

export default ControlBar;
