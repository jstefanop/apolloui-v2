import {
  Box,
  Flex,
  Card,
  Icon,
  Text,
  CardBody,
  Stack,
  Heading,
  Divider,
  CardFooter,
} from '@chakra-ui/react';

const AlertCard = ({ color, title, message }) => {
  return (
    <Box pb={'5'}>
      <Flex flexDirection='column'>
        <Card bgColor={color}>
          <CardBody>
            <Stack>
              <Heading size='md'>{title}</Heading>
              <Text>{message}</Text>
            </Stack>
          </CardBody>
        </Card>
      </Flex>
    </Box>
  );
};

export default AlertCard;
