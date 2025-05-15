// Module d'administration
const admin = (function() {
  // URL de l'API
  const API_URL = '/api';
  
  // Fonction pour charger les commandes dans le tableau d'administration
  async function loadOrders() {
    const ordersContainer = document.getElementById('admin-orders-container');
    if (!ordersContainer) return;
    
    try {
      // Récupérer le token d'authentification
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Vous devez être connecté pour accéder à cette page');
      }
      
      // Afficher un loader pendant le chargement
      ordersContainer.innerHTML = '<tr><td colspan="6" class="text-center py-4"><div class="loader mx-auto"></div></td></tr>';
      
      // Récupérer les commandes depuis l'API
      const response = await fetch(`${API_URL}/orders/admin`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des commandes');
      }
      
      const orders = await response.json();
      
      // Vider le conteneur
      ordersContainer.innerHTML = '';
      
      // Afficher un message si aucune commande n'est trouvée
      if (orders.length === 0) {
        ordersContainer.innerHTML = '<tr><td colspan="6" class="text-center py-8">Aucune commande trouvée</td></tr>';
        return;
      }
      
      // Afficher les commandes
      orders.forEach(order => {
        const row = document.createElement('tr');
        row.className = 'hover:bg-gray-50';
        
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
        switch(order.status) {
          case 'pending':
            statusClass = 'bg-yellow-100 text-yellow-800';
            break;
          case 'processing':
            statusClass = 'bg-blue-100 text-blue-800';
            break;
          case 'completed':
            statusClass = 'bg-green-100 text-green-800';
            break;
          case 'cancelled':
            statusClass = 'bg-red-100 text-red-800';
            break;
          default:
            statusClass = 'bg-gray-100 text-gray-800';
        }
        
        // Traduire le statut
        let statusText = '';
        switch(order.status) {
          case 'pending':
            statusText = 'En attente';
            break;
          case 'processing':
            statusText = 'En cours';
            break;
          case 'completed':
            statusText = 'Terminée';
            break;
          case 'cancelled':
            statusText = 'Annulée';
            break;
          default:
            statusText = order.status;
        }
        
        row.innerHTML = `
          <td class="px-4 py-3">#${order._id.substring(order._id.length - 8)}</td>
          <td class="px-4 py-3">${order.user ? order.user.name : 'Utilisateur inconnu'}</td>
          <td class="px-4 py-3">${formattedDate}</td>
          <td class="px-4 py-3">${order.totalPrice.toFixed(2)} €</td>
          <td class="px-4 py-3">
            <span class="px-2 py-1 rounded-full text-xs font-medium ${statusClass}">
              ${statusText}
            </span>
          </td>
          <td class="px-4 py-3">
            <div class="flex space-x-2">
              <button class="text-blue-600 hover:text-blue-800 view-order" data-id="${order._id}">
                <i class="fas fa-eye"></i>
              </button>
              <button class="text-green-600 hover:text-green-800 update-status" data-id="${order._id}" data-status="${order.status}">
                <i class="fas fa-edit"></i>
              </button>
            </div>
          </td>
        `;
        
        ordersContainer.appendChild(row);
        
        // Ajouter les événements aux boutons
        const viewButton = row.querySelector('.view-order');
        viewButton.addEventListener('click', () => {
          window.location.href = `order-details.html?id=${order._id}`;
        });
        
        const updateButton = row.querySelector('.update-status');
        updateButton.addEventListener('click', () => {
          showUpdateStatusModal(order);
        });
      });
    } catch (error) {
      console.error('Erreur lors du chargement des commandes:', error);
      ordersContainer.innerHTML = `
        <tr>
          <td colspan="6" class="text-center py-8 text-red-500">
            Erreur lors du chargement des commandes: ${error.message}
          </td>
        </tr>
      `;
    }
  }
  
  // Fonction pour afficher la modal de mise à jour du statut
  function showUpdateStatusModal(order) {
    // Créer la modal si elle n'existe pas
    let modal = document.getElementById('update-status-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'update-status-modal';
      modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden';
      modal.innerHTML = `
        <div class="bg-white rounded-lg p-6 w-full max-w-md">
          <h2 class="text-2xl font-bold mb-4">Mettre à jour le statut</h2>
          <form id="update-status-form">
            <input type="hidden" id="order-id">
            <div class="mb-4">
              <label for="status" class="form-label">Statut</label>
              <select id="status" class="form-input">
                <option value="pending">En attente</option>
                <option value="processing">En cours</option>
                <option value="completed">Terminée</option>
                <option value="cancelled">Annulée</option>
              </select>
            </div>
            <div class="flex justify-end space-x-2">
              <button type="button" id="cancel-update" class="btn-secondary">Annuler</button>
              <button type="submit" class="btn-primary">Mettre à jour</button>
            </div>
          </form>
        </div>
      `;
      document.body.appendChild(modal);
      
      // Ajouter les événements
      document.getElementById('cancel-update').addEventListener('click', () => {
        modal.classList.add('hidden');
      });
      
      document.getElementById('update-status-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const orderId = document.getElementById('order-id').value;
        const status = document.getElementById('status').value;
        
        try {
          // Récupérer le token d'authentification
          const token = localStorage.getItem('token');
          if (!token) {
            throw new Error('Vous devez être connecté pour effectuer cette action');
          }
          
          // Mettre à jour le statut via l'API
          const response = await fetch(`${API_URL}/orders/${orderId}/status`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status })
          });
          
          if (!response.ok) {
            throw new Error('Erreur lors de la mise à jour du statut');
          }
          
          // Fermer la modal
          modal.classList.add('hidden');
          
          // Afficher un message de succès
          app.showAlert('Statut mis à jour avec succès', 'success');
          
          // Recharger les commandes
          loadOrders();
        } catch (error) {
          console.error('Erreur lors de la mise à jour du statut:', error);
          app.showAlert(`Erreur: ${error.message}`, 'error');
        }
      });
    }
    
    // Mettre à jour les valeurs
    document.getElementById('order-id').value = order._id;
    document.getElementById('status').value = order.status;
    
    // Afficher la modal
    modal.classList.remove('hidden');
  }
  
  // Exposer les fonctions publiques
  return {
    loadOrders
  };
})();