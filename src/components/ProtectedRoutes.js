import { useEffect } from 'react';
import { useSession } from 'next-auth/react';

const ProtectedRoute = ({ router, children }) => {
  const { status, data } = useSession();

  useEffect(() => {
    // Set Graphql token to localstorage
    if (data?.user?.name) localStorage.setItem('token', data.user.name);

    // Redirect unauthenticated users
    if (status === 'unauthenticated') router.replace('/signin');
    else if (router.pathname === '/signin' && status === 'authenticated')
      router.replace('overview');
  }, [router, status, data]);

  return children;
};

export default ProtectedRoute;
