import { signOut } from 'next-auth/react'
import { useEffect } from 'react'

const SignOut = () => {
  useEffect(() => {
    localStorage.removeItem('token');
    signOut({ redirect: false });
  }, [])
}

export default SignOut;