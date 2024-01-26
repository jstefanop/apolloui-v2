module.exports = {
  /**
   * Application configuration section
   * http://pm2.keymetrics.io/docs/usage/application-declaration/
   */
  apps: [
    {
      name: 'apolloui-v2',
      script: 'node_modules/next/dist/bin/next',
      exec_mode: 'cluster',
      args: 'start',
      instances: 'max',
      watch: false,
      autorestart: true,
      max_memory_restart: '1G',
      env: {
        NEXT_PUBLIC_GRAPHQL_HOST: '127.0.0.1',
        NEXT_PUBLIC_POLLING_TIME: 5000,
        NEXT_PUBLIC_POLLING_TIME_NODE: 30000,
        NEXTAUTH_SECRET: 'secret!',
      },
    },
  ],
};