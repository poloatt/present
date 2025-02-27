import mongoose from 'mongoose';
import { createSchema, commonFields } from './BaseSchema.js';

const rutinaSchema = createSchema({
  weight: {
    type: Number,
    required: true
  },
  muscle: {
    type: Number,
    required: true
  },
  fatPercent: {
    type: Number,
    required: true
  },
  stress: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  sleep: {
    type: Number,
    required: true
  },
  completitud: {
    type: Number,
    default: 0,
    min: 0,
    max: 1
  },
  fecha: {
    type: Date,
    default: Date.now
  },
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
    required: true
  },
  ...commonFields
});

export const Rutinas = mongoose.model('Rutinas', rutinaSchema); 