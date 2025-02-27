import mongoose from 'mongoose';
import { createSchema, commonFields } from './BaseSchema.js';

const inquilinoSchema = createSchema({
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users'
  },
  nombre: {
    type: String,
    required: true,
    trim: true
  },
  apellido: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  telefono: {
    type: String,
    required: true
  },
  dni: {
    type: String,
    required: true
  },
  nacionalidad: {
    type: String,
    required: true
  },
  ocupacion: String,
  documentos: [{
    tipo: String,
    numero: String,
    archivo: String
  }],
  estado: {
    type: String,
    enum: ['ACTIVO', 'INACTIVO', 'PENDIENTE'],
    default: 'ACTIVO'
  },
  propiedad: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Propiedades'
  },
  contrato: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contratos'
  },
  ...commonFields
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Middleware para validar que la propiedad coincida con la del contrato
inquilinoSchema.pre('save', async function(next) {
  if ((this.isNew || this.isModified('contrato') || this.isModified('propiedad')) && this.contrato && this.propiedad) {
    try {
      const Contratos = mongoose.model('Contratos');
      const contrato = await Contratos.findById(this.contrato);
      
      if (!contrato) {
        throw new Error('El contrato especificado no existe');
      }
      
      if (contrato.propiedad.toString() !== this.propiedad.toString()) {
        throw new Error('La propiedad del inquilino debe coincidir con la propiedad del contrato');
      }
    } catch (error) {
      next(error);
    }
  }
  next();
});

// Agregar relación virtual con contratos
inquilinoSchema.virtual('contratos', {
  ref: 'Contratos',
  localField: '_id',
  foreignField: 'inquilino'
});

export const Inquilinos = mongoose.model('Inquilinos', inquilinoSchema);