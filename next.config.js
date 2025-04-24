/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  i18n: {
    locales: ['en', 'it', 'de'],
    defaultLocale: 'en'
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
