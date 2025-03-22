import { passportConfig } from '../config/passport.js';

const handleAuthError = (error, req) => {
  console.error('Error de autenticación:', {
    error: error.message,
    path: req.path,
    method: req.method,
    ip: req.ip,
    timestamp: new Date().toISOString()
  });
  return { status: 500, message: 'Error en autenticación' };
};

const handleUnauthorized = (req) => {
  console.warn('Acceso no autorizado:', {
    path: req.path,
    method: req.method,
    ip: req.ip,
    timestamp: new Date().toISOString()
  });
  
  // Si es una petición a /check o /auth/check, devolver authenticated: false
  if (req.path === '/check' || req.path === '/auth/check') {
    return { status: 200, message: { authenticated: false } };
  }
  
  // Para otras rutas, devolver error 401
  return { status: 401, message: { error: 'Token no válido o expirado' } };
};

export const checkAuth = (req, res, next) => {
  console.log('Verificando autenticación para:', {
    path: req.path,
    method: req.method,
    headers: {
      ...req.headers,
      authorization: req.headers.authorization ? req.headers.authorization.substring(0, 20) + '...' : undefined
    }
  });

  // Decodificar el token manualmente para debugging
  if (req.headers.authorization) {
    const token = req.headers.authorization.split(' ')[1];
    try {
      const decoded = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      console.log('Token decodificado:', {
        userId: decoded.user?.id,
        email: decoded.user?.email,
        exp: new Date(decoded.exp).toISOString(),
        iat: new Date(decoded.iat).toISOString(),
        type: decoded.type
      });
    } catch (error) {
      console.error('Error al decodificar token:', error);
    }
  }

  passportConfig.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err) {
      console.error('Error en autenticación JWT:', err);
      const { status, message } = handleAuthError(err, req);
      return res.status(status).json(message);
    }

    if (!user) {
      console.log('Usuario no encontrado o token inválido. Info:', info);
      const { status, message } = handleUnauthorized(req);
      return res.status(status).json(message);
    }

    // Verificar si el usuario está activo
    if (!user.activo) {
      console.warn('Usuario inactivo intentando acceder:', {
        userId: user.id,
        path: req.path,
        method: req.method,
        timestamp: new Date().toISOString()
      });
      return res.status(403).json({ error: 'Usuario inactivo' });
    }

    console.log('Usuario autenticado:', {
      userId: user.id,
      email: user.email,
      role: user.role
    });

    req.user = user;
    next();
  })(req, res, next);
};

export const checkRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'No tienes permisos para realizar esta acción' });
    }

    next();
  };
}; 