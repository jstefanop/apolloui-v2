import {
  Box,
  CircularProgress,
  CircularProgressLabel,
  Icon,
  Tooltip,
} from '@chakra-ui/react';
import { CheckIcon } from '@chakra-ui/icons';
import { useIntl } from 'react-intl';
import { WarningIcon } from '../UI/Icons/WarningIcon';
import { useFormatTask } from '../../contexts/FormatTaskContext';

// Persistent navbar indicator for a node format. It shows for as long as a format
// is under way — so hiding the dialog and navigating away leaves it here, clickable
// to reopen the dialog — and then briefly shows the ✓/✗ result before fading. All
// state comes from FormatTaskContext; this is display only.
const NavbarFormatProgress = () => {
  const intl = useIntl();
  const { progress, status, openModal } = useFormatTask();

  if (status === 'idle') return null;

  const running = status === 'running';
  const success = status === 'success';
  const color = running ? 'purple.500' : success ? 'green.500' : 'red.500';
  const tooltip = running
    ? intl.formatMessage(
        { id: 'format.navbar.running' },
        { progress: progress || 0 }
      )
    : intl.formatMessage({
        id: success ? 'format.navbar.success' : 'format.navbar.failed',
      });

  return (
    <Tooltip label={tooltip} hasArrow>
      <Box
        as="button"
        type="button"
        onClick={openModal}
        mx="6px"
        display="flex"
        alignItems="center"
        aria-label={tooltip}
      >
        <CircularProgress
          value={running ? progress || 0 : 100}
          size="32px"
          thickness="10px"
          color={color}
          isIndeterminate={running && !progress}
        >
          <CircularProgressLabel
            display="flex"
            alignItems="center"
            justifyContent="center"
            fontSize="9px"
            fontWeight="bold"
          >
            {running ? (
              `${progress || 0}%`
            ) : success ? (
              <CheckIcon color="green.500" boxSize="12px" />
            ) : (
              <Icon as={WarningIcon} color="red.500" boxSize="12px" />
            )}
          </CircularProgressLabel>
        </CircularProgress>
      </Box>
    </Tooltip>
  );
};

export default NavbarFormatProgress;
