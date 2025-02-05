import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import clienteAxios from '../../config/axios';

const ERROR_MESSAGES = {
  'auth_failed': 'La autenticación con Google falló',
  'no_user_info': 'No se pudo obtener la información del usuario',
  'server_error': 'Error en el servidor',
  'token_missing': 'No se recibió el token de autenticación',
  'default': 'Error desconocido en la autenticación'
};

function AuthCallback() {
  const navigate = useNavigate();
  const location = useLocation();
  const { checkAuth } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const params = new URLSearchParams(location.search);
        const token = params.get('token');
        const error = params.get('error');

        if (error) {
          const errorMessage = ERROR_MESSAGES[error] || ERROR_MESSAGES.default;
          console.error('Error de autenticación:', error);
          toast.error(errorMessage);
          navigate('/login');
          return;
        }

        if (!token) {
          console.error('No se recibió token');
          toast.error(ERROR_MESSAGES.token_missing);
          navigate('/login');
          return;
        }

        localStorage.setItem('token', token);
        clienteAxios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        const authResult = await checkAuth();
        
        if (authResult.error) {
          throw new Error(authResult.error);
        }

        toast.success('¡Bienvenido!');
        navigate('/dashboard', { replace: true });
      } catch (error) {
        console.error('Error en el callback:', error);
        toast.error('Error al procesar la autenticación');
        localStorage.removeItem('token');
        delete clienteAxios.defaults.headers.common['Authorization'];
        navigate('/login');
      }
    };

    handleCallback();
  }, [navigate, location, checkAuth]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-4">Procesando autenticación...</h2>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
      </div>
    </div>
  );
}

export default AuthCallback; 