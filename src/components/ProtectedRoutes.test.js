import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { useSession } from 'next-auth/react';
import { useLazyQuery } from '@apollo/client';
import { AUTH_STATUS_QUERY } from '../graphql/auth';
import { GET_POOLS_QUERY } from '../graphql/pools';
import ProtectedRoute from './ProtectedRoutes';

jest.mock('next-auth/react', () => ({ useSession: jest.fn() }));
jest.mock('../contexts/DeviceConfigContext', () => ({ useDeviceType: () => 'miner' }));
jest.mock('@apollo/client', () => ({
  ...jest.requireActual('@apollo/client'),
  useLazyQuery: jest.fn(),
}));

const setupData = (status) => ({ Auth: { status: { result: { status } } } });
const poolsWithValid = { Pool: { list: { result: { pools: [{ url: 'stratum+tcp://p:1', username: 'w' }] } } } };

const mockLazy = ({ setup, pools }) => {
  useLazyQuery.mockImplementation((query) => {
    if (query === AUTH_STATUS_QUERY) return [jest.fn(), { data: setup }];
    if (query === GET_POOLS_QUERY) return [jest.fn(), { data: pools }];
    return [jest.fn(), {}];
  });
};

const makeRouter = (over = {}) => ({ isReady: true, pathname: '/overview', query: {}, push: jest.fn(), ...over });
const renderGuard = (router) =>
  render(
    <ProtectedRoute router={router}>
      <div>child</div>
    </ProtectedRoute>
  );

describe('ProtectedRoute redirects', () => {
  it('redirects to /setup when setup is not done', async () => {
    useSession.mockReturnValue({ status: 'unauthenticated', data: null });
    mockLazy({ setup: setupData('pending'), pools: poolsWithValid });
    const router = makeRouter({ pathname: '/overview' });
    renderGuard(router);
    await waitFor(() => expect(router.push).toHaveBeenCalledWith('/setup'));
  });

  it('redirects /signin → /overview when authenticated and setup done (login regression)', async () => {
    useSession.mockReturnValue({ status: 'authenticated', data: { user: { name: 'token' } } });
    mockLazy({ setup: setupData('done'), pools: poolsWithValid });
    const router = makeRouter({ pathname: '/signin' });
    renderGuard(router);
    await waitFor(() => expect(router.push).toHaveBeenCalledWith('/overview'));
  });

  it('redirects to /signin when unauthenticated and setup done', async () => {
    useSession.mockReturnValue({ status: 'unauthenticated', data: null });
    mockLazy({ setup: setupData('done'), pools: poolsWithValid });
    const router = makeRouter({ pathname: '/overview' });
    renderGuard(router);
    await waitFor(() => expect(router.push).toHaveBeenCalledWith('/signin'));
  });
});
