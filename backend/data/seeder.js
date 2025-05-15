const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('../models/userModel');
const Category = require('../models/categoryModel');
const Product = require('../models/productModel');

// Charger les variables d'environnement
dotenv.config();

// Connexion à la base de données
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Données initiales
const users = [
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password: bcrypt.hashSync('123456', 10),
    isAdmin: true,
  },
  {
    name: 'John Doe',
    email: 'john@example.com',
    password: bcrypt.hashSync('123456', 10),
  },
  {
    name: 'Jane Doe',
    email: 'jane@example.com',
    password: bcrypt.hashSync('123456', 10),
  },
];

const categories = [
  {
    name: 'Instagram',
    description: 'Services pour Instagram',
    icon: 'fab fa-instagram',
  },
  {
    name: 'TikTok',
    description: 'Services pour TikTok',
    icon: 'fab fa-tiktok',
  },
  {
    name: 'YouTube',
    description: 'Services pour YouTube',
    icon: 'fab fa-youtube',
  },
  {
    name: 'Facebook',
    description: 'Services pour Facebook',
    icon: 'fab fa-facebook',
  },
  {
    name: 'Twitter',
    description: 'Services pour Twitter',
    icon: 'fab fa-twitter',
  },
];

// Fonction pour importer les données
const importData = async () => {
  try {
    // Supprimer les données existantes
    await User.deleteMany();
    await Category.deleteMany();
    await Product.deleteMany();

    // Importer les utilisateurs
    const createdUsers = await User.insertMany(users);
    const adminUser = createdUsers[0]._id;

    // Importer les catégories
    const createdCategories = await Category.insertMany(categories);

    // Créer des produits pour chaque catégorie
    const products = [];

    // Produits Instagram
    products.push({
      name: 'Abonnés Instagram',
      description: '1000 abonnés Instagram de haute qualité. Livraison rapide et sécurisée.',
      price: 9.99,
      category: createdCategories[0]._id,
    });
    products.push({
      name: 'Likes Instagram',
      description: '500 likes Instagram pour vos publications. Augmentez votre engagement.',
      price: 4.99,
      category: createdCategories[0]._id,
    });
    products.push({
      name: 'Vues Instagram',
      description: '1000 vues pour vos stories et vidéos Instagram. Livraison instantanée.',
      price: 2.99,
      category: createdCategories[0]._id,
    });

    // Produits TikTok
    products.push({
      name: 'Followers TikTok',
      description: '1000 followers TikTok pour augmenter votre audience. Livraison rapide.',
      price: 8.99,
      category: createdCategories[1]._id,
    });
    products.push({
      name: 'Likes TikTok',
      description: '500 likes pour vos vidéos TikTok. Boostez votre engagement.',
      price: 3.99,
      category: createdCategories[1]._id,
    });
    products.push({
      name: 'Vues TikTok',
      description: '5000 vues pour vos vidéos TikTok. Augmentez votre visibilité.',
      price: 5.99,
      category: createdCategories[1]._id,
    });

    // Produits YouTube
    products.push({
      name: 'Abonnés YouTube',
      description: '1000 abonnés YouTube pour votre chaîne. Livraison progressive.',
      price: 19.99,
      category: createdCategories[2]._id,
    });
    products.push({
      name: 'Vues YouTube',
      description: '5000 vues pour vos vidéos YouTube. Augmentez votre classement.',
      price: 14.99,
      category: createdCategories[2]._id,
    });
    products.push({
      name: 'Likes YouTube',
      description: '500 likes pour vos vidéos YouTube. Améliorez votre engagement.',
      price: 7.99,
      category: createdCategories[2]._id,
    });

    // Produits Facebook
    products.push({
      name: 'Likes Page Facebook',
      description: '1000 likes pour votre page Facebook. Augmentez votre crédibilité.',
      price: 12.99,
      category: createdCategories[3]._id,
    });
    products.push({
      name: 'Followers Facebook',
      description: '500 followers pour votre profil Facebook. Élargissez votre réseau.',
      price: 9.99,
      category: createdCategories[3]._id,
    });

    // Produits Twitter
    products.push({
      name: 'Followers Twitter',
      description: '1000 followers Twitter pour votre compte. Livraison rapide.',
      price: 11.99,
      category: createdCategories[4]._id,
    });
    products.push({
      name: 'Retweets',
      description: '100 retweets pour vos tweets. Augmentez votre portée.',
      price: 6.99,
      category: createdCategories[4]._id,
    });

    // Importer les produits
    await Product.insertMany(products);

    console.log('Données importées avec succès !');
    process.exit();
  } catch (error) {
    console.error(`Erreur: ${error.message}`);
    process.exit(1);
  }
};

// Fonction pour supprimer les données
const destroyData = async () => {
  try {
    await User.deleteMany();
    await Category.deleteMany();
    await Product.deleteMany();

    console.log('Données supprimées avec succès !');
    process.exit();
  } catch (error) {
    console.error(`Erreur: ${error.message}`);
    process.exit(1);
  }
};

// Exécuter la fonction appropriée en fonction de l'argument
if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}