let credentials = { email: '', password: '' };
let currentTab = 'orders';

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('loginForm').addEventListener('submit', handleLogin);
  const savedCredentials = localStorage.getItem('adminCredentials');
  if (savedCredentials) {
    const creds = JSON.parse(savedCredentials);
    credentials = creds;
    showAdmin();
    loadAllData();
  }
});

async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  
  try {
    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    if (!response.ok) {
      throw new Error('Невірні облікові дані');
    }
    
    credentials = { email, password };
    localStorage.setItem('adminCredentials', JSON.stringify(credentials));
    
    showAdmin();
    loadAllData();
  } catch (error) {
    document.getElementById('loginError').textContent = error.message;
  }
}

function logout() {
  localStorage.removeItem('adminCredentials');
  credentials = {};
  document.getElementById('loginSection').style.display = 'flex';
  document.getElementById('adminSection').style.display = 'none';
  document.getElementById('loginForm').reset();
}

function showAdmin() {
  document.getElementById('loginSection').style.display = 'none';
  document.getElementById('adminSection').style.display = 'block';
}

function switchTab(tab) {
  currentTab = tab;
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  
  document.getElementById(tab + 'Tab').classList.add('active');
  event.target.classList.add('active');
  
  loadTabData(tab);
}

async function loadAllData() {
  loadTabData('orders');
}

async function loadTabData(tab) {
  if (tab === 'orders') loadOrders();
  else if (tab === 'scents') loadScents();
  else if (tab === 'colors') loadColors();
  else if (tab === 'soaps') loadSoaps();
  else if (tab === 'contacts') loadContacts();
}

async function loadOrders() {
  try {
    const response = await fetch(`/api/admin/orders?email=${credentials.email}&password=${credentials.password}`);
    const orders = await response.json();
    
    const container = document.getElementById('ordersContainer');
    if (orders.length === 0) {
      container.innerHTML = '<p class="no-data">Замовлень немає</p>';
      return;
    }
    
    let html = '<table class="orders-table"><thead><tr><th>ID</th><th>Ім\'я</th><th>Форма</th><th>Аромат</th><th>Інгредієнт</th><th>Дата</th><th>Дії</th></tr></thead><tbody>';
    
    orders.forEach(order => {
      const date = new Date(order.createdAt).toLocaleDateString('uk-UA');
      html += `<tr><td>${order.id}</td><td>${order.name}</td><td>${order.shape}</td><td>${order.scent}</td><td>${order.ingredient}</td><td>${date}</td><td><button onclick="deleteOrder(${order.id})" class="btn-delete">🗑️</button></td></tr>`;
    });
    
    html += '</tbody></table>';
    container.innerHTML = html;
  } catch (error) {
    alert('Помилка: ' + error.message);
  }
}

async function deleteOrder(id) {
  if (!confirm('Ви впевнені?')) return;
  
  try {
    const response = await fetch(`/api/admin/orders/${id}?email=${credentials.email}&password=${credentials.password}`, { method: 'DELETE' });
    if (response.ok) loadOrders();
  } catch (error) {
    alert('Помилка: ' + error.message);
  }
}

async function loadScents() {
  try {
    const response = await fetch('/api/data');
    const data = await response.json();
    
    const container = document.getElementById('scentsList');
    let html = '';
    
    data.scents.forEach(scent => {
      html += `<div class="item-card"><div class="item-info"><span class="item-emoji">${scent.emoji}</span><span class="item-name">${scent.name}</span></div><button onclick="deleteScent(${scent.id})" class="btn-delete">🗑️</button></div>`;
    });
    
    container.innerHTML = html || '<p class="no-data">Немає ароматів</p>';
  } catch (error) {
    alert('Помилка: ' + error.message);
  }
}

async function addScent() {
  const name = document.getElementById('scentName').value.trim();
  const emoji = document.getElementById('scentEmoji').value.trim();
  
  if (!name) {
    alert('Введіть назву аромату');
    return;
  }
  
  try {
    const response = await fetch('/api/admin/scents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: credentials.email, password: credentials.password, name, emoji })
    });
    
    if (response.ok) {
      document.getElementById('scentName').value = '';
      document.getElementById('scentEmoji').value = '🌸';
      loadScents();
    }
  } catch (error) {
    alert('Помилка: ' + error.message);
  }
}

async function deleteScent(id) {
  if (!confirm('Ви впевнені?')) return;
  
  try {
    const response = await fetch(`/api/admin/scents/${id}?email=${credentials.email}&password=${credentials.password}`, { method: 'DELETE' });
    if (response.ok) loadScents();
  } catch (error) {
    alert('Помилка: ' + error.message);
  }
}

async function loadColors() {
  try {
    const response = await fetch('/api/data');
    const data = await response.json();
    
    const container = document.getElementById('colorsList');
    let html = '';
    
    data.colors.forEach(color => {
      html += `<div class="item-card"><div class="item-info"><div class="color-preview" style="background-color: ${color.value};"></div><span class="item-name">${color.name}</span></div><button onclick="deleteColor(${color.id})" class="btn-delete">🗑️</button></div>`;
    });
    
    container.innerHTML = html || '<p class="no-data">Немає кольорів</p>';
  } catch (error) {
    alert('Помилка: ' + error.message);
  }
}

async function addColor() {
  const name = document.getElementById('colorName').value.trim();
  const value = document.getElementById('colorValue').value;
  
  if (!name) {
    alert('Введіть назву кольору');
    return;
  }
  
  try {
    const response = await fetch('/api/admin/colors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: credentials.email, password: credentials.password, name, value })
    });
    
    if (response.ok) {
      document.getElementById('colorName').value = '';
      document.getElementById('colorValue').value = '#90EE90';
      loadColors();
    }
  } catch (error) {
    alert('Помилка: ' + error.message);
  }
}

async function deleteColor(id) {
  if (!confirm('Ви впевнені?')) return;
  
  try {
    const response = await fetch(`/api/admin/colors/${id}?email=${credentials.email}&password=${credentials.password}`, { method: 'DELETE' });
    if (response.ok) loadColors();
  } catch (error) {
    alert('Помилка: ' + error.message);
  }
}

async function loadSoaps() {
  try {
    const response = await fetch('/api/data');
    const data = await response.json();
    
    const container = document.getElementById('soapsList');
    let html = '';
    
    data.soaps.forEach(soap => {
      html += `<div class="item-card"><div class="item-info"><span class="item-emoji">${soap.emoji}</span><span class="item-name">${soap.name}</span></div><button onclick="deleteSoap(${soap.id})" class="btn-delete">🗑️</button></div>`;
    });
    
    container.innerHTML = html || '<p class="no-data">Немає типів мила</p>';
  } catch (error) {
    alert('Помилка: ' + error.message);
  }
}

async function addSoap() {
  const name = document.getElementById('soapName').value.trim();
  const emoji = document.getElementById('soapEmoji').value.trim();
  
  if (!name) {
    alert('Введіть назву мила');
    return;
  }
  
  try {
    const response = await fetch('/api/admin/soaps', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: credentials.email, password: credentials.password, name, emoji })
    });
    
    if (response.ok) {
      document.getElementById('soapName').value = '';
      document.getElementById('soapEmoji').value = '🧼';
      loadSoaps();
    }
  } catch (error) {
    alert('Помилка: ' + error.message);
  }
}

async function deleteSoap(id) {
  if (!confirm('Ви впевнені?')) return;
  
  try {
    const response = await fetch(`/api/admin/soaps/${id}?email=${credentials.email}&password=${credentials.password}`, { method: 'DELETE' });
    if (response.ok) loadSoaps();
  } catch (error) {
    alert('Помилка: ' + error.message);
  }
}

async function loadContacts() {
  try {
    const response = await fetch('/api/data');
    const data = await response.json();
    
    const container = document.getElementById('contactsList');
    let html = '';
    
    data.contacts.forEach(contact => {
      const typeEmoji = { phone: '☎️', email: '📧', telegram: '💬', other: '🔗' };
      html += `<div class="item-card"><div class="item-info"><span class="item-emoji">${typeEmoji[contact.type] || '🔗'}</span><div class="contact-details"><span class="item-name">${contact.label}</span><span class="contact-value">${contact.value}</span></div></div><button onclick="deleteContact(${contact.id})" class="btn-delete">🗑️</button></div>`;
    });
    
    container.innerHTML = html || '<p class="no-data">Немає контактів</p>';
  } catch (error) {
    alert('Помилка: ' + error.message);
  }
}

async function addContact() {
  const type = document.getElementById('contactType').value;
  const label = document.getElementById('contactLabel').value.trim();
  const value = document.getElementById('contactValue').value.trim();
  
  if (!label || !value) {
    alert('Заповніть всі поля');
    return;
  }
  
  try {
    const response = await fetch('/api/admin/contacts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: credentials.email, password: credentials.password, type, label, value })
    });
    
    if (response.ok) {
      document.getElementById('contactLabel').value = '';
      document.getElementById('contactValue').value = '';
      loadContacts();
    }
  } catch (error) {
    alert('Помилка: ' + error.message);
  }
}

async function deleteContact(id) {
  if (!confirm('Ви впевнені?')) return;
  
  try {
    const response = await fetch(`/api/admin/contacts/${id}?email=${credentials.email}&password=${credentials.password}`, { method: 'DELETE' });
    if (response.ok) loadContacts();
  } catch (error) {
    alert('Помилка: ' + error.message);
  }
}
