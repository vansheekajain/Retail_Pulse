const whatsappService = require('../services/whatsapp.service');
const { Store, Product, SaleEntry, User } = require('../models');
const { Op } = require('sequelize');
const dayjs  = require('dayjs');

// Webhook verification
exports.verifyWebhook = (req, res) => {
  const mode      = req.query['hub.mode'];
  const token     = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' &&
      token === process.env.WHATSAPP_VERIFY_TOKEN) {
    res.status(200).send(challenge);
  } else {
    res.status(403).json({ error: 'Forbidden' });
  }
};

// Handle incoming WhatsApp messages
exports.handleIncoming = async (req, res) => {
  try {
    const body = req.body;
    if (body.object !== 'whatsapp_business_account') {
      return res.status(404).json({ error: 'Not found' });
    }

    const entry   = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value   = changes?.value;
    const message = value?.messages?.[0];

    if (!message || message.type !== 'text') {
      return res.sendStatus(200);
    }

    const from   = message.from;
    const text   = message.text?.body || '';
    const parsed = whatsappService.parseIncomingMessage(text);

    if (!parsed) {
      await whatsappService.sendMessage(from,
        `Hi! I didn't understand that.\n\n` +
        `To log a sale send:\n` +
        `*sold [qty] [product name]*\n\n` +
        `Example: *sold 5 atta*`
      );
      return res.sendStatus(200);
    }

    // Find user by phone number
    const phone = '+' + from;
    const user  = await User.findOne({
      where: { phone },
    });

    if (!user) {
      await whatsappService.sendMessage(from,
        `Phone number not registered.\n` +
        `Please login to HyperLocal Forecast ` +
        `and add your WhatsApp number in Settings.`
      );
      return res.sendStatus(200);
    }

    // Find store owned by this user
    const store = await Store.findOne({
      where: {
        ownerId:  user.id,
        isActive: true,
      },
    });

    if (!store) {
      await whatsappService.sendMessage(from,
        `No store found for your account.`
      );
      return res.sendStatus(200);
    }

    // Find matching product by name
    const products = await Product.findAll({
      where: { storeId: store.id, isActive: true },
    });

    const match = products.find(p =>
      p.name.toLowerCase().includes(
        parsed.productName.toLowerCase()
      ) ||
      parsed.productName.toLowerCase().includes(
        p.name.toLowerCase()
      )
    );

    if (!match) {
      const productList = products
        .map(p => `• ${p.name}`)
        .join('\n');

      await whatsappService.sendMessage(from,
        `Product *${parsed.productName}* not found.\n\n` +
        `Your products:\n${productList}`
      );
      return res.sendStatus(200);
    }

    // Create the sale entry
    const totalAmount = parsed.qty *
      parseFloat(match.basePrice);

    await SaleEntry.create({
      storeId:     store.id,
      productId:   match.id,
      qty:         parsed.qty,
      unitPrice:   match.basePrice,
      totalAmount,
      loggedVia:   'whatsapp',
      saleDate:    dayjs().format('YYYY-MM-DD'),
    });

    await whatsappService.sendMessage(from,
      `✅ Sale logged!\n\n` +
      `*${match.name}* — ${parsed.qty} ${match.unit}\n` +
      `Amount: ₹${totalAmount.toLocaleString('en-IN')}\n\n` +
      `Keep logging! 📊`
    );

    res.sendStatus(200);
  } catch (err) {
    console.error('[WhatsApp webhook error]', err);
    res.sendStatus(200);
  }
};

// Send daily nudge — no Store-User join needed
exports.sendDailyNudge = async (req, res, next) => {
  try {
    const stores = await Store.findAll({
      where: { isActive: true },
    });

    const today = dayjs().format('YYYY-MM-DD');
    let sent    = 0;

    for (const store of stores) {
      // Get owner separately
      const owner = await User.findByPk(store.ownerId);
      if (!owner?.phone) continue;

      const sales = await SaleEntry.findAll({
        where: { storeId: store.id, saleDate: today },
      });

      const totalRevenue = sales.reduce(
        (sum, s) => sum + parseFloat(s.totalAmount), 0
      );

      await whatsappService.sendDailySalesNudge(
        owner.phone,
        store.name,
        totalRevenue
      );
      sent++;
    }

    res.json({ message: `Nudges sent to ${sent} stores` });
  } catch (err) {
    next(err);
  }
};
