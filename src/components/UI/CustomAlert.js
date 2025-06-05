import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Center,
  Spinner,
  Box,
  Flex,
} from '@chakra-ui/react';

const CustomAlert = ({ variant = 'default', ...props }) => {
  const defaultStyle = {
    mb: "5",
    borderRadius: '10px',
    status: props.status || 'info',
    variant: "subtle",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    height: "200px",
    maxWidth: "xl"
  };

  const horizontalStyle = {
    status: props.status || 'info',
    borderRadius: "10px",
    mb: "5",
    flexDirection: "row",
    alignItems: "center",
    textAlign: "left",
    width: "100%",
    px: 6,
    py: 4
  };

  const alertStyle = variant === 'horizontal' ? horizontalStyle : defaultStyle;

  const content = variant === 'horizontal' ? (
    <Flex align="center" gap={4} width="100%">
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
      <Box>
        <AlertTitle fontSize="xl" mb={1}>
          {props.title}
        </AlertTitle>
        <AlertDescription>{props.description}</AlertDescription>
      </Box>
    </Flex>
  ) : (
    <>
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
    </>
  );

  return variant === 'horizontal' ? (
    <Alert {...alertStyle}>
      {content}
    </Alert>
  ) : (
    <Center>
      <Alert {...alertStyle}>
        {content}
      </Alert>
    </Center>
  );
};

export default CustomAlert;