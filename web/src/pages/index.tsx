import { Box, Container } from '@chakra-ui/react'
import type { NextPage } from 'next'
import Head from 'next/head'
import CreateRoom from '../features/create-room';

const Home: NextPage = () => {
  return (
    <CreateRoom />
  )
}

export default Home
