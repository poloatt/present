import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import clienteAxios from '../../config/axios';
// import { logEnvironment } from '../../config/envConfig';

// Registrar información del entorno para depuración
// logEnvironment();

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
        console.log('Iniciando manejo de callback de Google');
        const params = new URLSearchParams(location.search);
        const token = params.get('token');
        const refreshToken = params.get('refreshToken');
        const error = params.get('error');

        if (error) {
          console.error('Error en callback:', error);
          toast.error(ERROR_MESSAGES[error] || ERROR_MESSAGES.default);
          navigate('/login');
          return;
        }

        if (!token) {
          console.error('No se recibió token de autenticación');
          toast.error(ERROR_MESSAGES.token_missing);
          navigate('/login');
          return;
        }

        // Guardar tokens
        localStorage.setItem('token', token);
        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken);
        }

        // Configurar axios
        clienteAxios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        // Verificar autenticación
        const authResult = await checkAuth();
        
        if (authResult) {
          console.log('Autenticación exitosa, redirigiendo a assets');
          toast.success('¡Bienvenido!');
          navigate('/assets', { replace: true });
        } else {
          throw new Error('Fallo en la verificación de autenticación');
        }
      } catch (error) {
        console.error('Error en el callback:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        delete clienteAxios.defaults.headers.common['Authorization'];
        toast.error(error.response?.data?.message || 'Error en la autenticación');
        navigate('/login');
      }
    };

    handleCallback();
  }, [navigate, location.search, checkAuth]);

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
