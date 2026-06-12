const express = require('express');
const axios = require('axios');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'sb152810@gmail.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static('public'));

// Data files
const dataDir = path.join(__dirname, 'data');
const dataFiles = {
  orders: path.join(dataDir, 'orders.json'),
  scents: path.join(dataDir, 'scents.json'),
  colors: path.join(dataDir, 'colors.json'),
  soaps: path.join(dataDir, 'soaps.json'),
  contacts: path.join(dataDir, 'contacts.json')
};

// Create data directory if doesn't exist
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize data files
function initializeData() {
  if (!fs.existsSync(dataFiles.orders)) {
    fs.writeFileSync(dataFiles.orders, JSON.stringify([]));
  }
  if (!fs.existsSync(dataFiles.scents)) {
    const defaultScents = [
      { id: 1, name: 'Полуниця свіжа', emoji: '🍓' },
      { id: 2, name: 'Диня медова', emoji: '🍈' },
      { id: 3, name: 'Вишня солодка', emoji: '🍒' },
      { id: 4, name: 'Малина', emoji: '🫐' },
      { id: 5, name: 'Арбуз', emoji: '🍉' },
      { id: 6, name: 'Манго', emoji: '🥭' },
      { id: 7, name: 'Болгарська роза', emoji: '🌹' },
      { id: 8, name: 'Фруктова ваніль', emoji: '🍦' },
      { id: 9, name: 'Кава', emoji: '☕' },
      { id: 10, name: 'Зелений чай', emoji: '🫖' }
    ];
    fs.writeFileSync(dataFiles.scents, JSON.stringify(defaultScents, null, 2));
  }
  if (!fs.existsSync(dataFiles.colors)) {
    const defaultColors = [
      { id: 1, name: 'Світло-зелений', value: '#90EE90' },
      { id: 2, name: 'Рожевий', value: '#FFB6C1' },
      { id: 3, name: 'Лавандовий', value: '#E6E6FA' },
      { id: 4, name: 'Персиковий', value: '#FFDAB9' },
      { id: 5, name: 'Крем��вий', value: '#FFFACD' },
      { id: 6, name: 'М\'ятний', value: '#98FF98' }
    ];
    fs.writeFileSync(dataFiles.colors, JSON.stringify(defaultColors, null, 2));
  }
  if (!fs.existsSync(dataFiles.soaps)) {
    const defaultSoaps = [
      { id: 1, name: 'Молочний шоколад', emoji: '🍫' },
      { id: 2, name: 'Карамель', emoji: '🍬' },
      { id: 3, name: 'Гарячий шоколад', emoji: '☕' },
      { id: 4, name: 'Какао', emoji: '🍫' },
      { id: 5, name: 'Фруктовий мус', emoji: '🍓' },
      { id: 6, name: 'Latte', emoji: '☕' }
    ];
    fs.writeFileSync(dataFiles.soaps, JSON.stringify(defaultSoaps, null, 2));
  }
  if (!fs.existsSync(dataFiles.contacts)) {
    const defaultContacts = [
      { id: 1, type: 'phone', value: '0971891845', label: 'Телефон' },
      { id: 2, type: 'telegram', value: '@ann_not_found', label: 'Telegram' },
      { id: 3, type: 'email', value: 'sb152810@gmail.com', label: 'Email' }
    ];
    fs.writeFileSync(dataFiles.contacts, JSON.stringify(defaultContacts, null, 2));
  }
}

initializeData();

// Helper functions
function readData(file) {
  try {
    return JSON.parse(fs.readFileSync(dataFiles[file], 'utf8'));
  } catch (error) {
    console.error(`Error reading ${file}:`, error);
    return [];
  }
}

function writeData(file, data) {
  try {
    fs.writeFileSync(dataFiles[file], JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(`Error writing ${file}:`, error);
  }
}

// Send message to Telegram
async function sendToTelegram(orderData) {
  try {
    const message = `
🛁 <b>НОВЕ ЗАМОВЛЕННЯ!</b>

<b>Форма:</b> ${orderData.shape}
<b>Аромат:</b> ${orderData.scent}
<b>Інгредієнт:</b> ${orderData.ingredient}
${orderData.color ? `<b>Колір:</b> ${orderData.color}` : ''}

👤 <b>Контактні дані:</b>
<b>Ім'я:</b> ${orderData.name}
<b>Телефон:</b> ${orderData.phone}
<b>Telegram:</b> ${orderData.telegramUsername}

📝 <b>Додаткові побажання:</b>
${orderData.notes || 'Немає'}

⏰ <b>Час замовлення:</b> ${new Date().toLocaleString('uk-UA')}
    `;

    const response = await axios.post(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      {
        chat_id: '@ann_not_found',
        text: message,
        parse_mode: 'HTML'
      }
    );

    console.log('Message sent to Telegram');
    return true;
  } catch (error) {
    console.error('Error sending to Telegram:', error.message);
    return false;
  }
}

// Admin Authentication (simple)
function verifyAdmin(email, password) {
  return email === ADMIN_EMAIL && password === ADMIN_PASSWORD;
}

// ========== CLIENT API ==========

// Get all data for form
app.get('/api/data', (req, res) => {
  try {
    res.json({
      scents: readData('scents'),
      colors: readData('colors'),
      soaps: readData('soaps'),
      contacts: readData('contacts')
    });
  } catch (error) {
    res.status(500).json({ error: 'Помилка при завантаженні даних' });
  }
});

// Submit order
app.post('/api/order', async (req, res) => {
  try {
    const orderData = req.body;
    
    if (!orderData.shape || !orderData.scent || !orderData.ingredient || !orderData.name || !orderData.phone) {
      return res.status(400).json({ error: 'Не всі поля заповнені' });
    }

    const orders = readData('orders');
    const newOrder = {
      ...orderData,
      id: Date.now(),
      createdAt: new Date().toISOString()
    };

    orders.push(newOrder);
    writeData('orders', orders);

    const sent = await sendToTelegram(orderData);

    if (sent) {
      res.json({ 
        success: true, 
        message: 'Замовлення успішно отримано!',
        orderId: newOrder.id
      });
    } else {
      res.status(500).json({ error: 'Помилка при відправці замовлення' });
    }
  } catch (error) {
    console.error('Order error:', error);
    res.status(500).json({ error: 'Серверна помилка' });
  }
});

// ========== ADMIN API ==========

// Admin Login
app.post('/api/admin/login', (req, res) => {
  const { email, password } = req.body;
  if (verifyAdmin(email, password)) {
    res.json({ success: true, message: 'Успішний вхід' });
  } else {
    res.status(401).json({ error: 'Невірні облікові дані' });
  }
});

// Get all orders
app.get('/api/admin/orders', (req, res) => {
  const { email, password } = req.query;
  if (!verifyAdmin(email, password)) {
    return res.status(401).json({ error: 'Не авторизовано' });
  }
  res.json(readData('orders'));
});

// Delete order
app.delete('/api/admin/orders/:id', (req, res) => {
  const { email, password } = req.query;
  if (!verifyAdmin(email, password)) {
    return res.status(401).json({ error: 'Не авторизовано' });
  }
  
  try {
    let orders = readData('orders');
    orders = orders.filter(o => o.id !== parseInt(req.params.id));
    writeData('orders', orders);
    res.json({ success: true, message: 'Замовлення видалено' });
  } catch (error) {
    res.status(500).json({ error: 'Помилка при видаленні' });
  }
});

// ========== SCENTS ==========

app.post('/api/admin/scents', (req, res) => {
  const { email, password, name, emoji } = req.body;
  if (!verifyAdmin(email, password)) {
    return res.status(401).json({ error: 'Не авторизовано' });
  }
  
  try {
    const scents = readData('scents');
    const newScent = {
      id: scents.length > 0 ? Math.max(...scents.map(s => s.id)) + 1 : 1,
      name,
      emoji
    };
    scents.push(newScent);
    writeData('scents', scents);
    res.json({ success: true, scent: newScent });
  } catch (error) {
    res.status(500).json({ error: 'Помилка при додаванні аромату' });
  }
});

app.delete('/api/admin/scents/:id', (req, res) => {
  const { email, password } = req.query;
  if (!verifyAdmin(email, password)) {
    return res.status(401).json({ error: 'Не авторизовано' });
  }
  
  try {
    let scents = readData('scents');
    scents = scents.filter(s => s.id !== parseInt(req.params.id));
    writeData('scents', scents);
    res.json({ success: true, message: 'Аромат видалено' });
  } catch (error) {
    res.status(500).json({ error: 'Помилка при видаленні' });
  }
});

// ========== COLORS ==========

app.post('/api/admin/colors', (req, res) => {
  const { email, password, name, value } = req.body;
  if (!verifyAdmin(email, password)) {
    return res.status(401).json({ error: 'Не авторизовано' });
  }
  
  try {
    const colors = readData('colors');
    const newColor = {
      id: colors.length > 0 ? Math.max(...colors.map(c => c.id)) + 1 : 1,
      name,
      value
    };
    colors.push(newColor);
    writeData('colors', colors);
    res.json({ success: true, color: newColor });
  } catch (error) {
    res.status(500).json({ error: 'Помилка при додаванні кольору' });
  }
});

app.delete('/api/admin/colors/:id', (req, res) => {
  const { email, password } = req.query;
  if (!verifyAdmin(email, password)) {
    return res.status(401).json({ error: 'Не авторизовано' });
  }
  
  try {
    let colors = readData('colors');
    colors = colors.filter(c => c.id !== parseInt(req.params.id));
    writeData('colors', colors);
    res.json({ success: true, message: 'Колір видалено' });
  } catch (error) {
    res.status(500).json({ error: 'Помилка при видаленні' });
  }
});

// ========== SOAPS ==========

app.post('/api/admin/soaps', (req, res) => {
  const { email, password, name, emoji } = req.body;
  if (!verifyAdmin(email, password)) {
    return res.status(401).json({ error: 'Не авторизовано' });
  }
  
  try {
    const soaps = readData('soaps');
    const newSoap = {
      id: soaps.length > 0 ? Math.max(...soaps.map(s => s.id)) + 1 : 1,
      name,
      emoji
    };
    soaps.push(newSoap);
    writeData('soaps', soaps);
    res.json({ success: true, soap: newSoap });
  } catch (error) {
    res.status(500).json({ error: 'Помилка при додаванні мила' });
  }
});

app.delete('/api/admin/soaps/:id', (req, res) => {
  const { email, password } = req.query;
  if (!verifyAdmin(email, password)) {
    return res.status(401).json({ error: 'Не авторизовано' });
  }
  
  try {
    let soaps = readData('soaps');
    soaps = soaps.filter(s => s.id !== parseInt(req.params.id));
    writeData('soaps', soaps);
    res.json({ success: true, message: 'Мило видалено' });
  } catch (error) {
    res.status(500).json({ error: 'Помилка при видаленні' });
  }
});

// ========== CONTACTS ==========

app.post('/api/admin/contacts', (req, res) => {
  const { email, password, type, value, label } = req.body;
  if (!verifyAdmin(email, password)) {
    return res.status(401).json({ error: 'Не авторизовано' });
  }
  
  try {
    const contacts = readData('contacts');
    const newContact = {
      id: contacts.length > 0 ? Math.max(...contacts.map(c => c.id)) + 1 : 1,
      type,
      value,
      label
    };
    contacts.push(newContact);
    writeData('contacts', contacts);
    res.json({ success: true, contact: newContact });
  } catch (error) {
    res.status(500).json({ error: 'Помилка при додаванні контакту' });
  }
});

app.delete('/api/admin/contacts/:id', (req, res) => {
  const { email, password } = req.query;
  if (!verifyAdmin(email, password)) {
    return res.status(401).json({ error: 'Не авторизовано' });
  }
  
  try {
    let contacts = readData('contacts');
    contacts = contacts.filter(c => c.id !== parseInt(req.params.id));
    writeData('contacts', contacts);
    res.json({ success: true, message: 'Контакт видалено' });
  } catch (error) {
    res.status(500).json({ error: 'Помилка при видаленні' });
  }
});

app.listen(PORT, () => {
  console.log(`🛁 Soap Shop server running on http://localhost:${PORT}`);
  console.log(`📱 Telegram Bot Token: ${BOT_TOKEN ? 'Configured' : 'NOT SET'}`);
  console.log(`👤 Admin Email: ${ADMIN_EMAIL}`);
});
