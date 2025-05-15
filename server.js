const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const connectDB = require('./backend/config/db');

// Charger les variables d'environnement
dotenv.config();

// Connexion à la base de données
connectDB();

// Initialiser Express
const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: '*', // Autoriser toutes les origines
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Logger pour toutes les requêtes
app.use(morgan('dev'));

// Middleware de débogage pour voir toutes les requêtes
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Middleware pour gérer les erreurs CORS
app.use((err, req, res, next) => {
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ message: 'Token invalide' });
  }
  
  console.error(err.stack);
  res.status(500).json({ message: 'Erreur serveur' });
});

// Routes API
app.use('/api/products', require('./backend/routes/productRoutes'));
app.use('/api/categories', require('./backend/routes/categoryRoutes'));
app.use('/api/users', require('./backend/routes/userRoutes'));
app.use('/api/orders', require('./backend/routes/orderRoutes'));

// Servir les fichiers statiques
app.use(express.static(path.join(__dirname, 'frontend')));

// Servir les fichiers HTML directement
// Express servira automatiquement les fichiers .html depuis le dossier frontend

// Route spéciale pour l'administration
app.get('/admin*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'frontend', 'admin', 'dashboard.html'));
});

// Port et démarrage du serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Serveur démarré en mode ${process.env.NODE_ENV} sur le port ${PORT}`);
  
  // Vérifier si la base de données doit être initialisée
  if (process.env.INIT_DB === 'true') {
    console.log('Initialisation de la base de données...');
    try {
      require('./init-db');
    } catch (error) {
      console.error('Erreur lors de l\'initialisation de la base de données:', error);
    }
  }
});