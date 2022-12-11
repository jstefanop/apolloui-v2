import { useEffect } from 'react';
import { useSelector } from 'react-redux';

const isBrowser = () => typeof window !== "undefined";

const ProtectedRoute = ({ router, children }) => {
    let unProtectedRoutes = ["/signin"];

    let pathIsUnProtected = unProtectedRoutes.indexOf(router.pathname) !== -1;

    const {
        authState
    } = useSelector((state) => state.auth);

    useEffect(() => {
        if (isBrowser() && authState === 'SIGNEDIN' && pathIsUnProtected) {
            router.push(`/dashboard`);
        }

        if (isBrowser() && authState === 'SIGNEDOUT') {
            router.push(`/signin`);
        }
    }, [router, authState, pathIsUnProtected]);

    return children;
};

export default ProtectedRoute;
