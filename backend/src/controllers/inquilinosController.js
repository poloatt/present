import { BaseController } from './BaseController.js';
import { Inquilinos, Propiedades } from '../models/index.js';
import mongoose from 'mongoose';

class InquilinosController extends BaseController {
  constructor() {
    super(Inquilinos, {
      searchFields: ['nombre', 'apellido', 'dni', 'email', 'telefono']
    });

    // Bind de los métodos al contexto de la instancia
    this.getActivos = this.getActivos.bind(this);
    this.getAdminStats = this.getAdminStats.bind(this);
    this.create = this.create.bind(this);
    this.getAll = this.getAll.bind(this);
    this.getAllByPropiedad = this.getAllByPropiedad.bind(this);
    this.checkIn = this.checkIn.bind(this);
    this.getFullInfo = this.getFullInfo.bind(this);
    this.getByEstado = this.getByEstado.bind(this);
    this.getActivosByPropiedad = this.getActivosByPropiedad.bind(this);
    this.getPendientesByPropiedad = this.getPendientesByPropiedad.bind(this);
  }

  // Método auxiliar para formatear la respuesta
  formatResponse(doc) {
    if (!doc) return null;
    const formatted = doc.toObject ? doc.toObject() : doc;
    return {
      ...formatted,
      id: formatted._id,
      propiedadId: formatted.propiedad?._id || formatted.propiedad
    };
  }

  // GET /api/inquilinos
  async getAll(req, res) {
    try {
      console.log('Obteniendo inquilinos...');
      console.log('Usuario autenticado:', req.user._id);

      // Primero, contar todos los inquilinos sin filtros
      const totalInquilinos = await this.Model.countDocuments();
      console.log('Total de inquilinos en la base de datos:', totalInquilinos);

      // Contar inquilinos del usuario
      const totalInquilinosUsuario = await this.Model.countDocuments({ usuario: req.user._id });
      console.log('Total de inquilinos del usuario:', totalInquilinosUsuario);

      // Construir el filtro base - solo por usuario
      const filter = { 
        usuario: req.user._id
      };

      console.log('Filtro final:', JSON.stringify(filter));

      // Obtener todos los inquilinos con el filtro
      const inquilinos = await this.Model.find(filter);
      console.log('Inquilinos encontrados (pre-población):', inquilinos.length);
      
      // Log detallado de cada inquilino encontrado
      inquilinos.forEach(inquilino => {
        console.log('Detalles del inquilino:', {
          id: inquilino._id,
          nombre: inquilino.nombre,
          apellido: inquilino.apellido,
          estado: inquilino.estado,
          propiedad: inquilino.propiedad || 'Sin propiedad asignada',
          contratos: inquilino.contratos?.length || 0
        });
      });
      
      // Paginar resultados
      const result = await this.Model.paginate(
        filter,
        {
          populate: [
            {
              path: 'propiedad',
              select: 'titulo direccion ciudad'
            },
            {
              path: 'contratos',
              select: 'estado fechaInicio fechaFin propiedad'
            }
          ],
          sort: { createdAt: -1 },
          limit: 1000
        }
      );

      const docs = result.docs.map(doc => {
        const formatted = this.formatResponse(doc);
        console.log('Inquilino procesado:', {
          id: formatted.id,
          nombre: formatted.nombre,
          estado: formatted.estado,
          propiedad: formatted.propiedad?.titulo || 'Sin propiedad asignada',
          contratos: formatted.contratos?.length || 0
        });
        return formatted;
      });

      console.log('Total de inquilinos encontrados:', docs.length);
      res.json({ ...result, docs });
    } catch (error) {
      console.error('Error al obtener inquilinos:', error);
      res.status(500).json({ error: 'Error al obtener inquilinos' });
    }
  }

  // POST /api/inquilinos/:id/check-in/:propiedadId
  async checkIn(req, res) {
    try {
      const { id, propiedadId } = req.params;
      
      const inquilino = await this.Model.findById(id);
      if (!inquilino) {
        return res.status(404).json({ error: 'Inquilino no encontrado' });
      }

      await inquilino.checkIn(propiedadId);
      const updated = await inquilino.populate('propiedad');
      
      res.json(this.formatResponse(updated));
    } catch (error) {
      console.error('Error en check-in:', error);
      res.status(400).json({ 
        error: 'Error en check-in',
        details: error.message 
      });
    }
  }

  // GET /api/inquilinos/:id/full-info
  async getFullInfo(req, res) {
    try {
      const { id } = req.params;
      const inquilino = await this.Model.findById(id);
      
      if (!inquilino) {
        return res.status(404).json({ error: 'Inquilino no encontrado' });
      }

      const fullInfo = await inquilino.getFullInfo();
      res.json(this.formatResponse(fullInfo));
    } catch (error) {
      console.error('Error al obtener información completa:', error);
      res.status(500).json({ error: 'Error al obtener información completa' });
    }
  }

  // GET /api/inquilinos/estado/:estado
  async getByEstado(req, res) {
    try {
      const { estado } = req.params;
      const result = await this.Model.paginate(
        { 
          usuario: req.user._id,
          estado: estado.toUpperCase()
        },
        {
          populate: ['propiedad'],
          sort: { createdAt: 'desc' }
        }
      );

      const docs = result.docs.map(doc => this.formatResponse(doc));
      res.json({ ...result, docs });
    } catch (error) {
      console.error('Error al obtener inquilinos por estado:', error);
      res.status(500).json({ error: 'Error al obtener inquilinos por estado' });
    }
  }

  // GET /api/inquilinos/propiedad/:propiedadId/activos
  async getActivosByPropiedad(req, res) {
    try {
      const { propiedadId } = req.params;
      const result = await this.Model.paginate(
        {
          usuario: req.user._id,
          propiedad: propiedadId,
          estado: 'ACTIVO'
        },
        {
          populate: ['propiedad'],
          sort: { createdAt: 'desc' }
        }
      );

      const docs = result.docs.map(doc => this.formatResponse(doc));
      res.json({ ...result, docs });
    } catch (error) {
      console.error('Error al obtener inquilinos activos por propiedad:', error);
      res.status(500).json({ error: 'Error al obtener inquilinos activos por propiedad' });
    }
  }

  // GET /api/inquilinos/propiedad/:propiedadId/pendientes
  async getPendientesByPropiedad(req, res) {
    try {
      const { propiedadId } = req.params;
      const result = await this.Model.paginate(
        {
          usuario: req.user._id,
          propiedad: propiedadId,
          estado: 'PENDIENTE'
        },
        {
          populate: ['propiedad'],
          sort: { createdAt: 'desc' }
        }
      );

      const docs = result.docs.map(doc => this.formatResponse(doc));
      res.json({ ...result, docs });
    } catch (error) {
      console.error('Error al obtener inquilinos pendientes por propiedad:', error);
      res.status(500).json({ error: 'Error al obtener inquilinos pendientes por propiedad' });
    }
  }

  // Sobreescribimos el método create
  async create(req, res) {
    try {
      console.log('Creando inquilino:', req.body);
      const inquilino = await this.Model.create({
        ...req.body,
        usuario: req.user._id
      });
      
      const populatedInquilino = await this.Model.findById(inquilino._id)
        .populate('propiedad');

      console.log('Inquilino creado:', populatedInquilino);
      res.status(201).json(this.formatResponse(populatedInquilino));
    } catch (error) {
      console.error('Error al crear inquilino:', error);
      res.status(400).json({ 
        error: 'Error al crear inquilino',
        details: error.message 
      });
    }
  }

  // GET /api/inquilinos/activos
  async getActivos(req, res) {
    try {
      const inquilinos = await this.Model.paginate(
        { 
          usuario: req.user._id,
          estado: 'ACTIVO'
        },
        {
          populate: ['propiedad'],
          sort: { createdAt: 'desc' }
        }
      );
      
      const docs = inquilinos.docs.map(doc => this.formatResponse(doc));
      res.json({ ...inquilinos, docs });
    } catch (error) {
      console.error('Error al obtener inquilinos activos:', error);
      res.status(500).json({ error: 'Error al obtener inquilinos activos' });
    }
  }

  // GET /api/inquilinos/admin/stats
  async getAdminStats(req, res) {
    try {
      const stats = await Promise.all([
        this.Model.countDocuments(),
        this.Model.countDocuments({ estado: 'ACTIVO' }),
        this.Model.countDocuments({ estado: 'INACTIVO' }),
        this.Model.countDocuments({ estado: 'PENDIENTE' }),
        this.Model.countDocuments({ estado: 'RESERVADO' })
      ]);
      
      res.json({
        total: stats[0],
        activos: stats[1],
        inactivos: stats[2],
        pendientes: stats[3],
        reservados: stats[4]
      });
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      res.status(500).json({ error: 'Error al obtener estadísticas' });
    }
  }

  // GET /api/inquilinos/propiedad/:propiedadId
  async getAllByPropiedad(req, res) {
    try {
      const { propiedadId } = req.params;
      console.log(`Obteniendo inquilinos para propiedad ID: ${propiedadId}`);
      
      const result = await this.Model.paginate(
        { 
          propiedad: propiedadId,
          usuario: req.user._id
        },
        {
          populate: ['propiedad', 'contratos'],
          sort: { createdAt: 'desc' }
        }
      );
      
      const docs = result.docs.map(doc => this.formatResponse(doc));
      console.log(`Inquilinos encontrados para propiedad ${propiedadId}:`, docs.length);
      res.json({ ...result, docs });
    } catch (error) {
      console.error(`Error al obtener inquilinos para propiedad ${req.params.propiedadId}:`, error);
      res.status(500).json({ error: 'Error al obtener inquilinos para esta propiedad' });
    }
  }

  // PUT /api/inquilinos/:id
  async update(req, res) {
    try {
      console.log('Actualizando inquilino:', req.params.id);
      console.log('Datos de actualización:', req.body);

      const inquilino = await this.Model.findOne({
        _id: req.params.id,
        usuario: req.user._id
      });

      if (!inquilino) {
        return res.status(404).json({ error: 'Inquilino no encontrado' });
      }

      // Actualizar campos permitidos
      const camposPermitidos = [
        'nombre', 'apellido', 'email', 'telefono', 'dni',
        'nacionalidad', 'ocupacion', 'propiedad', 'estado'
      ];

      camposPermitidos.forEach(campo => {
        if (req.body[campo] !== undefined) {
          inquilino[campo] = req.body[campo];
        }
      });

      // Si se está actualizando la propiedad, asegurarse de que el estado sea correcto
      if (req.body.propiedad) {
        if (!inquilino.estado || inquilino.estado === 'INACTIVO') {
          inquilino.estado = 'PENDIENTE';
        }
      }

      await inquilino.save();
      console.log('Inquilino actualizado:', inquilino);

      const inquilinoActualizado = await this.Model.findById(inquilino._id)
        .populate('propiedad');

      res.json(this.formatResponse(inquilinoActualizado));
    } catch (error) {
      console.error('Error al actualizar inquilino:', error);
      res.status(400).json({
        error: 'Error al actualizar inquilino',
        details: error.message
      });
    }
  }

  // Método para obtener inquilinos por propiedad
  async getByPropiedad(req, res) {
    try {
      const inquilinos = await this.Model.find({
        propiedad: req.params.propiedadId,
        usuario: req.user._id
      }).populate('propiedad');

      res.json(this.formatResponse(inquilinos));
    } catch (error) {
      console.error('Error al obtener inquilinos por propiedad:', error);
      res.status(400).json({
        error: 'Error al obtener inquilinos',
        details: error.message
      });
    }
  }
}

export const inquilinosController = new InquilinosController(); 