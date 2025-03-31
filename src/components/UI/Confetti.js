import React, { useEffect, useState } from 'react';
import { Box } from '@chakra-ui/react';

const Confetti = () => {
  const [confettiPieces, setConfettiPieces] = useState([]);

  useEffect(() => {
    // Generate random confetti pieces
    const colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4CAF50', '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800', '#FF5722'];
    const pieces = [];

    for (let i = 0; i < 150; i++) {
      const x = Math.random() * 100;
      const y = -20 - Math.random() * 100;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const size = 5 + Math.random() * 15;
      const rotation = Math.random() * 360;
      const duration = 5 + Math.random() * 5;
      const delay = Math.random() * 3;

      pieces.push({
        id: i,
        x,
        y,
        color,
        size,
        rotation,
        duration,
        delay
      });
    }

    setConfettiPieces(pieces);

    // Clean up after animation
    const timer = setTimeout(() => {
      setConfettiPieces([]);
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Box
      position="fixed"
      top="0"
      left="0"
      width="100%"
      height="100%"
      pointerEvents="none"
      zIndex="1000"
      overflow="hidden"
    >
      {confettiPieces.map((piece) => (
        <Box
          key={piece.id}
          position="absolute"
          left={`${piece.x}%`}
          top={`${piece.y}%`}
          width={`${piece.size}px`}
          height={`${piece.size}px`}
          backgroundColor={piece.color}
          transform={`rotate(${piece.rotation}deg)`}
          animation={`fall ${piece.duration}s linear ${piece.delay}s forwards`}
          sx={{
            '@keyframes fall': {
              to: {
                top: '120%',
                transform: `rotate(${piece.rotation + 720}deg)`,
              },
            },
          }}
        />
      ))}
    </Box>
  );
};

export default Confetti;