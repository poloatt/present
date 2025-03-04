import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import clienteAxios from '../../config/axios';

// Configuración según el ambiente
const config = {
  development: {
    authPrefix: '/api/auth',
    apiPrefix: '/api'
  },
  production: {
    authPrefix: '/api/auth',
    apiPrefix: '/api'
  }
};

// Determinar el ambiente actual
const env = import.meta.env.MODE || 'development';
const currentConfig = config[env];

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
          navigate('/login', { replace: true });
          return;
        }

        if (!token) {
          console.error('No se recibió token en el callback');
          toast.error('Error en la autenticación');
          navigate('/login', { replace: true });
          return;
        }

        console.log('Tokens recibidos, procediendo a guardarlos');
        
        // Limpiar tokens existentes
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        
        // Guardar nuevos tokens
        localStorage.setItem('token', token);
        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken);
        }
        
        // Configurar Axios
        clienteAxios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        console.log('Tokens guardados y Axios configurado');
        
        // Verificar autenticación
        const isAuthenticated = await checkAuth();
        
        if (isAuthenticated) {
          console.log('Autenticación exitosa, redirigiendo al dashboard');
          toast.success('¡Bienvenido!');
          navigate('/dashboard', { replace: true });
        } else {
          throw new Error('Error de verificación de autenticación');
        }
      } catch (error) {
        console.error('Error en el callback:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        delete clienteAxios.defaults.headers.common['Authorization'];
        toast.error('Error en la autenticación');
        navigate('/login', { replace: true });
      }
    };

    // Solo ejecutar si hay parámetros en la URL
    const params = new URLSearchParams(location.search);
    if (params.get('token') || params.get('error')) {
      handleCallback();
    } else {
      navigate('/login', { replace: true });
    }
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