// Script pour initialiser la base de données
const { execSync } = require('child_process');
const path = require('path');

console.log('Initialisation de la base de données...');

try {
  // Supprimer les données existantes
  console.log('Suppression des données existantes...');
  execSync('node backend/data/seeder -d', { stdio: 'inherit' });
  
  // Importer les nouvelles données
  console.log('Importation des nouvelles données...');
  execSync('node backend/data/seeder', { stdio: 'inherit' });
  
  console.log('Base de données initialisée avec succès!');
} catch (error) {
  console.error('Erreur lors de l\'initialisation de la base de données:', error);
  process.exit(1);
}