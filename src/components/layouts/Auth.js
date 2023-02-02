// Chakra imports
import { Box, Flex } from '@chakra-ui/react';
// Custom components
import Card from '../card/Card';
import FixedPlugin from '../fixedPlugin/FixedPlugin';
import Footer from '../footer/FooterAuth';
import Navbar from '../navbar/NavbarAuth';
import PropTypes from 'prop-types';
import React from 'react';

function AuthCentered(props) {
  const { children, image } = props;
  return (
    <Flex
      direction='column'
      alignSelf='center'
      justifySelf='center'
      overflow='hidden'
      mx={{ base: '10px', lg: '0px' }}
      minH='100vh'
    >
      <FixedPlugin />
      <Box
        position='absolute'
        minH={{ base: '50vh', md: '50vh' }}
        maxH={{ base: '50vh', md: '50vh' }}
        w={{ md: 'calc(100vw)' }}
        maxW={{ md: 'calc(100vw)' }}
        left='0'
        right='0'
        bgRepeat='no-repeat'
        overflow='hidden'
        zIndex='-1'
        top='-2px'
        bgImage={image}
        bgSize='cover'
        mx={{ md: 'auto' }}
      ></Box>
      <Navbar secondaryNavbar={false} />
      <Card
        w={{ base: '100%', md: 'max-content' }}
        h='max-content'
        mx='auto'
        maxW='100%'
        mt={{ base: '100px' }}
        mb={{ base: '50px', lg: 'auto' }}
        p={{ base: '10px', md: '50px' }}
        pt={{ base: '30px', md: '50px' }}
        pb={{ base: '20px', md: '20px' }}
      >
        {children}
      </Card>
      <Footer />
    </Flex>
  );
}

AuthCentered.propTypes = {
  image: PropTypes.any,
};

export default AuthCentered;
