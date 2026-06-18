import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, minlength: 8, select: false },
    googleId: { type: String, index: true },
    authProvider: { type: String, enum: ['manual', 'google'], default: 'manual' },
    avatar: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: true } }
)

export default mongoose.model('User', userSchema)
