import { Text, Button, Drawer, DrawerBody, DrawerCloseButton, DrawerContent, DrawerFooter, DrawerHeader, DrawerOverlay, HStack, IconButton, Input, useDisclosure, VStack } from "@chakra-ui/react"
import React, { useContext, useEffect, useState } from "react"
import { MdMessage, MdSend } from "react-icons/md"
import useStore from "./store";
import { WebSocketContext } from "./wsProvider";

interface IChatElement {
  date: Date;
  by: string;
  content: string;
}

function ChatElement(props: IChatElement) {
  return (
    <VStack spacing={2} alignItems="start" w="full">
      <HStack spacing={2} alignItems="center">
        <Text color="cyan">{props.by}</Text>
        <Text as="sub"> {props.date} </Text>
      </HStack>
      <Text>{props.content}</Text>
    </VStack>
  );
}

function Chat() {
  const [message, setMessage] = useState<string>('')
  const { roomId, peerId, roomMessages, addNewMessage, initRoomMessages } = useStore();
  const { isOpen, onOpen, onClose } = useDisclosure()
  const btnRef = React.useRef<any>()
  const { connection } = useContext(WebSocketContext);


  useEffect(() => {
    if (!connection) return;

    connection.emit("get-room-message", { roomId });
    connection.on("room-message", (data: any) => {
      initRoomMessages(data);
    })

    connection.on("new-message", (message: any) => {
      addNewMessage(message);
    })

    const clean = () => {
      connection.removeListener('new-message');
      connection.removeListener('room-message');
    }

    return clean;
  }, [connection, roomId])

  const handleSendMessage = () => {
    if (!connection) return;
    connection.emit("send-new-message", { content: message, by: peerId, roomId });
    addNewMessage({ date: new Date().toISOString(), by: peerId, content: message });
    setMessage('');
  }

  return (
    <>
      <IconButton
        ref={btnRef}
        aria-label="chat-drawer"
        onClick={onOpen}
        icon={<MdMessage />}
        isRound={true}
        color={isOpen ? "cyan.100" : "gray"}
        size="lg"
      />

      <Drawer
        isOpen={isOpen}
        placement='right'
        onClose={onClose}
        finalFocusRef={btnRef}
      >
        <DrawerContent>
          <DrawerCloseButton />

          <DrawerBody>
            <VStack spacing={2} pt={12} >
              {
                roomMessages.map((chat: IChatElement, idx: number) => (
                  <ChatElement key={idx} date={chat.date} content={chat.content} by={chat.by} />
                ))
              }
            </VStack>
          </DrawerBody>

          <DrawerFooter justifyContent="left">
            <HStack spacing={2} p={2}>
              <Input
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder='Chat here...'
              />
              <IconButton
                onClick={handleSendMessage}
                aria-label="send-chat"
                icon={<MdSend />}
              />
            </HStack>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  )
}

export default Chat;
