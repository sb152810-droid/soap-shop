let currentStep = 1;
const totalSteps = 5;
let formData = {};
let allData = {};
let appliedPromo = null;

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  await loadData();
  document.getElementById('orderForm').addEventListener('submit', submitOrder);
  updateFormListeners();
});

// Load data from server or localStorage
async function loadData() {
  try {
    // Try to load from API first
    const response = await fetch('/api/data');
    allData = await response.json();
  } catch (error) {
    // Fallback to localStorage
    console.log('Loading from localStorage...');
    const savedData = localStorage.getItem('soapShopData');
    if (savedData) {
      allData = JSON.parse(savedData);
    } else {
      // Default data
      allData = {
        shapes: [
          { id: 1, name: 'rectangle', emoji: '▭' },
          { id: 2, name: 'heart-tulips', emoji: '💜' },
          { id: 3, name: 'heart-gerberas', emoji: '💛' }
        ],
        colors: [
          { id: 1, name: 'Рожевий', value: '#FF69B4' },
          { id: 2, name: 'Зелений', value: '#90EE90' },
          { id: 3, name: 'Фіолетовий', value: '#DDA0DD' },
          { id: 4, name: 'Блакитний', value: '#87CEEB' }
        ],
        scents: [
          { id: 1, name: 'Троянда', emoji: '🌹' },
          { id: 2, name: 'Лаванда', emoji: '💜' },
          { id: 3, name: 'Ваніль', emoji: '🍦' },
          { id: 4, name: 'Лимон', emoji: '🍋' }
        ],
        soaps: [
          { id: 1, name: 'Чай з медом', emoji: '🍯' },
          { id: 2, name: 'Молоко та мед', emoji: '🥛' },
          { id: 3, name: 'Оливкова олія', emoji: '🫒' },
          { id: 4, name: 'Кокос', emoji: '🥥' }
        ],
        contacts: {
          phone: '0971891845',
          telegram: '@ann_not_found'
        },
        telegramChannel: {
          link: 'https://t.me/+LA2IV4k5ySVmZWly',
          description: 'Канал з акціями, промокодами та новинами'
        },
        promos: []
      };
    }
  }

  renderShapes();
  renderColors();
  renderScents();
  renderSoaps();
  updateContacts();
  addPromoCodeSection();
  displayTelegramLink();
}

// Add Promo Code Section to HTML
function addPromoCodeSection() {
  const orderForm = document.getElementById('orderForm');
  let promoSection = document.getElementById('promoCodeSection');
  
  if (!promoSection) {
    promoSection = document.createElement('div');
    promoSection.id = 'promoCodeSection';
    promoSection.className = 'promo-section';
    promoSection.style.cssText = `
      background: #FFE4F0;
      padding: 15px;
      border-radius: 12px;
      margin: 20px 0;
      border: 2px solid #FF69B4;
    `;
    promoSection.innerHTML = `
      <h4 style="color: #FF69B4; margin-bottom: 10px;">🎟️ Промокод (опціонально)</h4>
      <div style="display: flex; gap: 10px;">
        <input 
          type="text" 
          id="promoInput" 
          placeholder="Введіть промокод" 
          style="flex: 1; padding: 10px; border: 2px solid #FF69B4; border-radius: 6px;"
        >
        <button 
          type="button" 
          onclick="applyPromo()" 
          style="
            background: #FF69B4; 
            color: white; 
            border: none; 
            padding: 10px 20px; 
            border-radius: 6px; 
            cursor: pointer;
            font-weight: 600;
          "
        >Застосувати</button>
      </div>
      <div id="promoStatus" style="margin-top: 10px; font-size: 0.9em;"></div>
    `;
    orderForm.insertBefore(promoSection, document.getElementById('step1'));
  }
}

// Display Telegram Link
function displayTelegramLink() {
  let telegramLink = document.getElementById('telegramLinkSection');
  
  if (!telegramLink) {
    telegramLink = document.createElement('div');
    telegramLink.id = 'telegramLinkSection';
    telegramLink.className = 'telegram-section';
    telegramLink.style.cssText = `
      background: linear-gradient(135deg, #FF69B4, #90EE90);
      padding: 20px;
      border-radius: 12px;
      margin: 20px 0;
      text-align: center;
      color: white;
    `;
    
    const link = allData.telegramChannel?.link || 'https://t.me/+LA2IV4k5ySVmZWly';
    const desc = allData.telegramChannel?.description || 'Канал з акціями, промокодами та новинами';
    
    telegramLink.innerHTML = `
      <h3 style="margin-bottom: 10px;">📢 ${desc}</h3>
      <p style="margin-bottom: 15px; opacity: 0.9;">Підпишіться на наш Telegram канал для отримання актуальних акцій та промокодів!</p>
      <a href="${link}" target="_blank" style="
        background: white;
        color: #FF69B4;
        padding: 12px 24px;
        border-radius: 20px;
        text-decoration: none;
        font-weight: 600;
        display: inline-block;
        transition: all 0.3s ease;
      " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
        📲 Перейти на канал ${link}
      </a>
    `;
    
    const main = document.querySelector('.main');
    if (main) {
      main.parentElement.insertBefore(telegramLink, main);
    }
  }
}

// Apply Promo Code
function applyPromo() {
  const promoCode = document.getElementById('promoInput').value.toUpperCase();
  const statusDiv = document.getElementById('promoStatus');

  if (!promoCode) {
    statusDiv.innerHTML = '<span style="color: #FF6B6B;">❌ Введіть промокод</span>';
    return;
  }

  // Get promos from localStorage or allData
  const adminData = localStorage.getItem('soapShopAdminData');
  let promos = [];
  
  if (adminData) {
    try {
      const data = JSON.parse(adminData);
      promos = data.promos || [];
    } catch (e) {
      console.error('Error parsing admin data:', e);
    }
  }

  const promo = promos.find(p => p.code === promoCode && p.active);

  if (!promo) {
    statusDiv.innerHTML = '<span style="color: #FF6B6B;">❌ Невірний промокод</span>';
    appliedPromo = null;
    return;
  }

  // Check expiry
  if (promo.expiryDate && new Date(promo.expiryDate) < new Date()) {
    statusDiv.innerHTML = '<span style="color: #FF6B6B;">❌ Промокод закінчився</span>';
    appliedPromo = null;
    return;
  }

  // Check usage limit
  if (promo.usageLimit && promo.timesUsed >= promo.usageLimit) {
    statusDiv.innerHTML = '<span style="color: #FF6B6B;">❌ Ліміт використань закінчився</span>';
    appliedPromo = null;
    return;
  }

  appliedPromo = promo;
  statusDiv.innerHTML = `<span style="color: #90EE90;">✅ Промокод застосовано! Знижка: ${promo.discount}%</span>`;
  updateSummary();
}

// Render shapes
function renderShapes() {
  const container = document.getElementById('shapesContainer');
  const shapes = allData.shapes || [
    { id: 1, name: 'rectangle', emoji: '▭' },
    { id: 2, name: 'heart-tulips', emoji: '💜' },
    { id: 3, name: 'heart-gerberas', emoji: '💛' }
  ];

  container.innerHTML = `
    <label class="shape-option">
      <input type="radio" name="shape" value="rectangle" required>
      <div class="shape-card">
        <div class="shape-preview rectangle"></div>
        <h4>Прямокутник</h4>
        <p>Класична форма з вибором кольорів</p>
      </div>
    </label>
    <label class="shape-option">
      <input type="radio" name="shape" value="heart-tulips" required>
      <div class="shape-card">
        <div class="shape-preview heart"></div>
        <h4>Серце з тюльпанами</h4>
        <p>Прекрасна форма серця</p>
      </div>
    </label>
    <label class="shape-option">
      <input type="radio" name="shape" value="heart-gerberas" required>
      <div class="shape-card">
        <div class="shape-preview heart"></div>
        <h4>Серце з герберами</h4>
        <p>Елегантна форма серця</p>
      </div>
    </label>
  `;
  
  const shapeInputs = document.querySelectorAll('input[name="shape"]');
  shapeInputs.forEach(input => {
    input.addEventListener('change', () => {
      formData.shape = input.value;
      const colorContainer = document.getElementById('colorContainer');
      if (input.value === 'rectangle') {
        colorContainer.style.display = 'grid';
        const colorInputs = document.querySelectorAll('input[name="color"]');
        if (!Array.from(colorInputs).some(el => el.checked)) {
          if (colorInputs.length > 0) {
            colorInputs[0].checked = true;
            formData.color = colorInputs[0].value;
          }
        }
      } else {
        colorContainer.style.display = 'none';
        const colorInputs = document.querySelectorAll('input[name="color"]');
        colorInputs.forEach(el => el.checked = false);
        delete formData.color;
      }
      updateSummary();
    });
  });
}

// Render colors
function renderColors() {
  const container = document.getElementById('colorContainer');
  const colors = allData.colors || [];
  let html = '';
  
  colors.forEach(color => {
    html += `
      <label class="color-option">
        <input type="radio" name="color" value="${color.name}">
        <div class="color-swatch" style="background-color: ${color.value};"></div>
        <span>${color.name}</span>
      </label>
    `;
  });
  
  container.innerHTML = html;
  
  const colorInputs = document.querySelectorAll('input[name="color"]');
  colorInputs.forEach(input => {
    input.addEventListener('change', () => {
      formData.color = input.value;
      updateSummary();
    });
  });
}

// Render scents
function renderScents() {
  const container = document.getElementById('scentsContainer');
  const scents = allData.scents || [];
  let html = '';
  
  scents.forEach(scent => {
    html += `
      <label class="scent-option">
        <input type="radio" name="scent" value="${scent.name}" required>
        <span>${scent.emoji} ${scent.name}</span>
      </label>
    `;
  });
  
  container.innerHTML = html;
  
  const scentInputs = document.querySelectorAll('input[name="scent"]');
  scentInputs.forEach(input => {
    input.addEventListener('change', () => {
      formData.scent = input.value;
      updateSummary();
    });
  });
}

// Render soaps
function renderSoaps() {
  const container = document.getElementById('soapsContainer');
  const soaps = allData.soaps || [];
  let html = '';
  
  soaps.forEach(soap => {
    html += `
      <label class="ingredient-option">
        <input type="radio" name="ingredient" value="${soap.name}" required>
        <span>${soap.emoji} ${soap.name}</span>
      </label>
    `;
  });
  
  container.innerHTML = html;
  
  const soapInputs = document.querySelectorAll('input[name="ingredient"]');
  soapInputs.forEach(input => {
    input.addEventListener('change', () => {
      formData.ingredient = input.value;
      updateSummary();
    });
  });
}

// Update contact info in success modal
function updateContacts() {
  const phone = allData.contacts?.phone || '0971891845';
  const telegram = allData.contacts?.telegram || '@ann_not_found';
  document.getElementById('contactPhone').textContent = phone;
  document.getElementById('contactTelegram').textContent = telegram;
}

// Update form listeners
function updateFormListeners() {
  const inputs = document.querySelectorAll('input[type="text"], textarea');
  inputs.forEach(input => {
    input.addEventListener('change', updateSummary);
    input.addEventListener('input', updateSummary);
  });
}

// Update summary with promo discount
function updateSummary() {
  formData.name = document.getElementById('name')?.value || '';
  formData.phone = document.getElementById('phone')?.value || '';
  formData.telegramUsername = document.getElementById('telegramUsername')?.value || '';
  
  const summary = document.getElementById('summary');
  let html = '';
  
  if (formData.shape) html += `<p><strong>Форма:</strong> ${formData.shape}</p>`;
  if (formData.color) html += `<p><strong>Колір:</strong> ${formData.color}</p>`;
  if (formData.scent) html += `<p><strong>Аромат:</strong> ${formData.scent}</p>`;
  if (formData.ingredient) html += `<p><strong>Інгредієнт:</strong> ${formData.ingredient}</p>`;
  if (formData.name) html += `<p><strong>Ім'я:</strong> ${formData.name}</p>`;
  if (formData.phone) html += `<p><strong>Телефон:</strong> ${formData.phone}</p>`;
  if (formData.telegramUsername) html += `<p><strong>Telegram:</strong> ${formData.telegramUsername}</p>`;
  
  if (appliedPromo) {
    html += `<p style="background: #FFE4F0; padding: 10px; border-radius: 6px; color: #FF69B4;"><strong>🎟️ Промокод:</strong> ${appliedPromo.code} (-${appliedPromo.discount}%)</p>`;
  }
  
  if (!html) {
    html = '<p class="empty-summary">Заповніть форму</p>';
  }
  
  summary.innerHTML = html;
}

// Navigation
function nextStep() {
  if (currentStep === 2) {
    const shape = document.querySelector('input[name="shape"]:checked')?.value;
    if (shape === 'rectangle') {
      const colorChecked = document.querySelector('input[name="color"]:checked');
      if (!colorChecked) {
        alert('Будь ласка, виберіть колір');
        return;
      }
    }
  }
  
  if (currentStep < totalSteps) {
    document.getElementById(`step${currentStep}`).classList.remove('active');
    currentStep++;
    document.getElementById(`step${currentStep}`).classList.add('active');
    updateSummary();
  }
}

function prevStep() {
  if (currentStep > 1) {
    document.getElementById(`step${currentStep}`).classList.remove('active');
    currentStep--;
    document.getElementById(`step${currentStep}`).classList.add('active');
    updateSummary();
  }
}

// Submit order
async function submitOrder(e) {
  e.preventDefault();
  
  const formDataToSend = {
    shape: document.querySelector('input[name="shape"]:checked')?.value,
    color: document.querySelector('input[name="color"]:checked')?.value || null,
    scent: document.querySelector('input[name="scent"]:checked')?.value,
    ingredient: document.querySelector('input[name="ingredient"]:checked')?.value,
    name: document.getElementById('name').value,
    phone: document.getElementById('phone').value,
    telegramUsername: document.getElementById('telegramUsername').value,
    notes: document.getElementById('notes').value,
    promoCode: appliedPromo ? appliedPromo.code : null,
    promoDiscount: appliedPromo ? appliedPromo.discount : 0
  };
  
  if (!formDataToSend.shape || !formDataToSend.scent || !formDataToSend.ingredient || !formDataToSend.name || !formDataToSend.phone) {
    alert('Будь ласка, заповніть всі необхідні поля');
    return;
  }
  
  if (formDataToSend.shape === 'rectangle' && !formDataToSend.color) {
    alert('Будь ласка, виберіть колір для прямокутника');
    return;
  }
  
  try {
    const submitBtn = document.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = '⏳ Відправлення...';
    submitBtn.disabled = true;
    
    // Try to send to API, fallback to localStorage
    try {
      const response = await fetch('/api/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formDataToSend)
      });
      
      if (!response.ok) {
        throw new Error('API Error');
      }
    } catch (apiError) {
      // Fallback: save to localStorage
      console.log('Saving order to localStorage...');
      let orders = JSON.parse(localStorage.getItem('soapShopOrders') || '[]');
      orders.push({
        id: Date.now(),
        ...formDataToSend,
        createdAt: new Date().toISOString()
      });
      localStorage.setItem('soapShopOrders', JSON.stringify(orders));
      
      // Notify admin panel
      localStorage.setItem('newSoapOrder', JSON.stringify(formDataToSend));
    }
    
    // If promo was used, increment usage count
    if (appliedPromo) {
      const adminData = localStorage.getItem('soapShopAdminData');
      if (adminData) {
        const data = JSON.parse(adminData);
        const promoToUpdate = data.promos.find(p => p.id === appliedPromo.id);
        if (promoToUpdate) {
          promoToUpdate.timesUsed++;
          localStorage.setItem('soapShopAdminData', JSON.stringify(data));
        }
      }
    }
    
    showSuccessModal();
    document.getElementById('orderForm').reset();
    appliedPromo = null;
    document.getElementById('promoInput').value = '';
    document.getElementById('promoStatus').innerHTML = '';
    currentStep = 1;
    document.querySelectorAll('.form-step').forEach(step => step.classList.remove('active'));
    document.getElementById('step1').classList.add('active');
    updateSummary();
    
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  } catch (error) {
    console.error('Error:', error);
    alert(`Помилка: ${error.message}`);
    const submitBtn = document.querySelector('button[type="submit"]');
    submitBtn.disabled = false;
  }
}

function showSuccessModal() {
  const modal = document.getElementById('successModal');
  modal.classList.add('show');
}

function closeModal() {
  const modal = document.getElementById('successModal');
  modal.classList.remove('show');
}

document.getElementById('successModal')?.addEventListener('click', (e) => {
  if (e.target === e.currentTarget) {
    closeModal();
  }
});
