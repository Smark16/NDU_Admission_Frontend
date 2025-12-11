import { useContext, useEffect } from 'react';
import { AuthContext } from '../Context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

function Logout() {
    // Destructure values from AuthContext, with a fallback to avoid errors
    const authContext = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        // Ensure authContext is not null or undefined before proceeding
        if (!authContext) {
            console.error("AuthContext not available. Cannot log out.");
            return;
        }

        // Destructure state setters here, inside the effect
        const { setLoggedUser, setAuthTokens } = authContext;

        const logoutUser = () => {
            // Clear state and localStorage
            setAuthTokens(null);
            setLoggedUser(null);
            localStorage.removeItem("authtokens");

            // Show a success alert
            Swal.fire({
                icon: 'success',
                title: 'Logged Out Successfully',
                text: 'You have been logged out.',
                confirmButtonText: 'OK'
            }).then(() => {
                navigate('/');
            });
        };

        logoutUser();
    }, [authContext, navigate]);

    return null; 
}

export default Logout;