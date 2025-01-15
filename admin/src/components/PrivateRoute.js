import { Navigate } from 'react-router-dom';

function PrivateRoute({ children }) {
    const adminToken = localStorage.getItem('adminToken');
    const adminInfo = localStorage.getItem('adminInfo');

    if (!adminToken || !adminInfo) {
        return <Navigate to="/login" />;
    }

    return children;
}

export default PrivateRoute;