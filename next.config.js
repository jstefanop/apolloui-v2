/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  i18n: {
    locales: ['en'],
    defaultLocale: 'en',
    localeDetection: false,
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/overview',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
