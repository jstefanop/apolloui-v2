import React from 'react';
import {
  Portal,
  Box,
  useDisclosure,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';

import Sidebar from '../sidebar/Sidebar';
import Footer from '../footer/FooterAdmin';
import Navbar from '../navbar/NavbarAdmin';
import { useSelector } from 'react-redux';

const Layout = ({ children, routes }, props) => {
  const { onOpen } = useDisclosure();

  const {
    error: errorAction,
    loading: loadingAction,
    data: dataAction,
  } = useSelector((state) => state.minerAction);

  const {
    error: errorGraphql,
  } = useSelector((state) => state.graphqlErrors);

  return (
    <motion.div
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 300, opacity: 0 }}
      transition={{
        type: 'spring',
        stiffness: 260,
        damping: 20,
      }}
    >
      <Box>
        <Sidebar routes={routes} display="none" />
        <Box
          float="right"
          minHeight="100vh"
          height="100%"
          overflow="auto"
          position="relative"
          maxHeight="100%"
          w={{ base: '100%', xl: 'calc( 100% - 290px )' }}
          maxWidth={{ base: '100%', xl: 'calc( 100% - 290px )' }}
          transition="all 0.33s cubic-bezier(0.685, 0.0473, 0.346, 1)"
          transitionDuration=".2s, .2s, .35s"
          transitionProperty="top, bottom, width"
          transitionTimingFunction="linear, linear, ease"
        >
          <Portal>
            <Box>
              <Navbar
                onOpen={onOpen}
                secondary={true}
                fixed={true}
                routes={routes}
              />
            </Box>
          </Portal>
          <Box
            mx="auto"
            p={{ base: '20px', md: '30px' }}
            pe="20px"
            minH="100vh"
            pt="50px"
          >
            <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
              {dataAction && (
                <Alert mb="5" borderRadius={'10px'} status="info">
                  <AlertIcon />
                  <AlertTitle>{dataAction.title}</AlertTitle>
                  {dataAction.description && (
                    <AlertDescription>
                      {dataAction.description}
                    </AlertDescription>
                  )}
                </Alert>
              )}
              {errorAction && (
                <Alert mb="5" borderRadius={'10px'} status="error">
                  <AlertIcon />
                  <AlertTitle>{errorAction.toString()}</AlertTitle>
                </Alert>
              )}
              {errorGraphql && (
                <Alert mb="5" borderRadius={'10px'} status="error">
                  <AlertIcon />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{errorGraphql}</AlertDescription>
                </Alert>
              )}
              {React.cloneElement(children)}
            </Box>
          </Box>
          <Box>
            <Footer />
          </Box>
        </Box>
      </Box>
    </motion.div>
  );
};

export default Layout;
