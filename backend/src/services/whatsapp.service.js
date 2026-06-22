let axios;
try {
  axios = require('axios');
} catch {
  axios = null;
}

const WA_TOKEN    = process.env.WHATSAPP_TOKEN;
const WA_PHONE_ID = process.env.WHATSAPP_PHONE_ID;
const WA_BASE_URL = WA_PHONE_ID
  ? `https://graph.facebook.com/v18.0/${WA_PHONE_ID}/messages`
  : null;

// Send a text message
exports.sendMessage = async (to, message) => {
  if (!WA_TOKEN || !WA_PHONE_ID || !axios) {
    console.log('[WhatsApp] Not configured — skipping');
    return null;
  }

  try {
    const response = await axios.post(WA_BASE_URL, {
      messaging_product: 'whatsapp',
      to:                to.replace(/\D/g, ''),
      type:              'text',
      text:              { body: message },
    }, {
      headers: {
        Authorization:  `Bearer ${WA_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (err) {
    console.error(
      '[WhatsApp] Error:',
      err.response?.data || err.message
    );
    return null;
  }
};

// Daily sales nudge message
exports.sendDailySalesNudge = async (
  phone, storeName, todaySales
) => {
  const message =
    `🏪 *${storeName}* — Daily Sales Reminder\n\n` +
    `📊 Today so far: ` +
    `₹${todaySales.toLocaleString('en-IN')}\n\n` +
    `Don't forget to log all your sales!\n` +
    `Reply with: *sold [qty] [product]*\n` +
    `Example: *sold 5 atta*`;

  return exports.sendMessage(phone, message);
};

// Low stock alert message
exports.sendLowStockAlert = async (
  phone, storeName, products
) => {
  const productList = products
    .map(p => `• ${p.name} — ${p.currentStock} ${p.unit} left`)
    .join('\n');

  const message =
    `⚠️ *${storeName}* — Low Stock Alert\n\n` +
    `These products need reordering:\n` +
    `${productList}\n\n` +
    `Login to create a purchase order.`;

  return exports.sendMessage(phone, message);
};

// Anomaly alert message
exports.sendAnomalyAlert = async (
  phone, storeName, anomaly
) => {
  const icon = anomaly.type === 'spike' ? '📈' : '📉';
  const message =
    `${icon} *${storeName}* — Sales Anomaly\n\n` +
    `*${anomaly.productName}*\n` +
    `${anomaly.type === 'spike'
      ? 'Unusual spike' : 'Unusual drop'} detected!\n` +
    `Expected: ${anomaly.expectedQty} | ` +
    `Actual: ${anomaly.actualQty}\n\n` +
    `Check your dashboard for details.`;

  return exports.sendMessage(phone, message);
};

// Parse incoming WhatsApp message
exports.parseIncomingMessage = (messageText) => {
  const text = messageText.toLowerCase().trim();

  const patterns = [
    /sold\s+(\d+\.?\d*)\s+(.+)/,
    /(\d+\.?\d*)\s+(.+?)\s+sold/,
    /(\d+\.?\d*)\s+(.+)/,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const qty     = parseFloat(match[1]) ||
                      parseFloat(match[2]);
      const product = (match[2] || match[1]).trim();
      if (qty > 0 && product.length > 0) {
        return { qty, productName: product, raw: messageText };
      }
    }
  }

  return null;
};