import { Flex } from '@chakra-ui/react';
import React from 'react'
import AuthButtons from './AuthButtons';
import AuthModal from '@/components/Modal/Auth/AuthModal';

type RightContentProps = {
  // user: any;
};

const RightContent = (props: RightContentProps) => {
  return (
    <>
      <AuthModal />
      <Flex justify="center" align="center">
        <AuthButtons />
      </Flex>
    </>
  )
};

export default RightContent;