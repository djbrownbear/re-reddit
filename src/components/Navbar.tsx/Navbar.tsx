import React from 'react';
import { Flex, Image } from "@chakra-ui/react";
import SearchInput from './SearchInput';
import RightContent from './RightContent/RightContent';

const Navbar = () => {
  return (
    <Flex bg="white" height="44px" padding="6px 12px">
      <Flex align="center">
        <Image src="/images/redditFace.svg" height="30px" alt="Reddit logo" />
        <Image src="/images/redditText.svg" height="46px" display={{ base: "none", md: "unset" }} alt="Reddit" />
      </Flex>
      <SearchInput />
      <RightContent /> 
      {/* <Directory /> */}
    </Flex>
  )
};

export default Navbar;