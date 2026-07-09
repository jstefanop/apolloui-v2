import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';
import { signIn, getSession } from 'next-auth/react';
import { renderWithProviders } from '../test-utils';
import SignIn from '../pages/signin';

jest.mock('next/router', () => ({ useRouter: jest.fn() }));
jest.mock('next-auth/react', () => ({ signIn: jest.fn(), getSession: jest.fn() }));

const typePasswordAndSubmit = async (pw) => {
  const user = userEvent.setup();
  const input = document.querySelector('input[name="password"]');
  await user.type(input, pw);
  await user.click(screen.getByRole('button'));
};

describe('SignIn — login handler (redirect regression)', () => {
  it('on success refreshes the session and navigates to /overview', async () => {
    const push = jest.fn();
    useRouter.mockReturnValue({ push });
    signIn.mockResolvedValue({ ok: true, error: null });
    getSession.mockResolvedValue({ user: { name: 'token' } });

    renderWithProviders(<SignIn />);
    await typePasswordAndSubmit('hunter2');

    await waitFor(() => expect(push).toHaveBeenCalledWith('/overview'));
    expect(getSession).toHaveBeenCalled();
  });

  it('on invalid password shows an error and does NOT navigate', async () => {
    const push = jest.fn();
    useRouter.mockReturnValue({ push });
    signIn.mockResolvedValue({ error: 'CredentialsSignin' });

    renderWithProviders(<SignIn />);
    await typePasswordAndSubmit('wrong');

    expect(await screen.findByText('Invalid password')).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
    expect(getSession).not.toHaveBeenCalled();
  });
});
