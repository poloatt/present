import mongoose from 'mongoose';
import { createSchema, commonFields } from './BaseSchema.js';

const proyectoSchema = createSchema({
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
    required: true
  },
  nombre: {
    type: String,
    required: true,
    trim: true
  },
  descripcion: String,
  estado: {
    type: String,
    enum: ['PENDIENTE', 'EN_PROGRESO', 'COMPLETADO', 'CANCELADO'],
    default: 'PENDIENTE'
  },
  fechaInicio: {
    type: Date,
    default: Date.now
  },
  fechaFin: Date,
  prioridad: {
    type: String,
    enum: ['BAJA', 'MEDIA', 'ALTA'],
    default: 'MEDIA'
  },
  presupuesto: {
    monto: Number,
    moneda: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Monedas'
    }
  },
  etiquetas: [String],
  archivos: [{
    nombre: String,
    url: String,
    tipo: String
  }],
  propiedad: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Propiedades'
  },
  tareas: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tareas'
  }],
  ...commonFields
});

// Middleware para poblar referencias cuando se consulte un proyecto
proyectoSchema.pre(['find', 'findOne'], function() {
  this.populate([
    {
      path: 'tareas',
      populate: {
        path: 'subtareas',
        model: 'Subtareas'
      }
    },
    {
      path: 'presupuesto.moneda'
    },
    {
      path: 'propiedad',
      select: 'nombre direccion'
    }
  ]);
});

// Middleware para validar fechas
proyectoSchema.pre('save', function(next) {
  if (this.fechaFin && this.fechaInicio > this.fechaFin) {
    next(new Error('La fecha de fin debe ser posterior a la fecha de inicio'));
  }
  next();
});

export const Proyectos = mongoose.model('Proyectos', proyectoSchema); 