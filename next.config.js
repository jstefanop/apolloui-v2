/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Pin the file-tracing/workspace root to this directory. The UI is a standalone
  // submodule with its own yarn.lock; without this, Next walks up and finds the
  // parent API's yarn.lock too ("multiple lockfiles" warning) and may pick the
  // wrong root. __dirname keeps the build self-contained with or without the parent.
  outputFileTracingRoot: __dirname,
  // LAN/localhost app: not public, not SEO. Disable next/image optimization so
  // `sharp` (and its libvips native build, painful to recompile on aarch64) is
  // never required at build or runtime. Logos/flags are tiny static assets.
  images: {
    unoptimized: true,
  },
  i18n: {
    locales: ['en', 'it', 'de', 'es'],
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
