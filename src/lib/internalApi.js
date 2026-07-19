const formatHost = (host) =>
  host.includes(':') && !host.startsWith('[') ? `[${host}]` : host;

export const getInternalGraphqlUrl = (env = process.env) => {
  // NextAuth runs on the Apollo itself, so its server-side request must not
  // depend on the browser-facing hostname or LAN DNS.
  const host = env.INTERNAL_GRAPHQL_HOST || '127.0.0.1';
  const port =
    env.INTERNAL_GRAPHQL_PORT || env.NEXT_PUBLIC_GRAPHQL_PORT || '5000';

  return `http://${formatHost(host)}:${port}/api/graphql`;
};
