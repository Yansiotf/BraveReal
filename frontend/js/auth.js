// auth.js - Gestion de l'authentification

// URL de base de l'API
var API_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:5000/api' 
  : '/api';

// Créer un objet auth pour exposer les fonctions
const auth = {};

// Fonction pour vérifier si l'utilisateur est connecté
auth.isLoggedIn = function() {
  return localStorage.getItem('userInfo') !== null;
}

// Fonction pour vérifier si l'utilisateur est admin
function isAdmin() {
  const userInfo = getUserInfo();
  return userInfo && userInfo.isAdmin;
}

// Fonction pour obtenir les informations de l'utilisateur
function getUserInfo() {
  const userInfo = localStorage.getItem('userInfo');
  return userInfo ? JSON.parse(userInfo) : null;
}

// Fonction pour obtenir le token d'authentification
function getToken() {
  const userInfo = getUserInfo();
  return userInfo ? userInfo.token : null;
}

// Fonction pour se connecter
async function login(email, password) {
  try {
    const response = await fetch(`${API_URL}/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erreur lors de la connexion');
    }

    // Sauvegarder les informations de l'utilisateur dans le localStorage
    localStorage.setItem('userInfo', JSON.stringify(data));
    
    return data;
  } catch (error) {
    console.error('Erreur de connexion:', error);
    throw error;
  }
}

// Fonction pour s'inscrire
async function register(name, email, password) {
  try {
    const response = await fetch(`${API_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erreur lors de l\'inscription');
    }

    // Sauvegarder les informations de l'utilisateur dans le localStorage
    localStorage.setItem('userInfo', JSON.stringify(data));
    
    return data;
  } catch (error) {
    console.error('Erreur d\'inscription:', error);
    throw error;
  }
}

// Fonction pour se déconnecter
function logout() {
  localStorage.removeItem('userInfo');
  localStorage.removeItem('cartItems');
  window.location.href = '/';
}

// Fonction pour configurer le menu utilisateur
function setupUserMenu() {
  const userMenuButton = document.getElementById('user-menu-button');
  const userDropdown = document.getElementById('user-dropdown');
  const loggedOutMenu = document.getElementById('logged-out-menu');
  const loggedInMenu = document.getElementById('logged-in-menu');
  const adminMenu = document.getElementById('admin-menu');
  const logoutButton = document.getElementById('logout-button');

  // Afficher le menu approprié en fonction de l'état de connexion
  if (isLoggedIn()) {
    loggedOutMenu.classList.add('hidden');
    loggedInMenu.classList.remove('hidden');
    
    // Afficher le menu admin si l'utilisateur est admin
    if (isAdmin()) {
      adminMenu.classList.remove('hidden');
    } else {
      adminMenu.classList.add('hidden');
    }
  } else {
    loggedOutMenu.classList.remove('hidden');
    loggedInMenu.classList.add('hidden');
    adminMenu.classList.add('hidden');
  }

  // Gérer le clic sur le bouton du menu utilisateur
  userMenuButton.addEventListener('click', () => {
    userDropdown.classList.toggle('hidden');
  });

  // Gérer le clic en dehors du menu pour le fermer
  document.addEventListener('click', (event) => {
    if (!userMenuButton.contains(event.target) && !userDropdown.contains(event.target)) {
      userDropdown.classList.add('hidden');
    }
  });

  // Gérer le clic sur le bouton de déconnexion
  if (logoutButton) {
    logoutButton.addEventListener('click', (e) => {
      e.preventDefault();
      logout();
    });
  }
}

// Fonction pour configurer le menu mobile
function setupMobileMenu() {
  const mobileMenuButton = document.getElementById('mobile-menu-button');
  const mobileMenu = document.getElementById('mobile-menu');

  mobileMenuButton.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
  });
}

// Ajouter les autres fonctions à l'objet auth
auth.isAdmin = isAdmin;
auth.getUserInfo = getUserInfo;
auth.getToken = getToken;
auth.login = login;
auth.register = register;
auth.logout = logout;
auth.setupUserMenu = setupUserMenu;
auth.setupMobileMenu = setupMobileMenu;

// Exporter l'objet auth
window.auth = auth;