import { createContext, useState } from 'react';
import { useRouter } from 'next/router';
import _ from 'lodash';
import { useIntl } from 'react-intl';

const AuthContext = createContext({
  error: null,
  loading: false,
  redirect: null,
  user: null,
  streetlibUser: null,
  feedbackMessage: null,
  setFeedbackMessage: () => {},
  inputUsername: null,
  inputPassword: null,
  inputTmpPassword: null,
  handleLogin: () => {},
  handleLogout: () => {},
  handleUpdate: () => {},
  handleChangePassword: () => {},
  handleGetUrlParameter: () => {},
  handleSignedInRedirect: () => {},
  handleAdminLogin: () => {},
  handleGetCurrentAuthenticatedUser: () => {},
  setError: () => {},
});

export const AuthContextProvider = ({ children }) => {
  const intl = useIntl();
  const router = useRouter();

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState(null);
  const [inputUsername, setInputUsername] = useState('');
  const [inputPassword, setInputPassword] = useState('');
  const [inputTmpPassword, setInputTmpPassword] = useState('');
  const [inputVerifyPassword, setInputVerifyPassword] = useState('');
  const [adminRedirect, setAdminRedirect] = useState();
  const [redirect, setRedirect] = useState();
  const [user, setUser] = useState();
  const [streetlibUser, setStreetlibUser] = useState();
  const [hydrated, setHydrated] = useState(false);

  return (
    <AuthContext.Provider
      value={{
        error,
        loading,
        redirect,
        user,
        streetlibUser,
        feedbackMessage,
        inputUsername,
        inputPassword,
        setFeedbackMessage,
        handleLogin,
        handleLogout,
        handleUpdate,
        handleChangePassword,
        handleGetUrlParameter,
        handleSignedInRedirect,
        handleAdminLogin,
        handleGetCurrentAuthenticatedUser,
        setError,
      }}
    >
      {hydrated && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
