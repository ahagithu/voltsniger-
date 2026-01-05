// Gestionnaire de stock manuel
// Créez un fichier JSON séparé pour gérer les stocks

/*
Fichier: stock-manager.json (à créer manuellement)

{
  "override": true,
  "stocks": [
    { "id": "esp32", "quantity": 15 },
    { "id": "arduino-nano", "quantity": 25 },
    { "id": "nrf24l01", "quantity": 18 },
    { "id": "l298n", "quantity": 12 },
    { "id": "dht22", "quantity": 30 },
    { "id": "relais-5v", "quantity": 40 }
  ]
}

Pour ajuster les stocks:
1. Modifiez les quantités dans stock-manager.json
2. L'application utilisera ces valeurs au lieu de celles dans produits.json
3. Pour désactiver, mettez "override": false
*/

// Interface web simple pour gérer les stocks
function createStockManagerUI() {
  if (!document.querySelector('.admin-panel')) return;
  
  const adminPanel = document.querySelector('.admin-panel');
  adminPanel.innerHTML = `
    <h2>Gestionnaire de Stock</h2>
    <div id="stock-manager">
      <table>
        <thead>
          <tr>
            <th>Produit</th>
            <th>Stock actuel</th>
            <th>Nouveau stock</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody id="stock-items">
          <!-- Rempli dynamiquement -->
        </tbody>
      </table>
      <button onclick="saveStockChanges()" class="btn btn-primary">
        <i class="fas fa-save"></i> Enregistrer les modifications
      </button>
    </div>
  `;
  
  displayStockManager();
}

async function displayStockManager() {
  try {
    const response = await fetch('produits.json');
    const data = await response.json();
    const products = data.produits;
    
    const container = document.getElementById('stock-items');
    container.innerHTML = products.map(product => `
      <tr>
        <td>${product.nom}</td>
        <td>${product.stock}</td>
        <td>
          <input type="number" id="stock-${product.id}" 
                 value="${product.stock}" min="0" style="width: 80px;">
        </td>
        <td>
          <button onclick="updateProductStock('${product.id}')" class="btn btn-sm">
            <i class="fas fa-sync"></i> Mettre à jour
          </button>
        </td>
      </tr>
    `).join('');
  } catch (error) {
    console.error('Erreur chargement produits:', error);
  }
}

function updateProductStock(productId) {
  const input = document.getElementById(`stock-${productId}`);
  const newStock = parseInt(input.value);
  
  if (isNaN(newStock) || newStock < 0) {
    alert('Veuillez entrer une valeur valide');
    return;
  }
  
  // Ici, vous pourriez envoyer cette mise à jour à un serveur
  // Pour l'instant, on l'affiche juste
  alert(`Stock de ${productId} mis à jour: ${newStock}`);
  
  // Dans une version complète, on enverrait cette donnée au serveur
  // ou on mettrait à jour le fichier JSON localement
}

function saveStockChanges() {
  // Collecter toutes les valeurs
  const stockChanges = {};
  document.querySelectorAll('input[id^="stock-"]').forEach(input => {
    const productId = input.id.replace('stock-', '');
    stockChanges[productId] = parseInt(input.value);
  });
  
  // Ici, normalement vous enverriez ces données au serveur
  // Pour cette démo, on les sauvegarde dans localStorage
  localStorage.setItem('stockChanges', JSON.stringify(stockChanges));
  
  alert('Modifications enregistrées localement. Rechargez la page pour voir les effets.');
}
