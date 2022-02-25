import React, { useContext, useState } from 'react';
import { useRouter } from 'next/router';
import { Text, Button, HStack, Input, InputGroup, InputLeftAddon, InputLeftElement, InputRightAddon, VStack, InputRightElement } from '@chakra-ui/react';
import { MdKeyboard, MdSearch } from 'react-icons/md'
import { nanoid } from 'nanoid';
import { WebSocketContext } from '../room/wsProvider';
import useStore from '../room/store';

interface ICreateRoom { };

function CreateRoom(props: ICreateRoom) {
  const router = useRouter();
  const { setRoomId, setPeerId } = useStore();
  const [customRoomId, setCustomRoomId] = useState<string>('');
  const { connection } = useContext(WebSocketContext);
  const isJoinable = customRoomId.length >= 4;

  const handleNewMeeting = () => {
    if (!connection) return;
    const roomId = nanoid(4);
    const peerId = nanoid(4);
    connection.emit('create-room', { roomId, peerId });

    connection.on('room-created', ({ roomId, peerId }) => {
      setPeerId(peerId);
      setRoomId(roomId);
      router.push(roomId);
    });
  }

  const handleJoinMeeting = () => {
    if (!connection) return;
    setRoomId(customRoomId);
    router.push(customRoomId);
  }

  return (
    <VStack w="full" h="100vh" p={4} alignItems="center" pt="20%">
      <HStack spacing="4">
        <Button
          w={44}
          variant="solid"
          colorScheme="cyan"
          onClick={handleNewMeeting}
        >
          New meeting
        </Button>
        <InputGroup>
          <InputLeftElement children={<MdKeyboard />} />
          <Input
            value={customRoomId}
            onChange={element => setCustomRoomId(element.target.value)}
            placeholder="Enter a code"
          />
          <InputRightAddon
            bg="transparent"
            border="transparent"
            children={
              <Button
                disabled={!isJoinable}
                colorScheme="cyan"
                variant="ghost"
                onClick={handleJoinMeeting}
              >
                Join
              </Button>
            }
          />
        </InputGroup>
      </HStack>

    </VStack>
  );
}

export default CreateRoom;
