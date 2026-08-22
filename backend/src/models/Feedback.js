import mongoose from 'mongoose'

const feedbackSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: false, trim: true, lowercase: true },
    message: { type: String, required: true, trim: true },
    rating: { type: Number, required: true, min: 1, max: 5, default: 5 },
  },
  { timestamps: { createdAt: true, updatedAt: true } }
)

export default mongoose.model('Feedback', feedbackSchema)
