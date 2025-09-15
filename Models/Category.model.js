import mongoose, { model, Schema } from 'mongoose'

const CategorySchema = new Schema(
  {
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    image: {
      public_id: { type: String, default: 'Public_id' },
      url: { type: String, default: 'default.png' },
    },
    name: { type: String, required: true, trim: true, unique: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, trim: true },

    availableItems: { type: Number, default: 0 },

    sortOrder: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
)

const Category = mongoose.models.Category || model('Category', CategorySchema)
export default Category
