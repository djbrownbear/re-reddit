import React from 'react';
import Navbar from '../Navbar.tsx/Navbar';

const Layout = ({ children }) => {
  return (
    <>
      <Navbar />
      <main>{children}</main>
    </>
  )
};

export default Layout;