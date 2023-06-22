import { Button } from '@chakra-ui/react';
import React from 'react';

const AuthButtons = () => {
  return (
    <>
      <Button variant={"outline"} display={{ base: "none", sm: "flex" }} width={{ base: "70px", md: "110px" }} mr={1} >Log In</Button>
      <Button variant={"solid"} display={{ base: "none", sm: "flex" }} width={{ base: "70px", md: "110px" }} mr={1} >Sign Out</Button>
    </>
  )
}

export default AuthButtons;