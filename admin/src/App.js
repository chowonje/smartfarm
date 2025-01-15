import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import UserManagement from './pages/UserManagement';
import PrivateRoute from './components/PrivateRoute';
import FarmManagement from './pages/FarmManagement';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route 
                    path="/dashboard" 
                    element={
                        <PrivateRoute>
                            <Dashboard />
                        </PrivateRoute>
                    } 
                />
                <Route 
                    path="/users" 
                    element={
                        <PrivateRoute>
                            <UserManagement />
                        </PrivateRoute>
                    } 
                />
                <Route 
                    path="/farms" 
                    element={
                        <PrivateRoute>
                            <FarmManagement />
                        </PrivateRoute>
                    } 
                />
                <Route path="/" element={<Navigate to="/dashboard" />} />
            </Routes>
        </Router>
    );
}

export default App;