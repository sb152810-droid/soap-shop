// Admin Panel JavaScript
let currentUser = null;
let adminData = {
  admins: [],
  products: [],
  promos: [],
  orders: [],
  contacts: {}
};

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  await loadAdminData();
  setupEventListeners();
  checkAuthStatus();
});

// Check authentication status
function checkAuthStatus() {
  const auth = localStorage.getItem('adminAuth');
  if (auth) {
    currentUser = JSON.parse(auth);
    showAdminPanel();
    loadDashboard();
  } else {
    showLoginForm();
  }
}

// Setup Event Listeners
function setupEventListeners() {
  // Login Form
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }

  // Register Form
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', handleRegister);
  }

  // Product Form
  const productForm = document.getElementById('productForm');
  if (productForm) {
    productForm.addEventListener('submit', handleAddProduct);
  }

  // Promo Form
  const promoForm = document.getElementById('promoForm');
  if (promoForm) {
    promoForm.addEventListener('submit', handleAddPromo);
  }

  // Telegram Form
  const telegramForm = document.getElementById('telegramForm');
  if (telegramForm) {
    telegramForm.addEventListener('submit', handleSaveTelegram);
  }

  // Contacts Form
  const contactsForm = document.getElementById('contactsForm');
  if (contactsForm) {
    contactsForm.addEventListener('submit', handleSaveContacts);
  }
}

// Load Admin Data from LocalStorage
async function loadAdminData() {
  try {
    const savedData = localStorage.getItem('soapShopAdminData');
    if (savedData) {
      adminData = JSON.parse(savedData);
    } else {
      // Initialize with default data
      adminData = {
        admins: [],
        products: {
          shapes: [],
          colors: [],
          scents: [],
          soaps: []
        },
        promos: [],
        orders: [],
        contacts: {
          phone: '0971891845',
          telegram: '@ann_not_found'
        },
        telegramChannel: {
          link: 'https://t.me/+LA2IV4k5ySVmZWly',
          description: 'Канал з акціями, промокодами та новинами'
        }
      };
      saveAdminData();
    }
  } catch (error) {
    console.error('Error loading data:', error);
  }
}

// Save Admin Data to LocalStorage
function saveAdminData() {
  localStorage.setItem('soapShopAdminData', JSON.stringify(adminData));
  // Sync with main website
  syncDataWithWebsite();
}

// Sync data with main website
function syncDataWithWebsite() {
  localStorage.setItem('soapShopData', JSON.stringify({
    shapes: adminData.products.shapes || [],
    colors: adminData.products.colors || [],
    scents: adminData.products.scents || [],
    soaps: adminData.products.soaps || [],
    promos: adminData.promos || [],
    contacts: adminData.contacts || {},
    telegramChannel: adminData.telegramChannel || {}
  }));
}

// ===== AUTHENTICATION =====

// Handle Login
async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  // Check if admin exists
  const admin = adminData.admins.find(a => a.email === email && a.password === password);

  if (admin) {
    currentUser = { name: admin.name, email: admin.email, id: admin.id };
    localStorage.setItem('adminAuth', JSON.stringify(currentUser));
    document.getElementById('loginForm').reset();
    showAdminPanel();
    loadDashboard();
  } else {
    alert('Неправильний email або пароль');
  }
}

// Handle Register
async function handleRegister(e) {
  e.preventDefault();
  const name = document.getElementById('regName').value;
  const email = document.getElementById('regEmail').value;
  const password = document.getElementById('regPassword').value;
  const passwordConfirm = document.getElementById('regPasswordConfirm').value;

  if (password !== passwordConfirm) {
    alert('Паролі не збігаються');
    return;
  }

  if (password.length < 6) {
    alert('Пароль повинен бути не менше 6 символів');
    return;
  }

  // Check if email already exists
  if (adminData.admins.some(a => a.email === email)) {
    alert('Цей email вже зареєстрований');
    return;
  }

  // Create new admin
  const newAdmin = {
    id: Date.now(),
    name,
    email,
    password,
    createdAt: new Date().toISOString()
  };

  adminData.admins.push(newAdmin);
  saveAdminData();

  alert('Адміністратор успішно зареєстрований! Тепер увійдіть.');
  toggleRegister();
  document.getElementById('registerForm').reset();
}

// Toggle Register Form
function toggleRegister() {
  const loginBox = document.getElementById('loginBox');
  const registerBox = document.getElementById('registerBox');
  loginBox.classList.toggle('hidden');
  registerBox.classList.toggle('hidden');
}

// Logout
function logout() {
  if (confirm('Ви впевнені, що хочете вийти?')) {
    currentUser = null;
    localStorage.removeItem('adminAuth');
    showLoginForm();
    document.getElementById('loginForm').reset();
    document.getElementById('registerForm').reset();
  }
}

// ===== UI FUNCTIONS =====

function showLoginForm() {
  document.getElementById('loginContainer').classList.remove('hidden');
  document.getElementById('adminPanel').classList.add('hidden');
}

function showAdminPanel() {
  document.getElementById('loginContainer').classList.add('hidden');
  document.getElementById('adminPanel').classList.remove('hidden');
  document.getElementById('userInfo').textContent = `👤 ${currentUser.name} (${currentUser.email})`;
}

// Show Tab
function showTab(tabName) {
  // Hide all tabs
  const tabs = document.querySelectorAll('.tab-content');
  tabs.forEach(tab => tab.classList.remove('active'));

  // Remove active class from all nav items
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => item.classList.remove('active'));

  // Show selected tab
  const selectedTab = document.getElementById(tabName);
  if (selectedTab) {
    selectedTab.classList.add('active');
  }

  // Add active class to clicked nav item
  const clickedNav = document.querySelector(`[data-tab="${tabName}"]`);
  if (clickedNav) {
    clickedNav.classList.add('active');
  }

  // Load tab content
  if (tabName === 'products') {
    renderProducts();
  } else if (tabName === 'promos') {
    renderPromos();
  } else if (tabName === 'orders') {
    renderOrders();
  } else if (tabName === 'telegram') {
    loadTelegramSettings();
  } else if (tabName === 'settings') {
    loadSettings();
  }
}

// ===== DASHBOARD =====

function loadDashboard() {
  document.getElementById('totalProducts').textContent = 
    (adminData.products.shapes?.length || 0) + 
    (adminData.products.colors?.length || 0) + 
    (adminData.products.scents?.length || 0) + 
    (adminData.products.soaps?.length || 0);
  
  document.getElementById('totalPromos').textContent = adminData.promos?.length || 0;
  document.getElementById('totalOrders').textContent = adminData.orders?.length || 0;
  document.getElementById('totalAdmins').textContent = adminData.admins?.length || 0;
}

// ===== PRODUCTS MANAGEMENT =====

async function handleAddProduct(e) {
  e.preventDefault();

  const type = document.getElementById('productType').value;
  const name = document.getElementById('productName').value;
  const emoji = document.getElementById('productEmoji').value || '';
  const color = document.getElementById('productColor').value || '#FFD700';

  if (!type || !name) {
    alert('Будь ласка, заповніть всі обов\'язкові поля');
    return;
  }

  const newProduct = {
    id: Date.now(),
    name,
    emoji,
    value: color,
    createdAt: new Date().toISOString()
  };

  // Initialize product type array if it doesn't exist
  if (!adminData.products[type + 's']) {
    adminData.products[type + 's'] = [];
  }

  // Add to appropriate category
  switch(type) {
    case 'shape':
      adminData.products.shapes = adminData.products.shapes || [];
      adminData.products.shapes.push(newProduct);
      break;
    case 'color':
      adminData.products.colors = adminData.products.colors || [];
      adminData.products.colors.push(newProduct);
      break;
    case 'scent':
      adminData.products.scents = adminData.products.scents || [];
      adminData.products.scents.push(newProduct);
      break;
    case 'soap':
      adminData.products.soaps = adminData.products.soaps || [];
      adminData.products.soaps.push(newProduct);
      break;
  }

  saveAdminData();
  document.getElementById('productForm').reset();
  renderProducts();
  alert('Товар успішно додано!');
  loadDashboard();
}

function renderProducts() {
  const container = document.getElementById('productsList');
  let html = '';

  const allProducts = [
    ...(adminData.products.shapes || []).map(p => ({...p, type: 'Форма'})),
    ...(adminData.products.colors || []).map(p => ({...p, type: 'Колір'})),
    ...(adminData.products.scents || []).map(p => ({...p, type: 'Аромат'})),
    ...(adminData.products.soaps || []).map(p => ({...p, type: 'Тип мила'}))
  ];

  if (allProducts.length === 0) {
    container.innerHTML = '<p class="empty-message">Немає товарів</p>';
    return;
  }

  allProducts.forEach(product => {
    html += `
      <div class="product-item">
        <div class="product-info">
          <strong>${product.type}:</strong> ${product.emoji} ${product.name}
        </div>
        <div>
          <button class="btn-delete" onclick="deleteProduct('${product.type}', ${product.id})">🗑️ Видалити</button>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

function deleteProduct(type, id) {
  if (confirm('Ви впевнені, що хочете видалити цей товар?')) {
    const typeMap = {
      'Форма': 'shapes',
      'Колір': 'colors',
      'Аромат': 'scents',
      'Тип мила': 'soaps'
    };
    
    const key = typeMap[type];
    adminData.products[key] = adminData.products[key].filter(p => p.id !== id);
    saveAdminData();
    renderProducts();
    loadDashboard();
    alert('Товар видалено!');
  }
}

// ===== PROMO CODES =====

async function handleAddPromo(e) {
  e.preventDefault();

  const code = document.getElementById('promoCode').value.toUpperCase();
  const discount = parseInt(document.getElementById('promoDiscount').value);
  const expiryDate = document.getElementById('promoExpiryDate').value;
  const usageLimit = document.getElementById('promoUsageLimit').value;
  const description = document.getElementById('promoDescription').value;

  if (!code || !discount) {
    alert('Будь ласка, заповніть обов\'язкові поля');
    return;
  }

  if (adminData.promos.some(p => p.code === code)) {
    alert('Промокод з таким кодом вже існує');
    return;
  }

  const newPromo = {
    id: Date.now(),
    code,
    discount,
    expiryDate,
    usageLimit: usageLimit ? parseInt(usageLimit) : null,
    timesUsed: 0,
    description,
    createdAt: new Date().toISOString(),
    active: true
  };

  adminData.promos.push(newPromo);
  saveAdminData();
  document.getElementById('promoForm').reset();
  renderPromos();
  alert('Промокод успішно створено!');
  loadDashboard();
}

function renderPromos() {
  const container = document.getElementById('promosList');
  
  if (!adminData.promos || adminData.promos.length === 0) {
    container.innerHTML = '<p class="empty-message">Немає промокодів</p>';
    return;
  }

  let html = '';
  adminData.promos.forEach(promo => {
    const isExpired = promo.expiryDate && new Date(promo.expiryDate) < new Date();
    const status = isExpired ? '❌ Закінчився' : '✅ Активний';
    
    html += `
      <div class="promo-item">
        <div class="promo-info">
          <strong>${promo.code}</strong> - ${promo.discount}% знижка <br>
          <small>${promo.description || ''}</small><br>
          <small>${status}</small>
          ${promo.usageLimit ? `<br><small>Використано: ${promo.timesUsed}/${promo.usageLimit}</small>` : ''}
        </div>
        <button class="btn-delete" onclick="deletePromo(${promo.id})">🗑️ Видалити</button>
      </div>
    `;
  });

  container.innerHTML = html;
}

function deletePromo(id) {
  if (confirm('Ви впевнені, що хочете видалити цей промокод?')) {
    adminData.promos = adminData.promos.filter(p => p.id !== id);
    saveAdminData();
    renderPromos();
    loadDashboard();
    alert('Промокод видалено!');
  }
}

// ===== ORDERS =====

function renderOrders() {
  const container = document.getElementById('ordersList');
  
  if (!adminData.orders || adminData.orders.length === 0) {
    container.innerHTML = '<p class="empty-message">Немає замовлень</p>';
    return;
  }

  let html = '';
  adminData.orders.forEach(order => {
    html += `
      <div class="order-item">
        <h4>Замовлення #${order.id}</h4>
        <div class="order-details">
          <strong>Клієнт:</strong> ${order.name}<br>
          <strong>Телефон:</strong> ${order.phone}<br>
          <strong>Telegram:</strong> ${order.telegramUsername || 'не вказано'}<br>
          <strong>Форма:</strong> ${order.shape}<br>
          <strong>Колір:</strong> ${order.color || 'не вказано'}<br>
          <strong>Аромат:</strong> ${order.scent}<br>
          <strong>Інгредієнт:</strong> ${order.ingredient}<br>
          <strong>Дата:</strong> ${new Date(order.createdAt).toLocaleString('uk-UA')}<br>
          ${order.notes ? `<strong>Побажання:</strong> ${order.notes}<br>` : ''}
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

// ===== TELEGRAM =====

function loadTelegramSettings() {
  const telegram = adminData.telegramChannel || {};
  document.getElementById('telegramLink').value = telegram.link || 'https://t.me/+LA2IV4k5ySVmZWly';
  document.getElementById('telegramDescription').value = telegram.description || 'Канал з акціями, промокодами та новинами';
  updateTelegramPreview();
}

async function handleSaveTelegram(e) {
  e.preventDefault();

  const link = document.getElementById('telegramLink').value;
  const description = document.getElementById('telegramDescription').value;

  adminData.telegramChannel = {
    link,
    description
  };

  saveAdminData();
  updateTelegramPreview();
  alert('Telegram канал успішно оновлено!');
}

function updateTelegramPreview() {
  const telegram = adminData.telegramChannel || {};
  document.getElementById('previewLink').textContent = telegram.link || 'https://t.me/+LA2IV4k5ySVmZWly';
  document.getElementById('previewDesc').textContent = telegram.description || 'Канал з акціями, промокодами та новинами';
  
  // Update link href
  const link = document.querySelector('.telegram-preview a');
  if (link) {
    link.href = telegram.link || 'https://t.me/+LA2IV4k5ySVmZWly';
  }
}

// ===== SETTINGS =====

function loadSettings() {
  document.getElementById('contactPhone').value = adminData.contacts?.phone || '0971891845';
  document.getElementById('contactTelegram').value = adminData.contacts?.telegram || '@ann_not_found';
  renderAdmins();
}

async function handleSaveContacts(e) {
  e.preventDefault();

  adminData.contacts = {
    phone: document.getElementById('contactPhone').value,
    telegram: document.getElementById('contactTelegram').value
  };

  saveAdminData();
  alert('Контактна інформація збережена!');
}

function renderAdmins() {
  const container = document.getElementById('adminsList');

  if (!adminData.admins || adminData.admins.length === 0) {
    container.innerHTML = '<p class="empty-message">Немає адміністраторів</p>';
    return;
  }

  let html = '';
  adminData.admins.forEach(admin => {
    html += `
      <div class="admin-item">
        <div class="admin-info">
          <strong>${admin.name}</strong><br>
          <small>${admin.email}</small><br>
          <small>Зареєстрований: ${new Date(admin.createdAt).toLocaleString('uk-UA')}</small>
        </div>
        ${currentUser.email !== admin.email ? `
          <button class="btn-delete" onclick="deleteAdmin(${admin.id})">🗑️ Видалити</button>
        ` : ''}
      </div>
    `;
  });

  container.innerHTML = html;
}

function deleteAdmin(id) {
  if (confirm('Ви впевнені, що хочете видалити цього адміністратора?')) {
    adminData.admins = adminData.admins.filter(a => a.id !== id);
    saveAdminData();
    renderAdmins();
    loadDashboard();
    alert('Адміністратор видалено!');
  }
}

// Export data for backup
function exportData() {
  const dataStr = JSON.stringify(adminData, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `soap-shop-backup-${new Date().toISOString()}.json`;
  link.click();
}

// Receive orders from main website
window.addEventListener('storage', (e) => {
  if (e.key === 'newSoapOrder') {
    const order = JSON.parse(e.newValue);
    if (!adminData.orders) {
      adminData.orders = [];
    }
    adminData.orders.push({
      id: Date.now(),
      ...order,
      createdAt: new Date().toISOString()
    });
    saveAdminData();
    alert(`Нове замовлення від ${order.name}!`);
  }
});
