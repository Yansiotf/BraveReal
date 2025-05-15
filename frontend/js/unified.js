// unified.js - Fichier unifié pour l'application

// Définir l'URL de base de l'API
var API_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:5000/api' 
  : '/api';

// Créer les objets globaux
const app = {};
const auth = {};

// ===== FONCTIONS D'AUTHENTIFICATION =====

// Fonction pour vérifier si l'utilisateur est connecté
auth.isLoggedIn = function() {
  return localStorage.getItem('userInfo') !== null;
};

// Fonction pour vérifier si l'utilisateur est admin
auth.isAdmin = function() {
  const userInfo = auth.getUserInfo();
  return userInfo && userInfo.isAdmin;
};

// Fonction pour récupérer les informations de l'utilisateur
auth.getUserInfo = function() {
  try {
    return JSON.parse(localStorage.getItem('userInfo'));
  } catch (error) {
    console.error('Erreur lors de la récupération des informations utilisateur:', error);
    return null;
  }
};

// Fonction pour récupérer le token d'authentification
auth.getToken = function() {
  const userInfo = auth.getUserInfo();
  return userInfo ? userInfo.token : null;
};

// Fonction pour se connecter
auth.login = async function(email, password) {
  try {
    const response = await fetch(`${API_URL}/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Erreur lors de la connexion');
    }
    
    localStorage.setItem('userInfo', JSON.stringify(data));
    
    return data;
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    throw error;
  }
};

// Fonction pour s'inscrire
auth.register = async function(name, email, password) {
  try {
    const response = await fetch(`${API_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, email, password })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Erreur lors de l\'inscription');
    }
    
    localStorage.setItem('userInfo', JSON.stringify(data));
    
    return data;
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    throw error;
  }
};

// Fonction pour se déconnecter
auth.logout = function() {
  localStorage.removeItem('userInfo');
  window.location.href = 'index.html';
};

// Fonction pour configurer le menu utilisateur
auth.setupUserMenu = function() {
  const userMenuButton = document.getElementById('user-menu-button');
  const userDropdown = document.getElementById('user-dropdown');
  const loggedOutMenu = document.getElementById('logged-out-menu');
  const loggedInMenu = document.getElementById('logged-in-menu');
  const adminMenu = document.getElementById('admin-menu');
  const logoutButton = document.getElementById('logout-button');

  // Afficher le menu approprié en fonction de l'état de connexion
  if (auth.isLoggedIn()) {
    loggedOutMenu.classList.add('hidden');
    loggedInMenu.classList.remove('hidden');
    
    // Afficher le menu admin si l'utilisateur est admin
    if (auth.isAdmin()) {
      adminMenu.classList.remove('hidden');
    } else {
      adminMenu.classList.add('hidden');
    }
  } else {
    loggedOutMenu.classList.remove('hidden');
    loggedInMenu.classList.add('hidden');
    adminMenu.classList.add('hidden');
  }
  
  // Ajouter un événement au bouton de déconnexion
  if (logoutButton) {
    logoutButton.addEventListener('click', (e) => {
      e.preventDefault();
      auth.logout();
    });
  }
  
  // Ajouter un événement au bouton du menu utilisateur
  if (userMenuButton && userDropdown) {
    userMenuButton.addEventListener('click', () => {
      userDropdown.classList.toggle('hidden');
    });
    
    // Fermer le menu lorsqu'on clique ailleurs
    document.addEventListener('click', (e) => {
      if (!userMenuButton.contains(e.target) && !userDropdown.contains(e.target)) {
        userDropdown.classList.add('hidden');
      }
    });
  }
};

// Fonction pour configurer le menu mobile
auth.setupMobileMenu = function() {
  const mobileMenuButton = document.getElementById('mobile-menu-button');
  const mobileMenu = document.getElementById('mobile-menu');
  
  if (!mobileMenuButton || !mobileMenu) return;
  
  mobileMenuButton.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
  });
};

// ===== FONCTIONS PRINCIPALES =====

// Fonction pour afficher un message d'alerte
app.showAlert = function(message, type = 'info') {
  const alertContainer = document.getElementById('alert-container') || createAlertContainer();
  
  const alert = document.createElement('div');
  alert.className = `alert alert-${type} flex items-center`;
  
  let icon = '';
  switch (type) {
    case 'success':
      icon = '<i class="fas fa-check-circle text-green-500 mr-2"></i>';
      break;
    case 'error':
      icon = '<i class="fas fa-exclamation-circle text-red-500 mr-2"></i>';
      break;
    default:
      icon = '<i class="fas fa-info-circle text-blue-500 mr-2"></i>';
  }
  
  alert.innerHTML = `
    ${icon}
    <span>${message}</span>
    <button class="ml-auto text-gray-500 hover:text-gray-700" onclick="this.parentElement.remove()">
      <i class="fas fa-times"></i>
    </button>
  `;
  
  alertContainer.appendChild(alert);
  
  // Supprimer l'alerte après 5 secondes
  setTimeout(() => {
    if (alert.parentElement) {
      alert.remove();
    }
  }, 5000);
};

// Fonction pour créer un conteneur d'alertes s'il n'existe pas
function createAlertContainer() {
  const container = document.createElement('div');
  container.id = 'alert-container';
  container.className = 'fixed top-4 right-4 z-50 w-80 space-y-2';
  document.body.appendChild(container);
  return container;
}

// Fonction pour charger les produits en vedette sur la page d'accueil
app.loadFeaturedProducts = async function() {
  const featuredProductsContainer = document.getElementById('featured-products');
  if (!featuredProductsContainer) return;
  
  try {
    // Afficher un loader pendant le chargement
    featuredProductsContainer.innerHTML = '<div class="col-span-full flex justify-center"><div class="loader"></div></div>';
    
    const response = await fetch(`${API_URL}/products`);
    
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des produits');
    }
    
    const products = await response.json();
    
    // Afficher les 4 premiers produits
    const featuredProducts = products.slice(0, 4);
    
    if (featuredProducts.length === 0) {
      featuredProductsContainer.innerHTML = '<p class="text-center col-span-full">Aucun produit disponible.</p>';
      return;
    }
    
    featuredProductsContainer.innerHTML = '';
    
    featuredProducts.forEach(product => {
      const productCard = document.createElement('div');
      productCard.className = 'bg-white rounded-lg shadow-md overflow-hidden product-card';
      productCard.innerHTML = `
        <div class="p-4">
          <h3 class="text-lg font-bold mb-2">${product.name}</h3>
          <p class="text-gray-600 text-sm mb-4">${product.description.substring(0, 100)}${product.description.length > 100 ? '...' : ''}</p>
          <div class="flex justify-between items-center">
            <span class="text-blue-600 font-bold">${product.price.toFixed(2)} €</span>
            <button class="btn-primary add-to-cart" data-id="${product._id}">
              <i class="fas fa-cart-plus mr-1"></i> Ajouter
            </button>
          </div>
        </div>
      `;
      
      featuredProductsContainer.appendChild(productCard);
      
      // Ajouter un événement au bouton "Ajouter au panier"
      const addToCartButton = productCard.querySelector('.add-to-cart');
      addToCartButton.addEventListener('click', () => {
        app.addToCart(product);
      });
    });
  } catch (error) {
    console.error('Erreur lors du chargement des produits en vedette:', error);
    featuredProductsContainer.innerHTML = '<p class="text-center col-span-full text-red-500">Erreur lors du chargement des produits.</p>';
  }
};

// Fonction pour charger les catégories
app.loadCategories = async function() {
  const categoriesContainer = document.getElementById('categories-container');
  if (!categoriesContainer) return;
  
  try {
    const response = await fetch(`${API_URL}/categories`);
    const categories = await response.json();
    
    categoriesContainer.innerHTML = '';
    
    if (categories.length === 0) {
      categoriesContainer.innerHTML = '<p class="text-center">Aucune catégorie disponible.</p>';
      return;
    }
    
    // Ajouter une option "Toutes les catégories"
    const allCategoriesItem = document.createElement('button');
    allCategoriesItem.className = 'category-filter px-4 py-2 rounded-full bg-blue-600 text-white mr-2 mb-2';
    allCategoriesItem.textContent = 'Toutes';
    allCategoriesItem.dataset.id = '';
    categoriesContainer.appendChild(allCategoriesItem);
    
    categories.forEach(category => {
      const categoryItem = document.createElement('button');
      categoryItem.className = 'category-filter px-4 py-2 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 mr-2 mb-2';
      categoryItem.textContent = category.name;
      categoryItem.dataset.id = category._id;
      categoriesContainer.appendChild(categoryItem);
    });
    
    // Ajouter des événements aux boutons de filtre
    const filterButtons = document.querySelectorAll('.category-filter');
    filterButtons.forEach(button => {
      button.addEventListener('click', () => {
        // Mettre à jour l'apparence des boutons
        filterButtons.forEach(btn => {
          btn.classList.remove('bg-blue-600', 'text-white');
          btn.classList.add('bg-gray-200', 'text-gray-700');
        });
        button.classList.remove('bg-gray-200', 'text-gray-700');
        button.classList.add('bg-blue-600', 'text-white');
        
        // Filtrer les produits
        const categoryId = button.dataset.id;
        app.loadProducts(categoryId);
      });
    });
  } catch (error) {
    console.error('Erreur lors du chargement des catégories:', error);
    categoriesContainer.innerHTML = '<p class="text-center text-red-500">Erreur lors du chargement des catégories.</p>';
  }
};

// Fonction pour charger les produits dans la page boutique
app.loadProducts = async function(categoryId = '') {
  const productsContainer = document.getElementById('products-container');
  if (!productsContainer) return;
  
  // Afficher un loader
  productsContainer.innerHTML = '<div class="loader col-span-full mx-auto"></div>';
  
  try {
    const url = categoryId 
      ? `${API_URL}/products?category=${categoryId}` 
      : `${API_URL}/products`;
      
    const response = await fetch(url);
    const products = await response.json();
    
    productsContainer.innerHTML = '';
    
    if (products.length === 0) {
      productsContainer.innerHTML = '<p class="text-center col-span-full">Aucun produit disponible dans cette catégorie.</p>';
      return;
    }
    
    products.forEach(product => {
      const productCard = document.createElement('div');
      productCard.className = 'bg-white rounded-lg shadow-md overflow-hidden product-card';
      productCard.innerHTML = `
        <div class="p-4">
          <h3 class="text-lg font-bold mb-2">${product.name}</h3>
          <p class="text-gray-600 text-sm mb-4">${product.description.substring(0, 100)}${product.description.length > 100 ? '...' : ''}</p>
          <div class="flex justify-between items-center">
            <span class="text-blue-600 font-bold">${product.price.toFixed(2)} €</span>
            <button class="btn-primary add-to-cart" data-id="${product._id}">
              <i class="fas fa-cart-plus mr-1"></i> Ajouter
            </button>
          </div>
        </div>
      `;
      
      productsContainer.appendChild(productCard);
      
      // Ajouter un événement au bouton "Ajouter au panier"
      const addToCartButton = productCard.querySelector('.add-to-cart');
      addToCartButton.addEventListener('click', () => {
        app.addToCart(product);
      });
    });
  } catch (error) {
    console.error('Erreur lors du chargement des produits:', error);
    productsContainer.innerHTML = '<p class="text-center col-span-full text-red-500">Erreur lors du chargement des produits.</p>';
  }
};

// Fonction pour ajouter un produit au panier
app.addToCart = function(product) {
  const cart = JSON.parse(localStorage.getItem('cartItems')) || [];
  
  // Vérifier si le produit est déjà dans le panier
  const existingItem = cart.find(item => item._id === product._id);
  
  if (existingItem) {
    // Incrémenter la quantité
    existingItem.qty += 1;
  } else {
    // Ajouter le produit au panier
    cart.push({
      ...product,
      qty: 1
    });
  }
  
  // Sauvegarder le panier dans le localStorage
  localStorage.setItem('cartItems', JSON.stringify(cart));
  
  // Mettre à jour le compteur du panier
  app.updateCartCount();
  
  // Animer l'icône du panier
  animateCartIcon();
  
  // Afficher un message de confirmation
  app.showAlert(`${product.name} a été ajouté au panier`, 'success');
};

// Fonction pour animer l'icône du panier
function animateCartIcon() {
  const cartIcon = document.querySelector('a[href="cart.html"] i');
  if (!cartIcon) return;
  
  cartIcon.classList.add('animate-bounce');
  
  setTimeout(() => {
    cartIcon.classList.remove('animate-bounce');
  }, 1000);
}

// Fonction pour mettre à jour le compteur du panier
app.updateCartCount = function() {
  const cartCountElement = document.getElementById('cart-count');
  if (!cartCountElement) return;
  
  const cart = JSON.parse(localStorage.getItem('cartItems')) || [];
  const itemCount = cart.reduce((total, item) => total + item.qty, 0);
  
  cartCountElement.textContent = itemCount;
  
  // Ajouter une animation si le compteur change
  cartCountElement.classList.add('animate-pulse');
  setTimeout(() => {
    cartCountElement.classList.remove('animate-pulse');
  }, 500);
};

// Fonction pour charger le panier
app.loadCart = function() {
  const cartItemsContainer = document.getElementById('cart-items');
  const cartTotalElement = document.getElementById('cart-total');
  const emptyCartMessage = document.getElementById('empty-cart-message');
  const checkoutButton = document.getElementById('checkout-button');
  
  if (!cartItemsContainer || !cartTotalElement) return;
  
  const cart = JSON.parse(localStorage.getItem('cartItems')) || [];
  
  if (cart.length === 0) {
    cartItemsContainer.innerHTML = '';
    cartTotalElement.textContent = '0.00 €';
    
    if (emptyCartMessage) {
      emptyCartMessage.classList.remove('hidden');
    }
    
    if (checkoutButton) {
      checkoutButton.disabled = true;
      checkoutButton.classList.add('opacity-50', 'cursor-not-allowed');
    }
    
    return;
  }
  
  if (emptyCartMessage) {
    emptyCartMessage.classList.add('hidden');
  }
  
  if (checkoutButton) {
    checkoutButton.disabled = false;
    checkoutButton.classList.remove('opacity-50', 'cursor-not-allowed');
  }
  
  cartItemsContainer.innerHTML = '';
  
  let total = 0;
  
  cart.forEach(item => {
    const itemTotal = item.price * item.qty;
    total += itemTotal;
    
    const cartItem = document.createElement('div');
    cartItem.className = 'flex items-center py-4 border-b border-gray-200';
    cartItem.innerHTML = `
      <div class="flex-grow">
        <h3 class="text-lg font-semibold">${item.name}</h3>
        <p class="text-gray-600">${item.price.toFixed(2)} € x ${item.qty}</p>
      </div>
      <div class="flex items-center">
        <div class="flex items-center mr-4">
          <button class="px-2 py-1 bg-gray-200 rounded-l" onclick="app.updateCartItemQuantity('${item._id}', ${item.qty - 1})">-</button>
          <span class="px-3 py-1 bg-gray-100">${item.qty}</span>
          <button class="px-2 py-1 bg-gray-200 rounded-r" onclick="app.updateCartItemQuantity('${item._id}', ${item.qty + 1})">+</button>
        </div>
        <p class="font-semibold mr-4">${itemTotal.toFixed(2)} €</p>
        <button class="text-red-500 hover:text-red-700" onclick="app.removeCartItem('${item._id}')">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `;
    
    cartItemsContainer.appendChild(cartItem);
  });
  
  cartTotalElement.textContent = `${total.toFixed(2)} €`;
};

// Fonction pour mettre à jour la quantité d'un article dans le panier
app.updateCartItemQuantity = function(id, qty) {
  if (qty < 1) {
    app.removeCartItem(id);
    return;
  }
  
  const cart = JSON.parse(localStorage.getItem('cartItems')) || [];
  const item = cart.find(item => item._id === id);
  
  if (item) {
    item.qty = qty;
    localStorage.setItem('cartItems', JSON.stringify(cart));
    app.loadCart();
    app.updateCartCount();
  }
};

// Fonction pour supprimer un article du panier
app.removeCartItem = function(id) {
  const cart = JSON.parse(localStorage.getItem('cartItems')) || [];
  const updatedCart = cart.filter(item => item._id !== id);
  
  localStorage.setItem('cartItems', JSON.stringify(updatedCart));
  
  // Recharger le panier
  app.loadCart();
  
  // Mettre à jour le compteur du panier
  app.updateCartCount();
  
  // Afficher un message de confirmation
  app.showAlert('Article supprimé du panier', 'info');
};

// Initialiser l'application
document.addEventListener('DOMContentLoaded', () => {
  console.log('Application initialisée');
  
  // Configurer le menu utilisateur
  auth.setupUserMenu();
  
  // Configurer le menu mobile
  auth.setupMobileMenu();
  
  // Mettre à jour le compteur du panier
  app.updateCartCount();
  
  // Charger les produits en vedette sur la page d'accueil
  if (document.getElementById('featured-products')) {
    app.loadFeaturedProducts();
  }
  
  // Charger les catégories sur la page boutique
  if (document.getElementById('categories-container')) {
    app.loadCategories();
  }
  
  // Charger les produits sur la page boutique
  if (document.getElementById('products-container')) {
    app.loadProducts();
  }
  
  // Charger le panier sur la page panier
  if (document.getElementById('cart-items')) {
    app.loadCart();
  }
  
  // Configurer le formulaire de contact
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Simuler l'envoi du formulaire
      const submitButton = this.querySelector('button[type="submit"]');
      const originalText = submitButton.innerHTML;
      
      submitButton.disabled = true;
      submitButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Envoi en cours...';
      
      setTimeout(() => {
        app.showAlert('Votre message a été envoyé avec succès! Nous vous répondrons dans les plus brefs délais.', 'success');
        
        // Réinitialiser le formulaire
        contactForm.reset();
        
        // Restaurer le bouton
        submitButton.disabled = false;
        submitButton.innerHTML = originalText;
      }, 1500);
    });
  }
});