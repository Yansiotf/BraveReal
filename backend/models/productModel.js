const mongoose = require('mongoose');

const productSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Veuillez entrer un nom de produit'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Veuillez entrer une description']
    },
    price: {
      type: Number,
      required: [true, 'Veuillez entrer un prix'],
      default: 0
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Category'
    },
    image: {
      type: String,
      required: false
    },
    countInStock: {
      type: Number,
      required: true,
      default: -1 // -1 signifie stock illimité pour les services numériques
    }
  },
  {
    timestamps: true
  }
);

const Product = mongoose.model('Product', productSchema);

module.exports = Product;