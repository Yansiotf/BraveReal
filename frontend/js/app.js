// app.js - Fichier principal pour l'application

// Créer un objet global pour l'application
window.app = {};
window.auth = {};

// Initialiser l'application
document.addEventListener('DOMContentLoaded', () => {
  console.log('Application initialisée');
  
  // Charger les fonctions depuis main.js et auth.js
  if (typeof loadAppFunctions === 'function') {
    loadAppFunctions();
  }
  
  if (typeof loadAuthFunctions === 'function') {
    loadAuthFunctions();
  }
  
  // Mettre à jour le compteur du panier
  if (app.updateCartCount) {
    app.updateCartCount();
  }
  
  // Configurer le menu utilisateur
  if (auth.setupUserMenu) {
    auth.setupUserMenu();
  }
  
  // Configurer le menu mobile
  if (auth.setupMobileMenu) {
    auth.setupMobileMenu();
  }
  
  // Charger les produits en vedette sur la page d'accueil
  if (app.loadFeaturedProducts && document.getElementById('featured-products')) {
    app.loadFeaturedProducts();
  }
  
  // Charger les catégories sur la page boutique
  if (app.loadCategories && document.getElementById('categories-container')) {
    app.loadCategories();
  }
  
  // Charger les produits sur la page boutique
  if (app.loadProducts && document.getElementById('products-container')) {
    app.loadProducts();
  }
  
  // Configurer le formulaire de contact
  const contactForm = document.getElementById('contact-form');
  if (contactForm && app.showAlert) {
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