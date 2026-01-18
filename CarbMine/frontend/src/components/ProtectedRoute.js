import React from 'react';
import { Navigate } from 'react-router-dom';
import { useFirebase } from '../context/Firebase';

const ProtectedRoute = ({ element: Element, ...rest }) => {
    const { isLoggedIn } = useFirebase();

    // Optionally use local storage directly to handle isLoggedIn status
    const isLoggedInFromLocalStorage = localStorage.getItem('isLoggedIn') === 'true';

    return isLoggedInFromLocalStorage ? <Element {...rest} /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;