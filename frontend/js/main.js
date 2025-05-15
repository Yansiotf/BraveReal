// main.js - Fonctions principales du site

// URL de base de l'API
const API_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:5000/api' 
  : '/api';

// Fonction pour afficher un message d'alerte
function showAlert(message, type = 'info') {
  const alertContainer = document.getElementById('alert-container') || createAlertContainer();
  
  const alert = document.createElement('div');
  alert.className = `alert alert-${type} fade-in`;
  
  // Icône en fonction du type d'alerte
  let icon = '';
  switch(type) {
    case 'success':
      icon = '<i class="fas fa-check-circle mr-3 text-green-600"></i>';
      break;
    case 'error':
      icon = '<i class="fas fa-exclamation-circle mr-3 text-red-600"></i>';
      break;
    case 'info':
    default:
      icon = '<i class="fas fa-info-circle mr-3 text-blue-600"></i>';
      break;
  }
  
  // Ajouter un bouton de fermeture
  const closeButton = document.createElement('button');
  closeButton.innerHTML = '&times;';
  closeButton.className = 'absolute top-2 right-2 text-gray-500 hover:text-gray-700 focus:outline-none';
  closeButton.onclick = () => {
    alert.classList.add('fade-out');
    setTimeout(() => alert.remove(), 300);
  };
  
  alert.innerHTML = `
    <div class="flex items-center">
      ${icon}
      <div>${message}</div>
    </div>
  `;
  
  alert.appendChild(closeButton);
  alertContainer.appendChild(alert);
  
  // Supprimer automatiquement l'alerte après 5 secondes
  setTimeout(() => {
    alert.classList.add('fade-out');
    setTimeout(() => alert.remove(), 300);
  }, 5000);
}

// Fonction pour créer un conteneur d'alertes s'il n'existe pas
function createAlertContainer() {
  const container = document.createElement('div');
  container.id = 'alert-container';
  container.className = 'fixed top-4 right-4 z-50 w-80 space-y-2';
  document.body.appendChild(container);
  return container;
}

// Ajouter des styles pour l'animation des alertes
const style = document.createElement('style');
style.textContent = `
  .fade-out {
    opacity: 0;
    transform: translateX(100%);
    transition: opacity 0.3s ease, transform 0.3s ease;
  }
`;
document.head.appendChild(style);

// Fonction pour charger les produits en vedette sur la page d'accueil
async function loadFeaturedProducts() {
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
    
    featuredProductsContainer.innerHTML = '';
    
    if (featuredProducts.length === 0) {
      featuredProductsContainer.innerHTML = `
        <div class="col-span-full text-center py-8">
          <i class="fas fa-box-open text-gray-400 text-5xl mb-4"></i>
          <p class="text-gray-600">Aucun produit disponible pour le moment.</p>
        </div>
      `;
      return;
    }
    
    featuredProducts.forEach(product => {
      const productCard = document.createElement('div');
      productCard.className = 'bg-white rounded-lg shadow-sm overflow-hidden product-card';
      
      // Déterminer l'icône en fonction de la catégorie (si disponible)
      let categoryIcon = '<i class="fas fa-star"></i>';
      if (product.category && product.category.name) {
        switch(product.category.name.toLowerCase()) {
          case 'instagram':
            categoryIcon = '<i class="fab fa-instagram"></i>';
            break;
          case 'tiktok':
            categoryIcon = '<i class="fab fa-tiktok"></i>';
            break;
          case 'youtube':
            categoryIcon = '<i class="fab fa-youtube"></i>';
            break;
          case 'facebook':
            categoryIcon = '<i class="fab fa-facebook"></i>';
            break;
          case 'twitter':
            categoryIcon = '<i class="fab fa-twitter"></i>';
            break;
        }
      }
      
      productCard.innerHTML = `
        <div class="p-6">
          <div class="flex justify-between items-start mb-3">
            <h3 class="text-lg font-bold">${product.name}</h3>
            <span class="text-gray-400">${categoryIcon}</span>
          </div>
          <p class="text-gray-600 text-sm mb-4 h-12 overflow-hidden">${product.description.substring(0, 100)}${product.description.length > 100 ? '...' : ''}</p>
          <div class="flex justify-between items-center pt-3 border-t border-gray-100">
            <span class="text-blue-600 font-bold text-lg">${product.price.toFixed(2)} €</span>
            <button class="btn-primary add-to-cart" data-id="${product._id}">
              <i class="fas fa-cart-plus mr-1"></i> Ajouter
            </button>
          </div>
        </div>
      `;
      
      featuredProductsContainer.appendChild(productCard);
      
      // Ajouter un événement au bouton "Ajouter au panier"
      const addToCartButton = productCard.querySelector('.add-to-cart');
      addToCartButton.addEventListener('click', (e) => {
        e.preventDefault();
        addToCart(product);
        
        // Animation de confirmation
        const button = e.target.closest('.add-to-cart');
        const originalText = button.innerHTML;
        button.innerHTML = '<i class="fas fa-check"></i> Ajouté';
        button.classList.add('bg-green-600');
        
        setTimeout(() => {
          button.innerHTML = originalText;
          button.classList.remove('bg-green-600');
        }, 1500);
      });
    });
  } catch (error) {
    console.error('Erreur lors du chargement des produits:', error);
    featuredProductsContainer.innerHTML = `
      <div class="col-span-full text-center py-8">
        <i class="fas fa-exclamation-circle text-red-500 text-5xl mb-4"></i>
        <p class="text-red-500">Erreur lors du chargement des produits.</p>
        <button class="mt-4 btn-primary" onclick="app.loadFeaturedProducts()">
          <i class="fas fa-sync-alt mr-2"></i> Réessayer
        </button>
      </div>
    `;
  }
}

// Fonction pour charger les catégories
async function loadCategories() {
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
        loadProducts(categoryId);
      });
    });
  } catch (error) {
    console.error('Erreur lors du chargement des catégories:', error);
    categoriesContainer.innerHTML = '<p class="text-center text-red-500">Erreur lors du chargement des catégories.</p>';
  }
}

// Fonction pour charger les produits dans la page boutique
async function loadProducts(categoryId = '') {
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
        addToCart(product);
      });
    });
  } catch (error) {
    console.error('Erreur lors du chargement des produits:', error);
    productsContainer.innerHTML = '<p class="text-center col-span-full text-red-500">Erreur lors du chargement des produits.</p>';
  }
}

// Fonction pour ajouter un produit au panier
function addToCart(product) {
  const cart = JSON.parse(localStorage.getItem('cartItems')) || [];
  
  // Vérifier si le produit est déjà dans le panier
  const existingItem = cart.find(item => item._id === product._id);
  
  if (existingItem) {
    // Augmenter la quantité
    existingItem.quantity += 1;
  } else {
    // Ajouter le produit au panier
    cart.push({
      _id: product._id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.image || '',
      category: product.category ? product.category.name : '',
    });
  }
  
  // Sauvegarder le panier dans le localStorage
  localStorage.setItem('cartItems', JSON.stringify(cart));
  
  // Mettre à jour le compteur du panier
  updateCartCount();
  
  // Animer l'icône du panier
  animateCartIcon();
  
  // Afficher un message de confirmation
  showAlert(`${product.name} a été ajouté au panier`, 'success');
}

// Fonction pour animer l'icône du panier
function animateCartIcon() {
  const cartIcon = document.querySelector('a[href="cart.html"] i');
  if (!cartIcon) return;
  
  // Ajouter une classe pour l'animation
  cartIcon.classList.add('animate-bounce');
  
  // Supprimer la classe après l'animation
  setTimeout(() => {
    cartIcon.classList.remove('animate-bounce');
  }, 1000);
  
  // Ajouter des styles pour l'animation si elle n'existe pas déjà
  if (!document.getElementById('cart-animation-style')) {
    const style = document.createElement('style');
    style.id = 'cart-animation-style';
    style.textContent = `
      @keyframes bounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-5px); }
      }
      .animate-bounce {
        animation: bounce 0.5s ease 2;
      }
    `;
    document.head.appendChild(style);
  }
}

// Fonction pour mettre à jour le compteur du panier
function updateCartCount() {
  const cartCountElement = document.getElementById('cart-count');
  if (!cartCountElement) return;
  
  const cart = JSON.parse(localStorage.getItem('cartItems')) || [];
  const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
  
  cartCountElement.textContent = itemCount;
}

// Fonction pour charger le contenu du panier
function loadCart() {
  const cartItemsContainer = document.getElementById('cart-items');
  const cartTotalElement = document.getElementById('cart-total');
  const checkoutButton = document.getElementById('checkout-button');
  
  if (!cartItemsContainer || !cartTotalElement) return;
  
  const cart = JSON.parse(localStorage.getItem('cartItems')) || [];
  
  if (cart.length === 0) {
    cartItemsContainer.innerHTML = '<tr><td colspan="5" class="text-center py-4">Votre panier est vide</td></tr>';
    cartTotalElement.textContent = '0.00 €';
    
    if (checkoutButton) {
      checkoutButton.disabled = true;
      checkoutButton.classList.add('opacity-50', 'cursor-not-allowed');
    }
    
    return;
  }
  
  cartItemsContainer.innerHTML = '';
  
  let total = 0;
  
  cart.forEach(item => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;
    
    const row = document.createElement('tr');
    row.className = 'border-b';
    row.innerHTML = `
      <td class="py-4 px-2">
        <div class="flex items-center">
          <div class="ml-3">
            <p class="text-gray-900 font-medium">${item.name}</p>
          </div>
        </div>
      </td>
      <td class="py-4 px-2 text-center">${item.price.toFixed(2)} €</td>
      <td class="py-4 px-2">
        <div class="flex items-center justify-center">
          <button class="quantity-btn decrease-quantity px-2 py-1 bg-gray-200 rounded-l" data-id="${item._id}">-</button>
          <span class="px-4 py-1 bg-gray-100">${item.quantity}</span>
          <button class="quantity-btn increase-quantity px-2 py-1 bg-gray-200 rounded-r" data-id="${item._id}">+</button>
        </div>
      </td>
      <td class="py-4 px-2 text-center">${itemTotal.toFixed(2)} €</td>
      <td class="py-4 px-2 text-center">
        <button class="remove-item text-red-500 hover:text-red-700" data-id="${item._id}">
          <i class="fas fa-trash"></i>
        </button>
      </td>
    `;
    
    cartItemsContainer.appendChild(row);
  });
  
  cartTotalElement.textContent = `${total.toFixed(2)} €`;
  
  if (checkoutButton) {
    checkoutButton.disabled = false;
    checkoutButton.classList.remove('opacity-50', 'cursor-not-allowed');
  }
  
  // Ajouter des événements aux boutons
  document.querySelectorAll('.decrease-quantity').forEach(button => {
    button.addEventListener('click', () => {
      updateCartItemQuantity(button.dataset.id, -1);
    });
  });
  
  document.querySelectorAll('.increase-quantity').forEach(button => {
    button.addEventListener('click', () => {
      updateCartItemQuantity(button.dataset.id, 1);
    });
  });
  
  document.querySelectorAll('.remove-item').forEach(button => {
    button.addEventListener('click', () => {
      removeCartItem(button.dataset.id);
    });
  });
}

// Fonction pour mettre à jour la quantité d'un article dans le panier
function updateCartItemQuantity(productId, change) {
  const cart = JSON.parse(localStorage.getItem('cartItems')) || [];
  
  const itemIndex = cart.findIndex(item => item._id === productId);
  
  if (itemIndex !== -1) {
    cart[itemIndex].quantity += change;
    
    // Supprimer l'article si la quantité est inférieure ou égale à 0
    if (cart[itemIndex].quantity <= 0) {
      cart.splice(itemIndex, 1);
    }
    
    // Sauvegarder le panier mis à jour
    localStorage.setItem('cartItems', JSON.stringify(cart));
    
    // Recharger le panier
    loadCart();
    
    // Mettre à jour le compteur du panier
    updateCartCount();
  }
}

// Fonction pour supprimer un article du panier
function removeCartItem(productId) {
  const cart = JSON.parse(localStorage.getItem('cartItems')) || [];
  
  const updatedCart = cart.filter(item => item._id !== productId);
  
  // Sauvegarder le panier mis à jour
  localStorage.setItem('cartItems', JSON.stringify(updatedCart));
  
  // Recharger le panier
  loadCart();
  
  // Mettre à jour le compteur du panier
  updateCartCount();
  
  // Afficher un message de confirmation
  showAlert('Article supprimé du panier', 'info');
}

// Fonction pour passer une commande
async function placeOrder(socialMediaUsername) {
  if (!auth.isLoggedIn()) {
    showAlert('Veuillez vous connecter pour passer une commande', 'error');
    window.location.href = 'login.html';
    return;
  }
  
  const cart = JSON.parse(localStorage.getItem('cartItems')) || [];
  
  if (cart.length === 0) {
    showAlert('Votre panier est vide', 'error');
    return;
  }
  
  if (!socialMediaUsername) {
    showAlert('Veuillez fournir un nom d\'utilisateur ou un lien de profil', 'error');
    return;
  }
  
  try {
    // Calculer le total
    const totalPrice = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    
    // Préparer les données de la commande
    const orderData = {
      orderItems: cart.map(item => ({
        name: item.name,
        quantity: item.quantity,
        image: item.image || '',
        price: item.price,
        product: item._id
      })),
      socialMediaUsername,
      totalPrice
    };
    
    // Envoyer la commande à l'API
    const response = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${auth.getToken()}`
      },
      body: JSON.stringify(orderData)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Erreur lors de la création de la commande');
    }
    
    // Simuler un paiement réussi
    await simulatePayment(data._id);
    
    // Vider le panier
    localStorage.removeItem('cartItems');
    
    // Rediriger vers la page de confirmation
    window.location.href = `order-confirmation.html?id=${data._id}`;
  } catch (error) {
    console.error('Erreur lors de la commande:', error);
    showAlert(error.message || 'Erreur lors de la commande', 'error');
  }
}

// Fonction pour simuler un paiement
async function simulatePayment(orderId) {
  try {
    const response = await fetch(`${API_URL}/orders/${orderId}/pay`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${auth.getToken()}`
      }
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Erreur lors du paiement');
    }
    
    return data;
  } catch (error) {
    console.error('Erreur lors du paiement:', error);
    throw error;
  }
}

// Fonction pour charger les commandes de l'utilisateur
async function loadUserOrders() {
  if (!auth.isLoggedIn()) {
    window.location.href = 'login.html';
    return;
  }
  
  const ordersContainer = document.getElementById('orders-container');
  if (!ordersContainer) return;
  
  // Afficher un loader
  ordersContainer.innerHTML = '<div class="loader mx-auto"></div>';
  
  try {
    const response = await fetch(`${API_URL}/orders/myorders`, {
      headers: {
        'Authorization': `Bearer ${auth.getToken()}`
      }
    });
    
    const orders = await response.json();
    
    ordersContainer.innerHTML = '';
    
    if (orders.length === 0) {
      ordersContainer.innerHTML = '<p class="text-center py-4">Vous n\'avez pas encore de commandes</p>';
      return;
    }
    
    // Trier les commandes par date (la plus récente en premier)
    orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    orders.forEach(order => {
      const orderCard = document.createElement('div');
      orderCard.className = 'bg-white rounded-lg shadow-md p-4 mb-4';
      
      // Formater la date
      const orderDate = new Date(order.createdAt);
      const formattedDate = orderDate.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      
      // Déterminer la classe de statut
      let statusClass = '';
      switch (order.status) {
        case 'en attente':
          statusClass = 'bg-yellow-100 text-yellow-800';
          break;
        case 'en cours':
          statusClass = 'bg-blue-100 text-blue-800';
          break;
        case 'livré':
          statusClass = 'bg-green-100 text-green-800';
          break;
        case 'annulé':
          statusClass = 'bg-red-100 text-red-800';
          break;
        default:
          statusClass = 'bg-gray-100 text-gray-800';
      }
      
      orderCard.innerHTML = `
        <div class="flex justify-between items-start mb-4">
          <div>
            <h3 class="text-lg font-bold">Commande #${order._id.substring(order._id.length - 8)}</h3>
            <p class="text-gray-600">Passée le ${formattedDate}</p>
          </div>
          <span class="px-3 py-1 rounded-full text-sm font-medium ${statusClass}">
            ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </span>
        </div>
        
        <div class="border-t border-b py-4 my-4">
          <h4 class="font-medium mb-2">Articles commandés</h4>
          <ul class="space-y-2">
            ${order.orderItems.map(item => `
              <li class="flex justify-between">
                <span>${item.name} x${item.quantity}</span>
                <span>${(item.price * item.quantity).toFixed(2)} €</span>
              </li>
            `).join('')}
          </ul>
        </div>
        
        <div class="flex justify-between items-center">
          <div>
            <p class="font-medium">Total</p>
            <p class="text-lg font-bold">${order.totalPrice.toFixed(2)} €</p>
          </div>
          <a href="order-details.html?id=${order._id}" class="btn-primary">
            Voir les détails
          </a>
        </div>
      `;
      
      ordersContainer.appendChild(orderCard);
    });
  } catch (error) {
    console.error('Erreur lors du chargement des commandes:', error);
    ordersContainer.innerHTML = '<p class="text-center text-red-500 py-4">Erreur lors du chargement des commandes</p>';
  }
}

// Fonction pour charger les détails d'une commande
async function loadOrderDetails(orderId) {
  if (!auth.isLoggedIn()) {
    window.location.href = 'login.html';
    return;
  }
  
  const orderDetailsContainer = document.getElementById('order-details');
  if (!orderDetailsContainer) return;
  
  // Afficher un loader
  orderDetailsContainer.innerHTML = '<div class="loader mx-auto"></div>';
  
  try {
    const response = await fetch(`${API_URL}/orders/${orderId}`, {
      headers: {
        'Authorization': `Bearer ${auth.getToken()}`
      }
    });
    
    const order = await response.json();
    
    if (!response.ok) {
      throw new Error(order.message || 'Erreur lors du chargement des détails de la commande');
    }
    
    // Formater la date
    const orderDate = new Date(order.createdAt);
    const formattedDate = orderDate.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    // Déterminer la classe de statut
    let statusClass = '';
    switch (order.status) {
      case 'en attente':
        statusClass = 'bg-yellow-100 text-yellow-800';
        break;
      case 'en cours':
        statusClass = 'bg-blue-100 text-blue-800';
        break;
      case 'livré':
        statusClass = 'bg-green-100 text-green-800';
        break;
      case 'annulé':
        statusClass = 'bg-red-100 text-red-800';
        break;
      default:
        statusClass = 'bg-gray-100 text-gray-800';
    }
    
    orderDetailsContainer.innerHTML = `
      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="flex justify-between items-start mb-6">
          <div>
            <h2 class="text-2xl font-bold mb-2">Commande #${order._id.substring(order._id.length - 8)}</h2>
            <p class="text-gray-600">Passée le ${formattedDate}</p>
          </div>
          <span class="px-3 py-1 rounded-full text-sm font-medium ${statusClass}">
            ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </span>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 class="text-lg font-bold mb-3">Informations de commande</h3>
            <p><span class="font-medium">Nom d'utilisateur/Lien :</span> ${order.socialMediaUsername}</p>
            <p><span class="font-medium">Statut de paiement :</span> ${order.isPaid ? 'Payé' : 'Non payé'}</p>
            ${order.isPaid ? `<p><span class="font-medium">Date de paiement :</span> ${new Date(order.paidAt).toLocaleDateString('fr-FR')}</p>` : ''}
            ${order.deliveredAt ? `<p><span class="font-medium">Date de livraison :</span> ${new Date(order.deliveredAt).toLocaleDateString('fr-FR')}</p>` : ''}
          </div>
        </div>
        
        <div class="mb-6">
          <h3 class="text-lg font-bold mb-3">Articles commandés</h3>
          <div class="overflow-x-auto">
            <table class="w-full responsive-table">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-4 py-2 text-left">Produit</th>
                  <th class="px-4 py-2 text-center">Prix unitaire</th>
                  <th class="px-4 py-2 text-center">Quantité</th>
                  <th class="px-4 py-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                ${order.orderItems.map(item => `
                  <tr class="border-b">
                    <td class="px-4 py-3">${item.name}</td>
                    <td class="px-4 py-3 text-center">${item.price.toFixed(2)} €</td>
                    <td class="px-4 py-3 text-center">${item.quantity}</td>
                    <td class="px-4 py-3 text-right">${(item.price * item.quantity).toFixed(2)} €</td>
                  </tr>
                `).join('')}
              </tbody>
              <tfoot>
                <tr class="font-bold">
                  <td class="px-4 py-3" colspan="3">Total</td>
                  <td class="px-4 py-3 text-right">${order.totalPrice.toFixed(2)} €</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
        
        <div class="text-right">
          <a href="orders.html" class="btn-secondary">
            Retour aux commandes
          </a>
        </div>
      </div>
    `;
  } catch (error) {
    console.error('Erreur lors du chargement des détails de la commande:', error);
    orderDetailsContainer.innerHTML = '<p class="text-center text-red-500 py-4">Erreur lors du chargement des détails de la commande</p>';
  }
}

// Fonction pour charger les commandes dans l'interface d'administration
async function loadAdminOrders() {
  if (!auth.isLoggedIn() || !auth.isAdmin()) {
    window.location.href = '/';
    return;
  }
  
  const ordersContainer = document.getElementById('admin-orders-container');
  if (!ordersContainer) return;
  
  // Afficher un loader
  ordersContainer.innerHTML = '<div class="loader mx-auto"></div>';
  
  try {
    const response = await fetch(`${API_URL}/orders`, {
      headers: {
        'Authorization': `Bearer ${auth.getToken()}`
      }
    });
    
    const orders = await response.json();
    
    if (!response.ok) {
      throw new Error(orders.message || 'Erreur lors du chargement des commandes');
    }
    
    ordersContainer.innerHTML = '';
    
    if (orders.length === 0) {
      ordersContainer.innerHTML = '<tr><td colspan="6" class="text-center py-4">Aucune commande trouvée</td></tr>';
      return;
    }
    
    // Trier les commandes par date (la plus récente en premier)
    orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    orders.forEach(order => {
      const row = document.createElement('tr');
      row.className = 'border-b hover:bg-gray-50';
      
      // Formater la date
      const orderDate = new Date(order.createdAt);
      const formattedDate = orderDate.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      
      // Déterminer la classe de statut
      let statusClass = '';
      switch (order.status) {
        case 'en attente':
          statusClass = 'bg-yellow-100 text-yellow-800';
          break;
        case 'en cours':
          statusClass = 'bg-blue-100 text-blue-800';
          break;
        case 'livré':
          statusClass = 'bg-green-100 text-green-800';
          break;
        case 'annulé':
          statusClass = 'bg-red-100 text-red-800';
          break;
        default:
          statusClass = 'bg-gray-100 text-gray-800';
      }
      
      row.innerHTML = `
        <td class="px-4 py-3">#${order._id.substring(order._id.length - 8)}</td>
        <td class="px-4 py-3">${order.user ? order.user.name : 'Utilisateur inconnu'}</td>
        <td class="px-4 py-3">${formattedDate}</td>
        <td class="px-4 py-3">${order.totalPrice.toFixed(2)} €</td>
        <td class="px-4 py-3">
          <span class="px-2 py-1 rounded-full text-xs font-medium ${statusClass}">
            ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </span>
        </td>
        <td class="px-4 py-3">
          <div class="flex items-center space-x-2">
            <a href="admin-order-details.html?id=${order._id}" class="text-blue-600 hover:text-blue-800">
              <i class="fas fa-eye"></i>
            </a>
            <button class="text-green-600 hover:text-green-800 update-status" data-id="${order._id}" data-status="${order.status}">
              <i class="fas fa-edit"></i>
            </button>
          </div>
        </td>
      `;
      
      ordersContainer.appendChild(row);
    });
    
    // Ajouter des événements aux boutons de mise à jour du statut
    document.querySelectorAll('.update-status').forEach(button => {
      button.addEventListener('click', () => {
        showStatusUpdateModal(button.dataset.id, button.dataset.status);
      });
    });
  } catch (error) {
    console.error('Erreur lors du chargement des commandes:', error);
    ordersContainer.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-red-500">Erreur lors du chargement des commandes</td></tr>';
  }
}

// Fonction pour afficher le modal de mise à jour du statut
function showStatusUpdateModal(orderId, currentStatus) {
  // Créer le modal s'il n'existe pas
  let modal = document.getElementById('status-modal');
  
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'status-modal';
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden';
    modal.innerHTML = `
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 class="text-xl font-bold mb-4">Mettre à jour le statut</h3>
        <form id="status-form">
          <div class="mb-4">
            <label class="form-label" for="status">Statut</label>
            <select id="status-select" class="form-input">
              <option value="en attente">En attente</option>
              <option value="en cours">En cours</option>
              <option value="livré">Livré</option>
              <option value="annulé">Annulé</option>
            </select>
          </div>
          <div class="flex justify-end space-x-2">
            <button type="button" id="cancel-status" class="btn-secondary">Annuler</button>
            <button type="submit" class="btn-primary">Mettre à jour</button>
          </div>
        </form>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Ajouter des événements
    document.getElementById('cancel-status').addEventListener('click', () => {
      modal.classList.add('hidden');
    });
    
    document.getElementById('status-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const status = document.getElementById('status-select').value;
      await updateOrderStatus(orderId, status);
      
      modal.classList.add('hidden');
    });
  }
  
  // Mettre à jour le statut actuel dans le select
  document.getElementById('status-select').value = currentStatus;
  
  // Afficher le modal
  modal.classList.remove('hidden');
}

// Fonction pour mettre à jour le statut d'une commande
async function updateOrderStatus(orderId, status) {
  try {
    const response = await fetch(`${API_URL}/orders/${orderId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${auth.getToken()}`
      },
      body: JSON.stringify({ status })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Erreur lors de la mise à jour du statut');
    }
    
    // Recharger les commandes
    loadAdminOrders();
    
    // Afficher un message de confirmation
    showAlert('Statut mis à jour avec succès', 'success');
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut:', error);
    showAlert(error.message || 'Erreur lors de la mise à jour du statut', 'error');
  }
}

// Initialiser l'application
document.addEventListener('DOMContentLoaded', () => {
  // Mettre à jour le compteur du panier
  updateCartCount();
});

// Exporter les fonctions
window.app = {
  showAlert,
  loadFeaturedProducts,
  loadCategories,
  loadProducts,
  addToCart,
  updateCartCount,
  loadCart,
  updateCartItemQuantity,
  removeCartItem,
  placeOrder,
  loadUserOrders,
  loadOrderDetails,
  loadAdminOrders,
  updateOrderStatus
};