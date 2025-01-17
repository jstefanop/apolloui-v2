import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Center,
  Spinner,
  Box,
} from '@chakra-ui/react';

const CustomAlert = ({ ...props }) => {
  return (
    <Center>
      <Alert
        mb="5"
        borderRadius={'10px'}
        status={props.status || 'info'}
        variant="subtle"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        textAlign="center"
        height="200px"
        maxWidth="xl"
      >
        <Box position="relative" display="flex" justifyContent="center" alignItems="center">
          {props.extraStatus === 'pending' && (
            <Spinner
              size="xl"
              thickness="4px"
              color="yellow.500"
              position="absolute"
            />
          )}
          <AlertIcon boxSize="40px" mr={0} zIndex="1" />
        </Box>
        <AlertTitle mt={4} mb={1} fontSize="xl">
          {props.title}
        </AlertTitle>
        <AlertDescription maxWidth="sm">{props.description}</AlertDescription>
      </Alert>
    </Center>
  );
};

export default CustomAlert;