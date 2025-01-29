import express from 'express';
import { propiedadController } from '../controllers/propiedadController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Proteger todas las rutas con autenticación
router.use(authMiddleware);

// Rutas para propiedades
router.get('/', propiedadController.getAll);
router.post('/', propiedadController.create);
router.get('/:id', propiedadController.getOne);
router.put('/:id', propiedadController.update);
router.delete('/:id', propiedadController.delete);

export default router; 