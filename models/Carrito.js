import mongoose from 'mongoose';

const CarritoSchema = new mongoose.Schema({
  productos: {
    type: ['String'],
    required: true
  },
  timestamp: {
    type: 'String',
    maxLength: 50,
    required: true
  },
  userID: {
    type: 'String',
    maxLength: 50,
  },
});

// Opcion para que MongoDB devuelva _id como parte del objeto bajo el parametro id
// Necesario para que funcione igual que el resto de las opciones de base.
CarritoSchema.virtual('id').get(function(){ return this._id.toHexString(); });
CarritoSchema.set('toJSON', { virtuals: true });

export default mongoose.model('carrito', CarritoSchema);