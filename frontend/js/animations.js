// animations.js - Gestion des animations et effets visuels

document.addEventListener('DOMContentLoaded', function() {
  // Animation du header au scroll
  const header = document.querySelector('header');
  
  window.addEventListener('scroll', function() {
    if (window.scrollY > 10) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });
  
  // Animation des cartes produits
  const productCards = document.querySelectorAll('.product-card');
  
  if (productCards.length > 0) {
    productCards.forEach((card, index) => {
      // Ajouter une classe pour l'animation avec délai
      setTimeout(() => {
        card.classList.add('slide-in-up');
      }, index * 100); // Délai progressif pour chaque carte
    });
  }
  
  // Animation des boutons d'action
  const actionButtons = document.querySelectorAll('.btn-primary');
  
  if (actionButtons.length > 0) {
    actionButtons.forEach(button => {
      // Ajouter un effet de pulsation sur hover
      button.addEventListener('mouseenter', function() {
        this.classList.add('pulse');
      });
      
      button.addEventListener('mouseleave', function() {
        this.classList.remove('pulse');
      });
    });
  }
  
  // Animation des éléments au scroll
  const animateOnScroll = function() {
    const elements = document.querySelectorAll('.animate-on-scroll');
    
    elements.forEach(element => {
      const elementPosition = element.getBoundingClientRect().top;
      const windowHeight = window.innerHeight;
      
      if (elementPosition < windowHeight - 50) {
        element.classList.add('fade-in');
      }
    });
  };
  
  // Exécuter une fois au chargement
  animateOnScroll();
  
  // Puis à chaque scroll
  window.addEventListener('scroll', animateOnScroll);
  
  // Animation des alertes
  const showAnimatedAlert = function(message, type) {
    const alertContainer = document.getElementById('alert-container');
    
    if (!alertContainer) {
      // Créer le conteneur s'il n'existe pas
      const container = document.createElement('div');
      container.id = 'alert-container';
      container.style.position = 'fixed';
      container.style.top = '20px';
      container.style.right = '20px';
      container.style.zIndex = '9999';
      document.body.appendChild(container);
    }
    
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} slide-in-up`;
    alert.innerHTML = message;
    
    // Ajouter un bouton de fermeture
    const closeButton = document.createElement('button');
    closeButton.innerHTML = '&times;';
    closeButton.style.marginLeft = '10px';
    closeButton.style.background = 'transparent';
    closeButton.style.border = 'none';
    closeButton.style.cursor = 'pointer';
    closeButton.style.fontSize = '1.2rem';
    
    closeButton.addEventListener('click', function() {
      alert.classList.add('fade-out');
      setTimeout(() => {
        alertContainer.removeChild(alert);
      }, 300);
    });
    
    alert.appendChild(closeButton);
    alertContainer.appendChild(alert);
    
    // Disparaître automatiquement après 5 secondes
    setTimeout(() => {
      if (alert.parentNode === alertContainer) {
        alert.classList.add('fade-out');
        setTimeout(() => {
          if (alert.parentNode === alertContainer) {
            alertContainer.removeChild(alert);
          }
        }, 300);
      }
    }, 5000);
  };
  
  // Remplacer la fonction d'alerte existante si elle existe
  if (window.app && typeof window.app.showAlert === 'function') {
    const originalShowAlert = window.app.showAlert;
    
    window.app.showAlert = function(message, type) {
      // Appeler la fonction originale pour la compatibilité
      originalShowAlert(message, type);
      
      // Ajouter notre version animée
      showAnimatedAlert(message, type);
    };
  } else {
    // Définir la fonction si elle n'existe pas
    if (!window.app) window.app = {};
    window.app.showAlert = showAnimatedAlert;
  }
});

// Fonction pour ajouter des effets de parallaxe
function setupParallaxEffect() {
  const parallaxElements = document.querySelectorAll('.parallax');
  
  if (parallaxElements.length > 0) {
    window.addEventListener('scroll', function() {
      parallaxElements.forEach(element => {
        const speed = element.getAttribute('data-speed') || 0.5;
        const yPos = -(window.scrollY * speed);
        element.style.transform = `translateY(${yPos}px)`;
      });
    });
  }
}

// Fonction pour ajouter des effets de hover aux images
function setupImageHoverEffects() {
  const productImages = document.querySelectorAll('.product-image');
  
  if (productImages.length > 0) {
    productImages.forEach(image => {
      image.addEventListener('mouseenter', function() {
        this.style.transform = 'scale(1.05)';
        this.style.transition = 'transform 0.3s ease';
      });
      
      image.addEventListener('mouseleave', function() {
        this.style.transform = 'scale(1)';
      });
    });
  }
}

// Exécuter les fonctions au chargement
document.addEventListener('DOMContentLoaded', function() {
  setupParallaxEffect();
  setupImageHoverEffects();
});