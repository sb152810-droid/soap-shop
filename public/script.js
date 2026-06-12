let currentStep = 1;
const totalSteps = 5;
let formData = {};
let allData = {};

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  await loadData();
  document.getElementById('orderForm').addEventListener('submit', submitOrder);
  updateFormListeners();
});

// Load data from server
async function loadData() {
  try {
    const response = await fetch('/api/data');
    allData = await response.json();
    renderShapes();
    renderColors();
    renderScents();
    renderSoaps();
    updateContacts();
  } catch (error) {
    console.error('Error loading data:', error);
  }
}

// Render shapes
function renderShapes() {
  const container = document.getElementById('shapesContainer');
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
  let html = '';
  
  allData.colors?.forEach(color => {
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
  let html = '';
  
  allData.scents?.forEach(scent => {
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
  let html = '';
  
  allData.soaps?.forEach(soap => {
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
  const phone = allData.contacts?.find(c => c.type === 'phone')?.value || '0971891845';
  const telegram = allData.contacts?.find(c => c.type === 'telegram')?.value || '@ann_not_found';
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

// Update summary
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
    notes: document.getElementById('notes').value
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
    
    const response = await fetch('/api/order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formDataToSend)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Помилка при відправці');
    }
    
    showSuccessModal();
    document.getElementById('orderForm').reset();
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
