import { useEffect, useState } from 'react';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { loadFull } from 'tsparticles';

const ParticlesCard = () => {
  const [init, setInit] = useState(false);
  // this should be run only once per application lifetime
  useEffect(() => {
    initParticlesEngine(async (engine) => {
      // you can initiate the tsParticles instance (engine) here, adding custom shapes or presets
      // this loads the tsparticles package bundle, it's the easiest method for getting everything ready
      // starting from v2 you can add only the features you need reducing the bundle size
      //await loadAll(engine);
      //await loadFull(engine);
      await loadFull(engine);
      //await loadBasic(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  const particlesLoaded = (container) => {
    return container;
  };

  return (
    init && (
      <Particles
        id="tsparticles"
        particlesLoaded={particlesLoaded}
        options={{
          fullScreen: false,
          fpsLimit: 60,
          smooth: true,
          background: 'transparent',
          interactivity: {
            events: {
              onClick: {
                enable: true,
                mode: 'push',
              },
              onHover: {
                enable: true,
                mode: 'repulse',
              },
              resize: true,
            },
            modes: {
              repulse: {
                distance: 100,
                duration: 0.4,
              },
            },
          },
          particles: {
            color: {
              value: '#9BF6F6',
            },
            links: {
              color: '#3F63B4',
              distance: 100,
              enable: true,
              opacity: 0.5,
              width: 1,
            },

            move: {
              directions: 'none',
              enable: true,
              outModes: {
                default: 'bounce',
              },
              random: false,
              speed: 4,
              straight: false,
            },
            number: {
              density: {
                enable: true,
                area: 400,
              },
              value: 100,
            },
            opacity: {
              value: 0.7,
            },
            shape: {
              type: 'circle',
            },
            size: {
              value: { min: 1, max: 5 },
            },
          },
          detectRetina: true,
        }}
      />
    )
  );
};

export default ParticlesCard;
