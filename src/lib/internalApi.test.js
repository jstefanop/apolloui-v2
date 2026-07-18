import { getInternalGraphqlUrl } from './internalApi';

describe('getInternalGraphqlUrl', () => {
  it('uses the loopback API instead of a browser-facing hostname', () => {
    expect(
      getInternalGraphqlUrl({
        NEXT_PUBLIC_GRAPHQL_HOST: 'apollo.lan',
      })
    ).toBe('http://127.0.0.1:5000/api/graphql');
  });

  it('retains a configured API port', () => {
    expect(
      getInternalGraphqlUrl({
        NEXT_PUBLIC_GRAPHQL_PORT: '5002',
      })
    ).toBe('http://127.0.0.1:5002/api/graphql');
  });

  it('supports an explicit server-only endpoint override', () => {
    expect(
      getInternalGraphqlUrl({
        INTERNAL_GRAPHQL_HOST: '::1',
        INTERNAL_GRAPHQL_PORT: '6000',
      })
    ).toBe('http://[::1]:6000/api/graphql');
  });
});
