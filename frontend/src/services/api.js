import clienteAxios from '../config/axios';

export const api = {
  // Auth
  login: (credentials) => clienteAxios.post('/api/auth/login', credentials),
  register: (userData) => clienteAxios.post('/api/auth/register', userData),
  logout: () => clienteAxios.post('/api/auth/logout'),
  
  // Perfil
  getPerfil: () => clienteAxios.get('/api/perfil'),
  updatePerfil: (data) => clienteAxios.put('/api/perfil', data),
  updatePassword: (data) => clienteAxios.put('/api/perfil/password', data),
  
  // Propiedades
  getPropiedades: () => clienteAxios.get('/api/propiedades'),
  createPropiedad: (data) => clienteAxios.post('/api/propiedades', data),
  updatePropiedad: (id, data) => clienteAxios.put(`/api/propiedades/${id}`, data),
  deletePropiedad: (id) => clienteAxios.delete(`/api/propiedades/${id}`),
  
  // Documentos de Propiedades
  getDocumentosPropiedad: (propiedadId) => clienteAxios.get(`/api/propiedades/${propiedadId}/documentos`),
  sincronizarDocumentos: (propiedadId) => clienteAxios.post(`/api/propiedades/${propiedadId}/documentos/sincronizar`),
  agregarDocumento: (propiedadId, documentoData) => clienteAxios.post(`/api/propiedades/${propiedadId}/documentos`, documentoData),
  eliminarDocumento: (propiedadId, googleDriveId) => clienteAxios.delete(`/api/propiedades/${propiedadId}/documentos/${googleDriveId}`),
  getDocumentosPorCategoria: (propiedadId, categoria) => clienteAxios.get(`/api/propiedades/${propiedadId}/documentos/categoria/${categoria}`),
  crearCarpetaGoogleDrive: (propiedadId) => clienteAxios.post(`/api/propiedades/${propiedadId}/documentos/crear-carpeta`),
  
  // Proyectos
  getProyectos: () => clienteAxios.get('/api/proyectos'),
  createProyecto: (data) => clienteAxios.post('/api/proyectos', data),
  updateProyecto: (id, data) => clienteAxios.put(`/api/proyectos/${id}`, data),
  deleteProyecto: (id) => clienteAxios.delete(`/api/proyectos/${id}`),

  // Tareas
  getTareas: () => clienteAxios.get('/api/tareas'),
  getTareasByProyecto: (proyectoId) => clienteAxios.get(`/api/tareas/proyecto/${proyectoId}`),
  createTarea: (data) => clienteAxios.post('/api/tareas', data),
  updateTarea: (id, data) => clienteAxios.put(`/api/tareas/${id}`, data),
  deleteTarea: (id) => clienteAxios.delete(`/api/tareas/${id}`),

  // Transacciones
  getTransacciones: () => clienteAxios.get('/api/transacciones'),
  createTransaccion: (data) => clienteAxios.post('/api/transacciones', data),
  updateTransaccion: (id, data) => clienteAxios.put(`/transacciones/${id}`, data),
  deleteTransaccion: (id) => clienteAxios.delete(`/transacciones/${id}`),

  // Transacciones Recurrentes
  getTransaccionesRecurrentes: () => clienteAxios.get('/api/transaccionesrecurrentes'),
  createTransaccionRecurrente: (data) => clienteAxios.post('/api/transaccionesrecurrentes', data),
  updateTransaccionRecurrente: (id, data) => clienteAxios.put(`/transaccionesrecurrentes/${id}`, data),
  deleteTransaccionRecurrente: (id) => clienteAxios.delete(`/transaccionesrecurrentes/${id}`),
  generarTransaccionesRecurrentes: () => clienteAxios.post('/api/transaccionesrecurrentes/generar'),

  // Monedas
  getMonedas: () => clienteAxios.get('/api/monedas'),
  
  // Cuentas
  getCuentas: () => clienteAxios.get('/api/cuentas'),
  createCuenta: (data) => clienteAxios.post('/api/cuentas', data),
  updateCuenta: (id, data) => clienteAxios.put(`/cuentas/${id}`, data),
  deleteCuenta: (id) => clienteAxios.delete(`/cuentas/${id}`)
};
