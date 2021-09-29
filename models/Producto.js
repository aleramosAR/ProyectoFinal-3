import mongoose from 'mongoose';

const ProductoSchema = new mongoose.Schema({
  nombre: {
    type: 'String',
    maxLength: 50,
    required: true
  },
  descripcion: {
    type: 'String',
    maxLength: 100,
    required: true
  },
  codigo: {
    type: 'Number',
    required: true
  },
  foto: {
    type: 'String',
    maxLength: 100,
    required: true
  },
  precio: {
    type: 'Number',
    required: true
  },
  stock: {
    type: 'Number',
    required: true
  },
  timestamp: {
    type: 'String',
    maxLength: 50,
    required: true
  },
});

// Opcion para que MongoDB devuelva _id como parte del objeto bajo el parametro id
// Necesario para que funcione igual que el resto de las opciones de base.
ProductoSchema.virtual('id').get(function(){ return this._id.toHexString(); });
ProductoSchema.set('toJSON', { virtuals: true });

export default mongoose.model('producto', ProductoSchema);