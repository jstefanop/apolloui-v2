import React, { useEffect, useState } from 'react';
import { Portal, Box, useDisclosure } from '@chakra-ui/react';
import { gql, useQuery } from '@apollo/client';
import { motion } from 'framer-motion';

import Sidebar from '../sidebar/Sidebar';
import Footer from '../footer/FooterAdmin';
import Navbar from '../navbar/NavbarAdmin';

export const ALL_STATS_QUERY = gql`
  query {
    Node {
      stats {
        result {
          stats {
            timestamp
            blockchainInfo {
              blocks
              blockTime
              headers
              sizeOnDisk
            }
            connectionCount
            miningInfo {
              difficulty
              networkhashps
            }
            peerInfo {
              addr
              subver
            }
            error {
              code
              message
            }
          }
        }
      }
    }
    Miner {
      stats {
        result {
          stats {
            uuid
            date
            statVersion
            versions {
              miner
              minerDate
              minerDebug
              mspVer
            }
            master {
              upTime
              diff
              boards
              errorSpi
              osc
              hwAddr
              boardsI
              boardsW
              wattPerGHs
              intervals {
                int_0 {
                  name
                  interval
                  bySol
                  byDiff
                  byPool
                  byJobs
                  solutions
                  errors
                  errorRate
                  chipSpeed
                  chipRestarts
                }
                int_30 {
                  name
                  interval
                  bySol
                  byDiff
                  byPool
                  byJobs
                  solutions
                  errors
                  errorRate
                  chipSpeed
                  chipRestarts
                }
                int_300 {
                  name
                  interval
                  bySol
                  byDiff
                  byPool
                  byJobs
                  solutions
                  errors
                  errorRate
                  chipSpeed
                  chipRestarts
                }
                int_900 {
                  name
                  interval
                  bySol
                  byDiff
                  byPool
                  byJobs
                  solutions
                  errors
                  errorRate
                  chipSpeed
                  chipRestarts
                }
                int_3600 {
                  name
                  interval
                  bySol
                  byDiff
                  byPool
                  byJobs
                  solutions
                  errors
                  errorRate
                  chipSpeed
                  chipRestarts
                }
              }
            }
            pool {
              host
              port
              userName
              diff
              intervals {
                int_0 {
                  name
                  interval
                  jobs
                  cleanFlags
                  sharesSent
                  sharesAccepted
                  sharesRejected
                  solutionsAccepted
                  minRespTime
                  avgRespTime
                  maxRespTime
                  shareLoss
                  poolTotal
                  inService
                  subscribeError
                  diffChanges
                  reconnections
                  reconnectionsOnErrors
                  defaultJobShares
                  staleJobShares
                  duplicateShares
                  lowDifficultyShares
                  pwcSharesSent
                  pwcSharesDropped
                  bigDiffShares
                  belowTargetShare
                  pwcRestart
                  statOverflow
                }
              }
            }
            fans {
              int_0 {
                rpm
              }
            }
            temperature {
              count
              min
              avr
              max
            }
            slots {
              int_0 {
                revision
                spiNum
                spiLen
                pwrNum
                pwrLen
                btcNum
                specVoltage
                chips
                pwrOn
                pwrOnTarget
                revAdc
                temperature
                temperature1
                ocp
                heaterErr
                heaterErrNum
                inOHOsc
                ohOscNum
                ohOscTime
                overheats
                overheatsTime
                lowCurrRst
                currents
                brokenPwc
                solutions
                errors
                ghs
                errorRate
                chipRestarts
                wattPerGHs
                tmpAlert {
                  alertLo
                  alertHi
                  numWrite
                }
                osc
                oscStopChip
              }
            }
            slaves {
              id
              uid
              ver
              rx
              err
              time
              ping
            }
          }
        }
        error {
          message
          type
          severity
          reasons {
            path
            message
            reason
          }
        }
      }
    }
  }
`;

const Layout = ({ children, routes }, props) => {
  const { onOpen } = useDisclosure();
  const [miner, setMiner] = useState();
  const [node, setNode] = useState();

  const { loading, error, data, startPolling } = useQuery(ALL_STATS_QUERY, {
    onCompleted: () => {
      console.log('Miner poll completed');
    },
    onError: (err) => {
      console.log('ERR', err);
    },
  });

  startPolling(10000);

  useEffect(() => {
    console.log(data, loading);
    if (data) {
      const {
        Node: { stats: Node },
        Miner: { stats: Miner },
      } = data;

      setMiner(Miner);
      setNode(Node);
    }
  }, [data]);

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
            {React.cloneElement(children, { miner, node })}
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
