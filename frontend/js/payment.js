// payment.js - Module de paiement pour Stripe et PayPal

const payment = {};

// Configuration des clés API (à remplacer par vos clés réelles en production)
payment.config = {
  stripe: {
    publicKey: 'pk_test_51OxXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
    currency: 'eur'
  },
  paypal: {
    clientId: 'AeXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
    currency: 'EUR'
  }
};

// Initialiser Stripe
payment.initStripe = function() {
  // Charger le script Stripe si nécessaire
  if (!window.Stripe) {
    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/';
    script.async = true;
    document.head.appendChild(script);
    
    return new Promise(resolve => {
      script.onload = () => {
        payment.stripe = Stripe(payment.config.stripe.publicKey);
        resolve(payment.stripe);
      };
    });
  } else {
    payment.stripe = Stripe(payment.config.stripe.publicKey);
    return Promise.resolve(payment.stripe);
  }
};

// Initialiser PayPal
payment.initPayPal = function() {
  // Charger le script PayPal si nécessaire
  if (!window.paypal) {
    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=${payment.config.paypal.clientId}&currency=${payment.config.paypal.currency}`;
    script.async = true;
    document.head.appendChild(script);
    
    return new Promise(resolve => {
      script.onload = () => {
        resolve(window.paypal);
      };
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
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Créer un élément de carte Stripe
    const elements = payment.stripe.elements();
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
    
    // Monter l'élément de carte dans le DOM
    const cardElement = document.getElementById('stripe-card-element');
    if (cardElement) {
      card.mount('#stripe-card-element');
    }
    
    return {
      elements,
      card,
      clientSecret: 'demo_secret_' + Date.now(),
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
    const result = await payment.stripe.confirmCardPayment(sessionData.clientSecret, {
      payment_method: {
        card: sessionData.card,
        billing_details: {
          name: cardholderName
        }
      }
    });
    
    // Pour la démo, nous simulons toujours un paiement réussi
    // En production, vous devriez vérifier result.error
    
    return {
      success: true,
      paymentId: 'pi_' + Date.now(),
      paymentMethod: 'stripe'
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
    
    return paypal.Buttons({
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
            paymentId: details.id,
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