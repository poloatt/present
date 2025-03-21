import mongoose from 'mongoose';
import { createSchema, commonFields } from './BaseSchema.js';

const rutinaSchema = createSchema({
  fecha: {
    type: Date,
    default: Date.now,
    required: true
  },
  bodyCare: {
    bath: { type: Boolean, default: false },
    skinCareDay: { type: Boolean, default: false },
    skinCareNight: { type: Boolean, default: false },
    bodyCream: { type: Boolean, default: false }
  },
  nutricion: {
    cocinar: { type: Boolean, default: false },
    agua: { type: Boolean, default: false },
    protein: { type: Boolean, default: false },
    meds: { type: Boolean, default: false }
  },
  ejercicio: {
    meditate: { type: Boolean, default: false },
    stretching: { type: Boolean, default: false },
    gym: { type: Boolean, default: false },
    cardio: { type: Boolean, default: false }
  },
  cleaning: {
    bed: { type: Boolean, default: false },
    platos: { type: Boolean, default: false },
    piso: { type: Boolean, default: false },
    ropa: { type: Boolean, default: false }
  },
  completitud: {
    type: Number,
    default: 0,
    min: 0,
    max: 1
  },
  completitudPorSeccion: {
    bodyCare: { type: Number, default: 0, min: 0, max: 1 },
    nutricion: { type: Number, default: 0, min: 0, max: 1 },
    ejercicio: { type: Number, default: 0, min: 0, max: 1 },
    cleaning: { type: Number, default: 0, min: 0, max: 1 }
  },
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
    required: true
  },
  ...commonFields
});

// Crear un índice compuesto único para fecha y usuario
rutinaSchema.index({ 
  usuario: 1, 
  fecha: 1 
}, { 
  unique: true,
  name: 'usuario_fecha_unique',
  partialFilterExpression: { fecha: { $exists: true } }
});

// Middleware para normalizar la fecha antes de guardar
rutinaSchema.pre('save', function(next) {
  if (this.isModified('fecha')) {
    // Normalizar la fecha a UTC
    const fecha = new Date(this.fecha);
    fecha.setUTCHours(0, 0, 0, 0);
    this.fecha = fecha;
  }
  next();
});

// Middleware para validar que no exista otra rutina en el mismo día
rutinaSchema.pre('save', async function(next) {
  if (this.isModified('fecha')) {
    const fechaInicio = new Date(this.fecha);
    fechaInicio.setUTCHours(0, 0, 0, 0);
    
    const fechaFin = new Date(fechaInicio);
    fechaFin.setUTCHours(23, 59, 59, 999);

    const existingRutina = await this.constructor.findOne({
      _id: { $ne: this._id },
      usuario: this.usuario,
      fecha: {
        $gte: fechaInicio,
        $lte: fechaFin
      }
    });

    if (existingRutina) {
      next(new Error('Ya existe una rutina para esta fecha'));
    }
  }
  next();
});

rutinaSchema.pre('save', function(next) {
  let totalTasks = 0;
  let completedTasks = 0;

  // Calcular completitud por sección
  ['bodyCare', 'nutricion', 'ejercicio', 'cleaning'].forEach(section => {
    const sectionFields = Object.keys(this[section].toObject());
    const sectionTotal = sectionFields.length;
    let sectionCompleted = 0;
    
    Object.values(this[section].toObject()).forEach(value => {
      if (value === true) sectionCompleted++;
    });

    // Actualizar completitud de la sección
    this.completitudPorSeccion[section] = sectionTotal > 0 ? sectionCompleted / sectionTotal : 0;
    
    // Acumular para completitud general
    totalTasks += sectionTotal;
    completedTasks += sectionCompleted;
  });

  // Actualizar completitud general
  this.completitud = totalTasks > 0 ? completedTasks / totalTasks : 0;
  next();
});

export const Rutinas = mongoose.model('Rutinas', rutinaSchema); 