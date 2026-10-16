import { renderHook, act } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import { flattenMessages } from '../../../lib/utils';
import en from '../../../locales/en.json';
import { usePasswordSettings } from './usePasswordSettings';

// A small stand-in for the settings context: just the state the hook writes to.
let ctx;
jest.mock('../context/SettingsContext', () => ({ useSettings: () => ctx }));

const wrapper = ({ children }) => (
  <IntlProvider locale="en" messages={flattenMessages(en)} onError={() => {}}>
    {children}
  </IntlProvider>
);

let settings;
beforeEach(() => {
  settings = {};
  ctx = {
    get settings() {
      return settings;
    },
    setSettings: (fn) => {
      settings = typeof fn === 'function' ? fn(settings) : fn;
    },
    setErrorForm: jest.fn(),
    setIsChanged: jest.fn(),
  };
});

const fill = (result, a, b) => {
  act(() => result.current.setLockPassword(a));
  act(() => result.current.setVerifyLockPassword(b));
};

describe('usePasswordSettings', () => {
  it('shows the length rule inline for a password under 8 characters', () => {
    const { result } = renderHook(() => usePasswordSettings(), { wrapper });
    fill(result, 'short', 'short');
    expect(result.current.isLockpasswordError).toBe('The password must have 8 characters at least');
    expect(settings.lockPassword).toBeUndefined();
  });

  it('hands a valid pair to the settings', () => {
    const { result } = renderHook(() => usePasswordSettings(), { wrapper });
    fill(result, 'longenough', 'longenough');
    expect(result.current.isLockpasswordError).toBe(false);
    expect(settings.lockPassword).toBe('longenough');
  });

  it('takes a pair back from the settings when it stops being valid', () => {
    const { result } = renderHook(() => usePasswordSettings(), { wrapper });
    fill(result, 'longenough', 'longenough');
    expect(settings.lockPassword).toBe('longenough');

    // Shortened afterwards: the form shows the error, and the stale pair must not
    // stay behind to be saved with the next unrelated change.
    act(() => result.current.setLockPassword('short'));
    expect(settings.lockPassword).toBeUndefined();
    expect(settings.verifyLockpassword).toBeUndefined();
  });
});
