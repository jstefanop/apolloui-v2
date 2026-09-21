import { Alert, AlertIcon, AlertTitle, AlertDescription, Box } from '@chakra-ui/react';
import { FormattedMessage } from 'react-intl';
import { bytesToSize } from '../../lib/utils';

// The node drive is filling up. Renders nothing until the device says so, and
// says how much is left when it does. Sits inside the node page's Details, next
// to the remaining-space figure it explains — and ahead of the wall: bitcoind
// stops itself when the disk fills, so this has to arrive weeks before, not be
// found afterwards.
const NodeStorageLowPanel = ({ storage, ...props }) => {
  if (!storage?.low) return null;

  return (
    <Alert
      status="warning"
      variant="left-accent"
      borderRadius="10px"
      alignItems="flex-start"
      {...props}
    >
      <AlertIcon />
      <Box>
        <AlertTitle>
          <FormattedMessage id="node.storage.low.title" />
        </AlertTitle>
        <AlertDescription>
          <FormattedMessage
            id="node.storage.low.description"
            values={{
              free: storage.free != null ? bytesToSize(Number(storage.free), 0) : '?',
            }}
          />
        </AlertDescription>
      </Box>
    </Alert>
  );
};

export default NodeStorageLowPanel;
