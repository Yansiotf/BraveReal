// payment.js - Module de paiement pour Stripe et PayPal

const payment = {};

// Configuration des clés API (à remplacer par vos clés réelles en production)
payment.config = {
  stripe: {
    publicKey: 'pk_test_TYooMQauvdEDq54NiTphI7jx',  // Clé de test Stripe
    currency: 'eur',
    merchantEmail: 'yns212erie@gmail.com'  // Email du marchand pour recevoir les notifications
  },
  paypal: {
    clientId: 'sb',  // Clé de test PayPal (sandbox)
    currency: 'EUR',
    merchantEmail: 'yns212erie@gmail.com'  // Email PayPal du marchand pour recevoir les paiements
  }
};

// Instructions de configuration pour la production
payment.configInstructions = {
  stripe: `
    Pour configurer Stripe en production:
    1. Créez un compte sur stripe.com
    2. Obtenez votre clé API publique dans le tableau de bord Stripe
    3. Remplacez la clé de test par votre clé réelle dans payment.config.stripe.publicKey
    4. Configurez un webhook pour recevoir les notifications de paiement
  `,
  paypal: `
    Pour configurer PayPal en production:
    1. Créez un compte développeur sur developer.paypal.com
    2. Créez une application pour obtenir votre Client ID
    3. Remplacez la clé de test 'sb' par votre Client ID réel dans payment.config.paypal.clientId
    4. Assurez-vous que l'email marchand est correctement configuré
  `
};

// Variable pour suivre si Stripe est déjà initialisé
payment.stripeInitialized = false;

// Initialiser Stripe (une seule fois)
payment.initStripe = function() {
  // Si Stripe est déjà initialisé, retourner l'instance existante
  if (payment.stripeInitialized && payment.stripe) {
    return Promise.resolve(payment.stripe);
  }
  
  // Charger le script Stripe si nécessaire
  if (!window.Stripe) {
    return new Promise((resolve) => {
      // Vérifier si le script est déjà en cours de chargement
      if (document.querySelector('script[src="https://js.stripe.com/v3/"]')) {
        // Attendre que Stripe soit disponible
        const checkStripe = setInterval(() => {
          if (window.Stripe) {
            clearInterval(checkStripe);
            payment.stripe = window.Stripe(payment.config.stripe.publicKey);
            payment.stripeInitialized = true;
            resolve(payment.stripe);
          }
        }, 100);
      } else {
        // Charger le script
        const script = document.createElement('script');
        script.src = 'https://js.stripe.com/v3/';
        script.async = true;
        
        script.onload = () => {
          payment.stripe = window.Stripe(payment.config.stripe.publicKey);
          payment.stripeInitialized = true;
          resolve(payment.stripe);
        };
        
        document.head.appendChild(script);
      }
    });
  } else {
    // Stripe est déjà chargé
    payment.stripe = window.Stripe(payment.config.stripe.publicKey);
    payment.stripeInitialized = true;
    return Promise.resolve(payment.stripe);
  }
};

// Initialiser PayPal
payment.initPayPal = function() {
  // Charger le script PayPal si nécessaire
  if (!window.paypal) {
    return new Promise((resolve) => {
      // Vérifier si le script est déjà en cours de chargement
      const paypalScript = document.querySelector(`script[src*="www.paypal.com/sdk/js"]`);
      if (paypalScript) {
        // Attendre que PayPal soit disponible
        const checkPayPal = setInterval(() => {
          if (window.paypal) {
            clearInterval(checkPayPal);
            resolve(window.paypal);
          }
        }, 100);
      } else {
        // Charger le script
        const script = document.createElement('script');
        script.src = `https://www.paypal.com/sdk/js?client-id=${payment.config.paypal.clientId}&currency=${payment.config.paypal.currency}`;
        script.async = true;
        
        script.onload = () => {
          resolve(window.paypal);
        };
        
        document.head.appendChild(script);
      }
    });
  } else {
    return Promise.resolve(window.paypal);
  }
};

// Créer une session de paiement Stripe
payment.createStripeSession = async function(orderData) {
  try {
    // En production, cette partie devrait être gérée par votre backend
    // Ici, nous simulons la création d'une session pour la démo
    
    await payment.initStripe();
    
    // Simuler un délai de traitement
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Créer un élément de carte Stripe
    const elements = payment.stripe.elements();
    
    // Vérifier si un élément de carte existe déjà dans le DOM
    const cardElement = document.getElementById('stripe-card-element');
    if (!cardElement) {
      throw new Error("L'élément de carte Stripe n'existe pas dans le DOM");
    }
    
    // Vider l'élément avant de monter une nouvelle carte
    cardElement.innerHTML = '';
    
    // Créer un élément de carte
    const card = elements.create('card', {
      style: {
        base: {
          color: '#32325d',
          fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
          fontSmoothing: 'antialiased',
          fontSize: '16px',
          '::placeholder': {
            color: '#aab7c4'
          }
        },
        invalid: {
          color: '#fa755a',
          iconColor: '#fa755a'
        }
      }
    });
    
    // Monter l'élément de carte
    card.mount('#stripe-card-element');
    
    return {
      elements,
      card,
      // Pour la démo, nous utilisons un ID simulé
      // En production, vous devriez obtenir un vrai client_secret du backend
      amount: orderData.amount
    };
  } catch (error) {
    console.error('Erreur lors de la création de la session Stripe:', error);
    throw error;
  }
};

// Traiter un paiement Stripe
payment.processStripePayment = async function(sessionData, cardholderName) {
  try {
    // Pour la démo, nous simulons un paiement réussi
    // En production, vous devriez utiliser stripe.confirmCardPayment avec un vrai client_secret
    
    // Simuler un délai de traitement
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Vérifier que la carte a été saisie
    const cardElement = document.getElementById('stripe-card-element');
    if (!cardElement || cardElement.innerHTML === '') {
      throw new Error("Veuillez saisir les informations de votre carte");
    }
    
    // Vérifier que le nom du titulaire a été saisi
    if (!cardholderName || cardholderName.trim() === '') {
      throw new Error("Veuillez saisir le nom du titulaire de la carte");
    }
    
    // Simuler une réponse de paiement réussie
    return {
      success: true,
      paymentId: 'pi_' + Date.now(),
      paymentMethod: 'stripe',
      cardholderName: cardholderName
    };
  } catch (error) {
    console.error('Erreur lors du traitement du paiement Stripe:', error);
    throw error;
  }
};

// Rendre le bouton PayPal
payment.renderPayPalButton = async function(containerId, orderData) {
  try {
    const paypal = await payment.initPayPal();
    
    // Vider le conteneur avant de rendre le bouton
    const container = document.getElementById(containerId);
    if (container) {
      container.innerHTML = '';
    }
    
    return paypal.Buttons({
      fundingSource: paypal.FUNDING.PAYPAL,
      style: {
        layout: 'vertical',
        color: 'blue',
        shape: 'rect',
        label: 'pay'
      },
      createOrder: function(data, actions) {
        // En production, cette partie devrait être gérée par votre backend
        // Ici, nous simulons la création d'une commande pour la démo
        
        return actions.order.create({
          purchase_units: [{
            amount: {
              value: orderData.amount.toFixed(2),
              currency_code: payment.config.paypal.currency
            },
            description: orderData.description || 'Commande BraveSMM'
          }]
        });
      },
      onApprove: function(data, actions) {
        // Simuler la capture du paiement
        return actions.order.capture().then(function(details) {
          return {
            success: true,
            paymentId: details.id || 'pp_' + Date.now(),
            paymentMethod: 'paypal'
          };
        });
      },
      onError: function(err) {
        console.error('Erreur PayPal:', err);
        throw err;
      }
    }).render('#' + containerId);
  } catch (error) {
    console.error('Erreur lors du rendu du bouton PayPal:', error);
    throw error;
  }
};

// Fonction pour traiter un paiement (Stripe ou PayPal)
payment.processPayment = async function(method, orderData, additionalData = {}) {
  try {
    // Simuler un délai de traitement
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Pour la démo, nous simulons toujours un paiement réussi
    return {
      success: true,
      paymentId: method + '_' + Date.now(),
      paymentMethod: method,
      amount: orderData.amount,
      currency: method === 'stripe' ? payment.config.stripe.currency : payment.config.paypal.currency,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error(`Erreur lors du traitement du paiement ${method}:`, error);
    throw error;
  }
};

// Exporter le module
window.payment = payment;