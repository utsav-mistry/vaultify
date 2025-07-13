import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const useAuthNavigation = () => {
    const navigate = useNavigate();
    const { user, loading } = useAuth();

    // Navigate to dashboard if user is already authenticated
    const navigateToDashboard = () => {
        if (user && !loading) {
            navigate('/dashboard', { replace: true });
            return true;
        }
        return false;
    };

    // Navigate to login with redirect to dashboard if already authenticated
    const navigateToLogin = () => {
        if (user && !loading) {
            navigate('/dashboard', { replace: true });
            return true;
        }
        navigate('/login');
        return false;
    };

    // Navigate to register with redirect to dashboard if already authenticated
    const navigateToRegister = () => {
        if (user && !loading) {
            navigate('/dashboard', { replace: true });
            return true;
        }
        navigate('/register');
        return false;
    };

    // Check if user should be redirected to dashboard
    const shouldRedirectToDashboard = () => {
        return user && !loading;
    };

    return {
        navigateToDashboard,
        navigateToLogin,
        navigateToRegister,
        shouldRedirectToDashboard,
        isAuthenticated: !!user && !loading
    };
}; 