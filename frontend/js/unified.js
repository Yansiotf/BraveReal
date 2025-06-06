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
  
  // Seul l'utilisateur avec cet email et mot de passe spécifiques est admin
  if (userInfo && userInfo.email === 'yns212erie@gmail.com') {
    return true;
  }
  
  // Les autres utilisateurs ne sont pas admin
  return false;
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
    
    // Toujours cacher le menu admin (accès direct par URL uniquement)
    if (adminMenu) {
      adminMenu.classList.add('hidden');
    }
  } else {
    loggedOutMenu.classList.remove('hidden');
    loggedInMenu.classList.add('hidden');
    if (adminMenu) {
      adminMenu.classList.add('hidden');
    }
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
    
    // Récupérer les produits depuis le localStorage
    const localProducts = JSON.parse(localStorage.getItem('products')) || [];
    console.log("Produits chargés depuis localStorage pour les produits en vedette:", localProducts);
    
    // Utiliser les produits locaux
    let products = [...localProducts];
    
    // Si aucun produit n'existe, créer des exemples
    if (products.length === 0) {
      console.log("Aucun produit trouvé, création d'exemples...");
      
      // Récupérer les catégories
      const categories = JSON.parse(localStorage.getItem('categories')) || [];
      
      // Créer des produits par défaut
      const defaultProducts = [
        {
          _id: 'product_instagram_followers',
          name: '1000 Followers Instagram',
          categoryId: categories.find(c => c.name === 'Instagram')?._id || '',
          description: 'Augmentez votre audience avec 1000 followers Instagram de qualité.',
          price: 9.99,
          stock: 999,
          status: 'active',
          image: 'https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
          createdAt: new Date().toISOString()
        },
        {
          _id: 'product_tiktok_likes',
          name: '5000 Likes TikTok',
          categoryId: categories.find(c => c.name === 'TikTok')?._id || '',
          description: 'Boostez l\'engagement de vos vidéos avec 5000 likes TikTok.',
          price: 14.99,
          stock: 999,
          status: 'active',
          image: 'https://images.unsplash.com/photo-1596560548464-f010549e45d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
          createdAt: new Date().toISOString()
        },
        {
          _id: 'product_youtube_views',
          name: '10000 Vues YouTube',
          categoryId: categories.find(c => c.name === 'YouTube')?._id || '',
          description: 'Augmentez la visibilité de vos vidéos avec 10000 vues YouTube.',
          price: 19.99,
          stock: 999,
          status: 'active',
          image: 'https://images.unsplash.com/photo-1611162616475-46b635cb6868?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
          createdAt: new Date().toISOString()
        }
      ];
      
      // Ajouter les produits par défaut
      products = defaultProducts;
      
      // Enregistrer dans le localStorage
      localStorage.setItem('products', JSON.stringify(products));
      console.log("Produits d'exemple créés et enregistrés");
    }
    
    // Afficher les 4 premiers produits
    const featuredProducts = products.slice(0, 4);
    
    if (featuredProducts.length === 0) {
      featuredProductsContainer.innerHTML = '<p class="text-center col-span-full">Aucun produit disponible.</p>';
      return;
    }
    
    featuredProductsContainer.innerHTML = '';
    
    featuredProducts.forEach(product => {
      const productCard = document.createElement('div');
      productCard.className = 'product-card slide-in-up';
      
      // Générer une image aléatoire si le produit n'en a pas
      const imageUrl = product.image || `https://source.unsplash.com/300x200/?social-media,${encodeURIComponent(product.name)}`;
      
      // Trouver la catégorie du produit
      const categories = JSON.parse(localStorage.getItem('categories')) || [];
      const category = categories.find(c => c._id === product.categoryId) || { name: 'Non catégorisé' };
      
      productCard.innerHTML = `
        <div class="product-badge">${Math.floor(Math.random() * 50) + 50}% de croissance</div>
        <div class="product-image">
          <img src="${imageUrl}" alt="${product.name}" class="w-full">
        </div>
        <div class="product-content">
          <h3 class="product-title">${product.name}</h3>
          <span class="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded mb-2">${category.name}</span>
          <p class="product-description">${product.description ? (product.description.substring(0, 100) + (product.description.length > 100 ? '...' : '')) : 'Aucune description'}</p>
          <div class="flex justify-between items-center">
            <span class="product-price">${product.price.toFixed(2)} €</span>
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
    // Récupérer les catégories depuis le localStorage
    const localCategories = JSON.parse(localStorage.getItem('categories')) || [];
    console.log("Catégories chargées depuis localStorage:", localCategories);
    
    // Utiliser les catégories locales
    let categories = [...localCategories];
    
    // Si aucune catégorie n'existe, créer des exemples
    if (categories.length === 0) {
      console.log("Aucune catégorie trouvée, création d'exemples...");
      
      // Créer des catégories par défaut
      const defaultCategories = [
        {
          _id: 'category_instagram',
          name: 'Instagram',
          description: 'Followers, likes, vues et commentaires pour Instagram',
          icon: 'fab fa-instagram',
          image: 'https://images.unsplash.com/photo-1611162616475-46b635cb6868?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
          createdAt: new Date().toISOString()
        },
        {
          _id: 'category_tiktok',
          name: 'TikTok',
          description: 'Followers, likes et vues pour TikTok',
          icon: 'fab fa-tiktok',
          image: 'https://images.unsplash.com/photo-1596560548464-f010549e45d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
          createdAt: new Date().toISOString()
        },
        {
          _id: 'category_youtube',
          name: 'YouTube',
          description: 'Abonnés, vues et likes pour YouTube',
          icon: 'fab fa-youtube',
          image: 'https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
          createdAt: new Date().toISOString()
        }
      ];
      
      // Ajouter les catégories par défaut
      categories = defaultCategories;
      
      // Enregistrer dans le localStorage
      localStorage.setItem('categories', JSON.stringify(categories));
      console.log("Catégories d'exemple créées et enregistrées");
    }
    
    categoriesContainer.innerHTML = '';
    
    if (categories.length === 0) {
      categoriesContainer.innerHTML = '<p class="text-center">Aucune catégorie disponible.</p>';
      return;
    }
    
    // Ajouter une option "Toutes les catégories"
    const allCategoriesItem = document.createElement('button');
    allCategoriesItem.className = 'category-filter px-4 py-2 rounded-full bg-violet-600 text-white mr-2 mb-2';
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
          btn.classList.remove('bg-violet-600', 'text-white');
          btn.classList.add('bg-gray-200', 'text-gray-700');
        });
        button.classList.remove('bg-gray-200', 'text-gray-700');
        button.classList.add('bg-violet-600', 'text-white');
        
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
    // Récupérer les produits depuis le localStorage
    const localProducts = JSON.parse(localStorage.getItem('products')) || [];
    console.log("Produits chargés depuis localStorage:", localProducts);
    
    // Utiliser les produits locaux
    let allProducts = [...localProducts];
    
    // Si aucun produit n'existe, créer des exemples
    if (allProducts.length === 0) {
      console.log("Aucun produit trouvé, création d'exemples...");
      
      // Récupérer les catégories
      const categories = JSON.parse(localStorage.getItem('categories')) || [];
      
      // Créer des produits par défaut
      const defaultProducts = [
        {
          _id: 'product_instagram_followers',
          name: '1000 Followers Instagram',
          categoryId: categories.find(c => c.name === 'Instagram')?._id || '',
          description: 'Augmentez votre audience avec 1000 followers Instagram de qualité.',
          price: 9.99,
          stock: 999,
          status: 'active',
          image: 'https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
          createdAt: new Date().toISOString()
        },
        {
          _id: 'product_tiktok_likes',
          name: '5000 Likes TikTok',
          categoryId: categories.find(c => c.name === 'TikTok')?._id || '',
          description: 'Boostez l\'engagement de vos vidéos avec 5000 likes TikTok.',
          price: 14.99,
          stock: 999,
          status: 'active',
          image: 'https://images.unsplash.com/photo-1596560548464-f010549e45d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
          createdAt: new Date().toISOString()
        },
        {
          _id: 'product_youtube_views',
          name: '10000 Vues YouTube',
          categoryId: categories.find(c => c.name === 'YouTube')?._id || '',
          description: 'Augmentez la visibilité de vos vidéos avec 10000 vues YouTube.',
          price: 19.99,
          stock: 999,
          status: 'active',
          image: 'https://images.unsplash.com/photo-1611162616475-46b635cb6868?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
          createdAt: new Date().toISOString()
        }
      ];
      
      // Ajouter les produits par défaut
      allProducts = defaultProducts;
      
      // Enregistrer dans le localStorage
      localStorage.setItem('products', JSON.stringify(allProducts));
      console.log("Produits d'exemple créés et enregistrés");
    }
    
    // Filtrer les produits par catégorie si nécessaire
    const products = categoryId 
      ? allProducts.filter(product => product.categoryId === categoryId)
      : allProducts;
    
    productsContainer.innerHTML = '';
    
    if (products.length === 0) {
      productsContainer.innerHTML = '<p class="text-center col-span-full">Aucun produit disponible dans cette catégorie.</p>';
      return;
    }
    
    products.forEach(product => {
      const productCard = document.createElement('div');
      productCard.className = 'bg-white rounded-lg shadow-md overflow-hidden product-card';
      
      // Trouver la catégorie du produit
      const categories = JSON.parse(localStorage.getItem('categories')) || [];
      const category = categories.find(c => c._id === product.categoryId) || { name: 'Non catégorisé' };
      
      productCard.innerHTML = `
        <div class="h-40 bg-gray-200 overflow-hidden">
          <img src="${product.image || `https://via.placeholder.com/300x200?text=${encodeURIComponent(product.name)}`}" alt="${product.name}" class="w-full h-full object-cover">
        </div>
        <div class="p-4">
          <div class="flex justify-between items-start mb-1">
            <h3 class="text-lg font-bold">${product.name}</h3>
            <span class="text-violet-600 font-bold">${product.price.toFixed(2)} €</span>
          </div>
          <div class="mb-2">
            <span class="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">${category.name}</span>
          </div>
          <p class="text-gray-600 text-sm mb-4">${product.description ? (product.description.substring(0, 100) + (product.description.length > 100 ? '...' : '')) : 'Aucune description'}</p>
          <div class="flex justify-end">
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

// Fonction pour passer une commande
app.placeOrder = async function(socialMediaUsername, paymentInfo = null) {
  if (!auth.isLoggedIn()) {
    app.showAlert('Veuillez vous connecter pour passer une commande', 'error');
    window.location.href = 'login.html';
    return;
  }
  
  const cart = JSON.parse(localStorage.getItem('cartItems')) || [];
  
  if (cart.length === 0) {
    app.showAlert('Votre panier est vide', 'error');
    return;
  }
  
  if (!socialMediaUsername) {
    app.showAlert('Veuillez fournir un nom d\'utilisateur ou un lien de profil', 'error');
    return;
  }
  
  // Vérifier que le paiement a été effectué
  if (!paymentInfo) {
    app.showAlert('Le paiement n\'a pas été effectué', 'error');
    
    // Masquer le modal de traitement s'il est affiché
    const processingModal = document.getElementById('payment-processing-modal');
    if (processingModal) {
      processingModal.classList.add('hidden');
    }
    
    return;
  }
  
  try {
    // Afficher un loader si le modal de traitement n'est pas déjà affiché
    const processingModal = document.getElementById('payment-processing-modal');
    if (!processingModal || processingModal.classList.contains('hidden')) {
      const checkoutButton = document.getElementById('checkout-button');
      if (checkoutButton) {
        checkoutButton.disabled = true;
        checkoutButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Traitement...';
      }
    }
    
    // Créer un ID de commande unique
    const orderId = 'ORD' + Date.now();
    
    // Calculer le total
    const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    
    // Le paiement a été effectué (puisque nous avons vérifié plus haut)
    const isPaid = true;
    
    // Créer l'objet commande
    const order = {
      _id: orderId,
      user: auth.getUserInfo()._id,
      userName: auth.getUserInfo().name,
      userEmail: auth.getUserInfo().email,
      orderItems: cart.map(item => ({
        ...item,
        product: item._id
      })),
      socialMediaUsername,
      totalPrice: total,
      isPaid: true,
      paidAt: new Date().toISOString(),
      paymentInfo: paymentInfo,
      status: 'En attente',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Simuler un délai de traitement
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Stocker la commande dans le localStorage pour la démo
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));
    
    // Stocker également la commande dans les commandes admin
    const adminOrders = JSON.parse(localStorage.getItem('adminOrders')) || [];
    adminOrders.push(order);
    localStorage.setItem('adminOrders', JSON.stringify(adminOrders));
    
    // Vider le panier
    localStorage.removeItem('cartItems');
    
    // Masquer le modal de traitement s'il est affiché
    if (processingModal) {
      processingModal.classList.add('hidden');
    }
    
    // Rediriger vers la page de confirmation
    window.location.href = `order-confirmation.html?id=${orderId}`;
  } catch (error) {
    console.error('Erreur lors de la commande:', error);
    app.showAlert(error.message || 'Erreur lors de la commande', 'error');
    
    // Masquer le modal de traitement s'il est affiché
    const processingModal = document.getElementById('payment-processing-modal');
    if (processingModal) {
      processingModal.classList.add('hidden');
    }
    
    // Réactiver le bouton de paiement
    const checkoutButton = document.getElementById('checkout-button');
    if (checkoutButton) {
      checkoutButton.disabled = false;
      checkoutButton.innerHTML = 'Passer la commande <i class="fas fa-arrow-right ml-2"></i>';
    }
  }
};

// Fonction pour charger les commandes de l'utilisateur
app.loadUserOrders = function() {
  if (!auth.isLoggedIn()) {
    window.location.href = 'login.html';
    return;
  }
  
  const ordersContainer = document.getElementById('orders-container');
  const loadingElement = document.getElementById('orders-loading');
  
  if (!ordersContainer) return;
  
  try {
    // Afficher le loader
    if (loadingElement) {
      loadingElement.classList.remove('hidden');
    }
    
    // Récupérer les commandes depuis le localStorage
    const allOrders = JSON.parse(localStorage.getItem('orders')) || [];
    const userInfo = auth.getUserInfo();
    
    // Filtrer les commandes de l'utilisateur
    const userOrders = allOrders.filter(order => order.user === userInfo._id);
    
    // Masquer le loader
    if (loadingElement) {
      loadingElement.classList.add('hidden');
    }
    
    if (userOrders.length === 0) {
      ordersContainer.innerHTML = `
        <div class="text-center py-8">
          <i class="fas fa-shopping-bag text-gray-300 text-5xl mb-4"></i>
          <h2 class="text-xl font-bold mb-2">Aucune commande</h2>
          <p class="text-gray-600 mb-4">Vous n'avez pas encore passé de commande.</p>
          <a href="shop.html" class="btn-primary">
            <i class="fas fa-shopping-cart mr-2"></i> Parcourir la boutique
          </a>
        </div>
      `;
      return;
    }
    
    // Trier les commandes par date (la plus récente en premier)
    userOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Afficher les commandes
    ordersContainer.innerHTML = '';
    
    userOrders.forEach(order => {
      const orderDate = new Date(order.createdAt).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
      
      const orderCard = document.createElement('div');
      orderCard.className = 'bg-white rounded-lg shadow-md p-6 mb-4';
      
      let statusClass = '';
      switch (order.status.toLowerCase()) {
        case 'en attente':
          statusClass = 'bg-yellow-100 text-yellow-800';
          break;
        case 'en cours':
          statusClass = 'bg-blue-100 text-blue-800';
          break;
        case 'terminée':
          statusClass = 'bg-green-100 text-green-800';
          break;
        case 'annulée':
          statusClass = 'bg-red-100 text-red-800';
          break;
        default:
          statusClass = 'bg-gray-100 text-gray-800';
      }
      
      orderCard.innerHTML = `
        <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
          <div>
            <h3 class="text-lg font-bold">${order._id}</h3>
            <p class="text-gray-600">Commandé le ${orderDate}</p>
          </div>
          <div class="mt-2 md:mt-0">
            <span class="px-3 py-1 rounded-full text-sm font-medium ${statusClass}">
              ${order.status}
            </span>
          </div>
        </div>
        
        <div class="border-t border-gray-200 pt-4">
          <p class="mb-2"><span class="font-medium">Profil :</span> ${order.socialMediaUsername}</p>
          <p class="mb-4"><span class="font-medium">Total :</span> ${order.totalPrice.toFixed(2)} €</p>
          
          <a href="order-details.html?id=${order._id}" class="btn-primary inline-block">
            <i class="fas fa-eye mr-2"></i> Voir les détails
          </a>
        </div>
      `;
      
      ordersContainer.appendChild(orderCard);
    });
  } catch (error) {
    console.error('Erreur lors du chargement des commandes:', error);
    
    if (loadingElement) {
      loadingElement.classList.add('hidden');
    }
    
    ordersContainer.innerHTML = `
      <div class="text-center py-8">
        <i class="fas fa-exclamation-circle text-red-500 text-5xl mb-4"></i>
        <h2 class="text-xl font-bold mb-2">Erreur</h2>
        <p class="text-gray-600 mb-4">Une erreur est survenue lors du chargement de vos commandes.</p>
        <button class="btn-primary" onclick="app.loadUserOrders()">
          <i class="fas fa-sync-alt mr-2"></i> Réessayer
        </button>
      </div>
    `;
  }
};

// Fonction pour charger les détails d'une commande
app.loadOrderDetails = function(orderId) {
  if (!auth.isLoggedIn()) {
    window.location.href = 'login.html';
    return;
  }
  
  if (!orderId) {
    window.location.href = 'orders.html';
    return;
  }
  
  const orderDetailsContainer = document.getElementById('order-details-container');
  const loadingElement = document.getElementById('order-loading');
  
  if (!orderDetailsContainer) return;
  
  try {
    // Afficher le loader
    if (loadingElement) {
      loadingElement.classList.remove('hidden');
    }
    
    // Récupérer les commandes depuis le localStorage
    const allOrders = JSON.parse(localStorage.getItem('orders')) || [];
    
    // Trouver la commande correspondante
    const order = allOrders.find(order => order._id === orderId);
    
    // Masquer le loader
    if (loadingElement) {
      loadingElement.classList.add('hidden');
    }
    
    if (!order) {
      orderDetailsContainer.innerHTML = `
        <div class="text-center py-8">
          <i class="fas fa-exclamation-circle text-red-500 text-5xl mb-4"></i>
          <h2 class="text-xl font-bold mb-2">Commande introuvable</h2>
          <p class="text-gray-600 mb-4">La commande que vous recherchez n'existe pas.</p>
          <a href="orders.html" class="btn-primary">
            <i class="fas fa-arrow-left mr-2"></i> Retour aux commandes
          </a>
        </div>
      `;
      return;
    }
    
    // Formater les dates
    const orderDate = new Date(order.createdAt).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    let paidDate = 'Non payé';
    if (order.isPaid && order.paidAt) {
      paidDate = new Date(order.paidAt).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    
    // Déterminer la classe de statut
    let statusClass = '';
    switch (order.status.toLowerCase()) {
      case 'en attente':
        statusClass = 'bg-yellow-100 text-yellow-800';
        break;
      case 'en cours':
        statusClass = 'bg-blue-100 text-blue-800';
        break;
      case 'terminée':
        statusClass = 'bg-green-100 text-green-800';
        break;
      case 'annulée':
        statusClass = 'bg-red-100 text-red-800';
        break;
      default:
        statusClass = 'bg-gray-100 text-gray-800';
    }
    
    // Afficher les détails de la commande
    orderDetailsContainer.innerHTML = `
      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h2 class="text-2xl font-bold">Commande ${order._id}</h2>
            <p class="text-gray-600">Passée le ${orderDate}</p>
          </div>
          <div class="mt-2 md:mt-0">
            <span class="px-3 py-1 rounded-full text-sm font-medium ${statusClass}">
              ${order.status}
            </span>
          </div>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 class="text-lg font-bold mb-2">Informations</h3>
            <div class="bg-gray-50 p-4 rounded-lg">
              <p class="mb-2"><span class="font-medium">Profil :</span> ${order.socialMediaUsername}</p>
              <p class="mb-2"><span class="font-medium">Statut de paiement :</span> ${order.isPaid ? 'Payé' : 'Non payé'}</p>
              <p><span class="font-medium">Date de paiement :</span> ${paidDate}</p>
            </div>
          </div>
          
          <div>
            <h3 class="text-lg font-bold mb-2">Résumé</h3>
            <div class="bg-gray-50 p-4 rounded-lg">
              <div class="flex justify-between mb-2">
                <span>Articles (${order.orderItems.reduce((total, item) => total + item.qty, 0)})</span>
                <span>${order.totalPrice.toFixed(2)} €</span>
              </div>
              <div class="border-t border-gray-200 my-2 pt-2 font-bold flex justify-between">
                <span>Total</span>
                <span>${order.totalPrice.toFixed(2)} €</span>
              </div>
            </div>
          </div>
        </div>
        
        <h3 class="text-lg font-bold mb-2">Articles commandés</h3>
        <div class="bg-gray-50 p-4 rounded-lg mb-6">
          ${order.orderItems.map(item => `
            <div class="flex items-center py-3 ${order.orderItems.indexOf(item) !== order.orderItems.length - 1 ? 'border-b border-gray-200' : ''}">
              <div class="flex-grow">
                <h4 class="font-medium">${item.name}</h4>
                <p class="text-gray-600">${item.price.toFixed(2)} € x ${item.qty}</p>
              </div>
              <div class="font-bold">
                ${(item.price * item.qty).toFixed(2)} €
              </div>
            </div>
          `).join('')}
        </div>
        
        <div class="flex justify-between">
          <a href="orders.html" class="btn-secondary">
            <i class="fas fa-arrow-left mr-2"></i> Retour aux commandes
          </a>
          
          <a href="#" class="btn-primary" onclick="window.print(); return false;">
            <i class="fas fa-print mr-2"></i> Imprimer
          </a>
        </div>
      </div>
    `;
  } catch (error) {
    console.error('Erreur lors du chargement des détails de la commande:', error);
    
    if (loadingElement) {
      loadingElement.classList.add('hidden');
    }
    
    orderDetailsContainer.innerHTML = `
      <div class="text-center py-8">
        <i class="fas fa-exclamation-circle text-red-500 text-5xl mb-4"></i>
        <h2 class="text-xl font-bold mb-2">Erreur</h2>
        <p class="text-gray-600 mb-4">Une erreur est survenue lors du chargement des détails de la commande.</p>
        <button class="btn-primary" onclick="app.loadOrderDetails('${orderId}')">
          <i class="fas fa-sync-alt mr-2"></i> Réessayer
        </button>
      </div>
    `;
  }
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
  
  // Charger les commandes de l'utilisateur
  if (document.getElementById('orders-container')) {
    app.loadUserOrders();
  }
  
  // Charger les détails d'une commande
  if (document.getElementById('order-details-container')) {
    // Récupérer l'ID de la commande depuis l'URL
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('id');
    app.loadOrderDetails(orderId);
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