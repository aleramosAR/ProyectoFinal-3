import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  username: {
    type: 'String',
    maxLength: 50,
    required: true
  },
  password: {
    type: 'String',
    maxLength: 100,
    required: true
  },
  email: {
    type: 'String',
    maxLength: 50,
    required: true
  },
  telefono: {
    type: 'String',
    maxLength: 50,
    required: true
  },
  direccion: {
    type: 'String',
    maxLength: 100,
    required: true
  },
  edad: {
    type: 'String',
    maxLength: 50,
    required: true
  },
  foto: {
    type: 'String',
    maxLength: 50,
    required: true
  },
});

export default mongoose.model('user', UserSchema);