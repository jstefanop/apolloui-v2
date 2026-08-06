import { useQuery } from '@apollo/client';
import { NODE_STORAGE_QUERY } from '../graphql/nodeStorage';

// Whether this device has anywhere to put a blockchain.
//
// It answers a question the UI used to guess at: with no SSD the node cannot
// start, the RPC refuses the connection, and the panel said "your node is not
// running" — true, and useless to someone whose device shipped without a drive.
//
// Hardware does not change while a page is open, so this is asked for once and
// polled slowly; the pages that need it read the same answer.
export const useNodeStorage = () => {
  const { data, loading } = useQuery(NODE_STORAGE_QUERY, {
    fetchPolicy: 'cache-first',
    pollInterval: 60000,
  });

  const storage = data?.Node?.storage?.result || null;

  return {
    storage,
    loading,
    // Nothing is claimed until the device has answered: treating "not asked yet"
    // as "no drive" would flash the wrong panel on every load, and treating a
    // failed check as "no drive" would tell a working node to buy hardware.
    unavailable: !!storage && storage.state !== 'ready' && storage.state !== 'unknown',
    state: storage?.state ?? null,
  };
};

export default useNodeStorage;
