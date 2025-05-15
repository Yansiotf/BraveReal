const fs = require('fs-extra');
const path = require('path');

// Chemin du dossier build
const buildDir = path.join(__dirname, 'build');

// Créer le dossier build s'il n'existe pas
if (!fs.existsSync(buildDir)) {
  fs.mkdirSync(buildDir);
}

// Copier les fichiers HTML
const htmlFiles = fs.readdirSync(__dirname).filter(file => file.endsWith('.html'));
htmlFiles.forEach(file => {
  fs.copyFileSync(path.join(__dirname, file), path.join(buildDir, file));
  console.log(`Copié: ${file}`);
});

// Copier les dossiers css et js
['css', 'js'].forEach(dir => {
  fs.copySync(path.join(__dirname, dir), path.join(buildDir, dir));
  console.log(`Copié: dossier ${dir}`);
});

// Copier le dossier admin s'il existe
const adminDir = path.join(__dirname, 'admin');
if (fs.existsSync(adminDir)) {
  fs.copySync(adminDir, path.join(buildDir, 'admin'));
  console.log('Copié: dossier admin');
}

console.log('Build terminé avec succès!');