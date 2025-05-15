const mongoose = require('mongoose');

const categorySchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Veuillez entrer un nom de catégorie'],
      unique: true,
      trim: true
    },
    description: {
      type: String,
      required: false
    },
    icon: {
      type: String,
      required: false
    }
  },
  {
    timestamps: true
  }
);

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;