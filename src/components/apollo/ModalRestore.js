import {
  Flex,
  Text,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/react';

import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { useDropzone } from 'react-dropzone';

const baseStyle = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '20px',
  borderWidth: 2,
  borderRadius: 2,
  borderColor: '#eeeeee',
  borderStyle: 'dashed',
  backgroundColor: '#fafafa',
  color: '#bdbdbd',
  outline: 'none',
  transition: 'border .24s ease-in-out',
};

const focusedStyle = {
  borderColor: '#2196f3',
};

const acceptStyle = {
  borderColor: '#00e676',
};

const rejectStyle = {
  borderColor: '#ff1744',
};

const ModalRestore = ({ isOpen, onClose, onUpload, onRestore }) => {
  const [restoreError, setRestoreError] = useState(null);
  const [restoreReady, setRestoreReady] = useState(false);

  const onDrop = useCallback((acceptedFiles) => {
    setRestoreReady(false);
    setRestoreError(null);
    acceptedFiles.forEach((file) => {
      const reader = new FileReader();

      reader.onabort = () => console.log('file reading was aborted');
      reader.onerror = () => console.log('file reading has failed');
      reader.onload = () => {
        const binaryStr = reader.result;
        const decoder = new TextDecoder('utf-8');
        const decodedString = decoder.decode(binaryStr);
        try {
          const data = JSON.parse(decodedString);
          setRestoreReady(true);
          onUpload(data);
        } catch (err) {
          setRestoreError(err.message);
        }
      };
      reader.readAsArrayBuffer(file);
    });
  }, []);

  const {
    acceptedFiles,
    fileRejections,
    getRootProps,
    getInputProps,
    isDragActive,
    isFocused,
    isDragAccept,
    isDragReject,
    inputRef,
  } = useDropzone({
    onDrop,
    maxFiles: 1,
    accept: {
      'application/json': ['.json'],
    },
  });

  const style = useMemo(
    () => ({
      ...baseStyle,
      ...(isFocused ? focusedStyle : {}),
      ...(isDragAccept ? acceptStyle : {}),
      ...(isDragReject ? rejectStyle : {}),
    }),
    [isFocused, isDragAccept, isDragReject]
  );

  useEffect(() => {
    if (isOpen) return;
    setRestoreError();
    setRestoreReady(false);
    acceptedFiles.length = 0;
    acceptedFiles.splice(0, acceptedFiles.length);
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Restore backup configuration</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <div {...getRootProps({ style })}>
            <input {...getInputProps()} />
            {isDragActive ? (
              <p>Drop the files here ...</p>
            ) : (
              <p>
                Drag &apos;n&apos; drop some files here, or click to select
                files
              </p>
            )}
          </div>

          {fileRejections.length > 0 && (
            <Flex mt="5">
              {fileRejections.map(({ errors }, indexDiv) => (
                <div key={indexDiv}>
                  {errors.map((e) => (
                    <Text key={e.code}>{e.message}</Text>
                  ))}
                </div>
              ))}
            </Flex>
          )}
          {restoreError && (
            <Flex mt="5">
              <Text color="red">{restoreError}</Text>
            </Flex>
          )}
          {restoreReady && (
            <Flex mt="5">
              <Text color="green">
                You can now proceed to restore your settings.
              </Text>
            </Flex>
          )}
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Close
          </Button>
          {restoreReady && (
            <Button colorScheme="orange" onClick={onRestore}>
              Restore
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ModalRestore;
