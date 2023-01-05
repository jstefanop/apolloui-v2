import { signOut } from 'next-auth/react'
import Router from 'next/router'
import { useEffect } from 'react'

const SignOut = () => {
  useEffect(() => {
    localStorage.removeItem('token');
    signOut({ redirect: false });
    Router.replace('/signin');
  }, [])
}

export default SignOut;