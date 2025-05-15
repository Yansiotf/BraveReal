# BraveSMM - Plateforme E-commerce pour Services de Médias Sociaux

BraveSMM est une application web e-commerce complète pour la vente de services de médias sociaux (abonnés, likes, vues, etc.) pour différentes plateformes comme Instagram, TikTok, YouTube, Facebook et Twitter.

![BraveSMM Preview](https://via.placeholder.com/800x400?text=BraveSMM+Preview)

## Fonctionnalités

- **Interface utilisateur intuitive et responsive**
  - Design moderne avec Tailwind CSS
  - Expérience utilisateur fluide sur tous les appareils
  - Animations et transitions pour une meilleure interactivité

- **Gestion des produits et catégories**
  - Affichage des produits par catégorie
  - Filtrage dynamique
  - Interface d'administration pour la gestion des produits

- **Système d'authentification**
  - Inscription et connexion des utilisateurs
  - Gestion des profils utilisateurs
  - Rôles utilisateur et administrateur

- **Panier d'achat**
  - Ajout/suppression de produits
  - Modification des quantités
  - Persistance du panier avec localStorage

- **Processus de commande**
  - Formulaire de commande simplifié
  - Champ pour nom d'utilisateur/lien de profil
  - Simulation de paiement

- **Gestion des commandes**
  - Historique des commandes pour les utilisateurs
  - Interface d'administration pour la gestion des commandes
  - Mise à jour des statuts de commande

## Technologies utilisées

- **Frontend**:
  - HTML5, CSS3, JavaScript (ES6+)
  - Tailwind CSS pour le design responsive
  - FontAwesome pour les icônes

- **Backend**:
  - Node.js avec Express
  - MongoDB avec Mongoose pour la base de données
  - JWT pour l'authentification

## Prérequis

- Node.js (v14.0.0 ou supérieur)
- npm ou yarn
- MongoDB (local ou MongoDB Atlas)

## Installation

1. **Cloner le dépôt**

```bash
git clone https://github.com/votre-utilisateur/bravesmm.git
cd bravesmm
```

2. **Installer les dépendances**

```bash
npm install
```

3. **Configurer les variables d'environnement**

Créez un fichier `.env` à la racine du projet avec les variables suivantes :

```
NODE_ENV=development
PORT=5000
MONGO_URI=votre_uri_mongodb
JWT_SECRET=votre_secret_jwt
JWT_EXPIRE=30d
```

4. **Importer les données initiales (optionnel)**

```bash
npm run data:import
```

5. **Lancer le serveur de développement**

```bash
npm run dev
```

Le serveur sera accessible à l'adresse `http://localhost:5000`.

## Déploiement

### Déploiement sur Heroku

1. **Créer une application Heroku**

```bash
heroku create bravesmm
```

2. **Ajouter une base de données MongoDB**

```bash
heroku addons:create mongodb
```

Ou configurez manuellement une base de données MongoDB Atlas.

3. **Configurer les variables d'environnement**

```bash
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=votre_secret_jwt
heroku config:set JWT_EXPIRE=30d
```

4. **Déployer l'application**

```bash
git push heroku main
```

5. **Importer les données initiales (optionnel)**

```bash
heroku run npm run data:import
```

### Déploiement sur un VPS

1. **Configurer un serveur Node.js**

Installez Node.js, npm et MongoDB sur votre serveur.

2. **Cloner le dépôt**

```bash
git clone https://github.com/votre-utilisateur/bravesmm.git
cd bravesmm
```

3. **Installer les dépendances**

```bash
npm install --production
```

4. **Configurer les variables d'environnement**

Créez un fichier `.env` avec les variables nécessaires.

5. **Configurer un processus de gestion (PM2)**

```bash
npm install -g pm2
pm2 start server.js --name bravesmm
```

6. **Configurer un serveur web (Nginx)**

Configurez Nginx comme proxy inverse pour votre application Node.js.

## Structure du projet

```
bravesmm/
├── backend/
│   ├── config/         # Configuration de la base de données
│   ├── controllers/    # Contrôleurs pour les routes
│   ├── data/           # Données initiales pour le seeder
│   ├── middleware/     # Middleware (auth, etc.)
│   ├── models/         # Modèles de données
│   └── routes/         # Routes API
├── frontend/
│   ├── admin/          # Pages d'administration
│   ├── css/            # Styles CSS
│   ├── js/             # Scripts JavaScript
│   └── *.html          # Pages HTML
├── .env                # Variables d'environnement
├── .gitignore          # Fichiers ignorés par Git
├── package.json        # Dépendances et scripts
├── README.md           # Documentation
└── server.js           # Point d'entrée du serveur
```

## Maintenance et mises à jour

### Mise à jour des dépendances

```bash
npm update
```

### Sauvegarde de la base de données

```bash
mongodump --uri="votre_uri_mongodb" --out=backup
```

## Sécurité

- Toutes les routes sensibles sont protégées par JWT
- Les mots de passe sont hachés avec bcrypt
- Les données sensibles sont validées côté serveur

## Licence

Ce projet est sous licence MIT.

## Contact

Pour toute question ou assistance, veuillez contacter [votre-email@exemple.com](mailto:votre-email@exemple.com).