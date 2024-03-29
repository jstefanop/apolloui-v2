import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Center,
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
        <AlertIcon boxSize="40px" mr={0} />
        <AlertTitle mt={4} mb={1} fontSize="xl">
          {props.title}
        </AlertTitle>
        <AlertDescription maxWidth="sm">{props.description}</AlertDescription>
      </Alert>
    </Center>
  );
};

export default CustomAlert;
