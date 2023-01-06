import React, { useEffect, useState } from 'react';
import { Portal, Box, useDisclosure } from '@chakra-ui/react';
import { useQuery } from '@apollo/client';
import { motion } from 'framer-motion';

import Sidebar from '../sidebar/Sidebar';
import Footer from '../footer/FooterAdmin';
import Navbar from '../navbar/NavbarAdmin';
import AlertCard from '../UI/AlertCard';

import { ALL_STATS_QUERY } from '../../graphql/allStats';
import _ from 'lodash';
import initialState from '../../graphql/allStatsInitialState';

const Layout = ({ children, routes }, props) => {
  const { onOpen } = useDisclosure();
  const [stats, setStats] = useState(initialState);

  const {
    loading,
    error,
    data,
    startPolling,
  } = useQuery(ALL_STATS_QUERY);

  startPolling(10000);

  useEffect(() => {
    if (loading) return;

    setStats(data);
  }, [data, loading]);

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
        <Sidebar routes={routes} display='none' />
        <Box
          float='right'
          minHeight='100vh'
          height='100%'
          overflow='auto'
          position='relative'
          maxHeight='100%'
          w={{ base: '100%', xl: 'calc( 100% - 290px )' }}
          maxWidth={{ base: '100%', xl: 'calc( 100% - 290px )' }}
          transition='all 0.33s cubic-bezier(0.685, 0.0473, 0.346, 1)'
          transitionDuration='.2s, .2s, .35s'
          transitionProperty='top, bottom, width'
          transitionTimingFunction='linear, linear, ease'
        >
          <Portal>
            <Box>
              <Navbar
                onOpen={onOpen}
                secondary={true}
                fixed={true}
                routes={routes}
                stats={stats}
                loading={loading}
              />
            </Box>
          </Portal>
          <Box
            mx='auto'
            p={{ base: '20px', md: '30px' }}
            pe='20px'
            minH='100vh'
            pt='50px'
          >
            <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
              <AlertCard
                color='orange.200'
                title={'Error'}
                message={'There was an error'}
              />
              {React.cloneElement(children, { stats, loading })}
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
