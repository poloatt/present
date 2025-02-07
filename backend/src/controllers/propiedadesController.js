import { BaseController } from './BaseController.js';
import { Propiedades } from '../models/index.js';

class PropiedadesController extends BaseController {
  constructor() {
    super(Propiedades, {
      searchFields: ['titulo', 'descripcion', 'direccion', 'ciudad']
    });

    // Bind de los métodos al contexto de la instancia
    this.getStats = this.getStats.bind(this);
    this.getAllAdmin = this.getAllAdmin.bind(this);
    this.updateStatus = this.updateStatus.bind(this);
  }

  // GET /api/propiedades/stats
  async getStats(req, res) {
    try {
      const total = await this.Model.countDocuments({ usuario: req.user.id });
      const ocupadas = await this.Model.countDocuments({ 
        usuario: req.user.id,
        estado: 'OCUPADA'
      });

      res.json({
        total,
        ocupadas,
        disponibles: total - ocupadas
      });
    } catch (error) {
      console.error('Error en getStats propiedades:', error);
      res.status(500).json({ message: error.message });
    }
  }

  // GET /api/propiedades/admin/all
  async getAllAdmin(req, res) {
    try {
      const result = await this.Model.paginate(
        {},
        {
          populate: { path: 'usuario', select: 'nombre email' },
          sort: { createdAt: 'desc' }
        }
      );
      res.json(result);
    } catch (error) {
      console.error('Error al obtener propiedades:', error);
      res.status(500).json({ error: 'Error al obtener propiedades' });
    }
  }

  // PATCH /api/propiedades/:id/status
  async updateStatus(req, res) {
    try {
      const { status } = req.body;
      const propiedad = await this.Model.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true }
      ).populate('usuario', 'nombre email');

      if (!propiedad) {
        return res.status(404).json({ error: 'Propiedad no encontrada' });
      }

      res.json(propiedad);
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      res.status(500).json({ error: 'Error al actualizar estado' });
    }
  }
}

export const propiedadesController = new PropiedadesController(); 