import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import clienteAxios from '../config/axios';
import currentConfig from '../config/envConfig';

const AuthContext = createContext();

// Hook personalizado para usar el contexto de autenticación
const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

// Configurar axios con la URL base y credenciales
clienteAxios.defaults.baseURL = currentConfig.baseUrl;
clienteAxios.defaults.withCredentials = true;

export function AuthProvider({ children }) {
  const [state, setState] = useState({
    user: null,
    loading: true,
    error: null,
    isAuthenticated: false
  });

  const checkAuth = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setState(prev => ({ ...prev, user: null, loading: false, isAuthenticated: false }));
        return false;
      }

      clienteAxios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const { data } = await clienteAxios.get(`${currentConfig.authPrefix}/check`);
      
      if (data.authenticated && data.user) {
        setState(prev => ({ 
          ...prev, 
          user: data.user, 
          loading: false, 
          isAuthenticated: true,
          error: null 
        }));
        return true;
      } else {
        setState(prev => ({ 
          ...prev, 
          user: null, 
          loading: false, 
          isAuthenticated: false 
        }));
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        delete clienteAxios.defaults.headers.common['Authorization'];
        return false;
      }
    } catch (error) {
      if (error.response?.status === 401) {
        try {
          const refreshToken = localStorage.getItem('refreshToken');
          if (refreshToken) {
            const { data: refreshData } = await clienteAxios.post(`${currentConfig.authPrefix}/refresh`, {
              refreshToken
            });
            if (refreshData.token) {
              localStorage.setItem('token', refreshData.token);
              if (refreshData.refreshToken) {
                localStorage.setItem('refreshToken', refreshData.refreshToken);
              }
              clienteAxios.defaults.headers.common['Authorization'] = `Bearer ${refreshData.token}`;
              return checkAuth();
            }
          }
        } catch (refreshError) {
        }
      }
      setState(prev => ({ 
        ...prev, 
        user: null, 
        error: error.response?.data?.message || error.message,
        loading: false,
        isAuthenticated: false
      }));
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      delete clienteAxios.defaults.headers.common['Authorization'];
      return false;
    }
  }, []);

  const login = async (credentials) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const response = await clienteAxios.post(`${currentConfig.authPrefix}/login`, credentials);
      const { token, refreshToken } = response.data;
      
      if (!token) {
        throw new Error('No se recibió token del servidor');
      }

      localStorage.setItem('token', token);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
      clienteAxios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      const authResult = await checkAuth();
      if (!authResult) {
        throw new Error('Fallo en la verificación de autenticación');
      }
      return response.data;
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error.response?.data?.message || error.message,
        isAuthenticated: false 
      }));
      throw error;
    }
  };

  const loginWithGoogle = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const { data } = await clienteAxios.get(`${currentConfig.authPrefix}/google/url`);
      
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No se pudo obtener la URL de autenticación');
      }
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error.response?.data?.message || 'Error al iniciar sesión con Google',
        loading: false,
        isAuthenticated: false
      }));
      throw error;
    }
  }, []);

  const handleGoogleCallback = useCallback(async (code) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const { data } = await clienteAxios.post(`${currentConfig.authPrefix}/google/callback`, { code });
      
      if (data.token) {
        localStorage.setItem('token', data.token);
        if (data.refreshToken) {
          localStorage.setItem('refreshToken', data.refreshToken);
        }
        await checkAuth();
      } else {
        throw new Error('No se recibió el token de autenticación');
      }
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        user: null,
        error: 'Error al completar la autenticación con Google',
        loading: false
      }));
    }
  }, [checkAuth]);

  const logout = async () => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      const token = localStorage.getItem('token');
      if (token) {
        await clienteAxios.post(`${currentConfig.authPrefix}/logout`, null, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch (error) {
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      delete clienteAxios.defaults.headers.common['Authorization'];
      setState({ 
        user: null, 
        loading: false, 
        error: null, 
        isAuthenticated: false 
      });
      window.location.href = `${currentConfig.frontendUrl}/login`;
    }
  };

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const value = {
    user: state.user,
    loading: state.loading,
    error: state.error,
    isAuthenticated: state.isAuthenticated,
    login,
    loginWithGoogle,
    handleGoogleCallback,
    checkAuth,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export { useAuth };
