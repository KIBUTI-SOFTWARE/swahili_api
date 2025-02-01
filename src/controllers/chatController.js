const Chat = require('../models/Chat');
const User = require('../models/User');
const Product = require('../models/Product');

exports.initiateChat = async (req, res) => {
  try {
    const { productId, message } = req.body;
    const buyerId = req.user._id;

    // Find product and seller
    const product = await Product.findById(productId).populate('shop');
    if (!product) {
      return res.status(404).json({
        success: false,
        errors: ['Product not found'],
        data: null
      });
    }

    // Check if chat already exists
    let chat = await Chat.findOne({
      participants: { $all: [buyerId, product.shop.owner] },
      product: productId
    });

    if (!chat) {
      chat = new Chat({
        participants: [buyerId, product.shop.owner],
        product: productId,
        messages: [{
          sender: buyerId,
          content: message
        }],
      });
      chat.lastMessage = chat.messages[0];
      await chat.save();
    } else {
      chat.messages.push({
        sender: buyerId,
        content: message
      });
      chat.lastMessage = chat.messages[chat.messages.length - 1];
      await chat.save();
    }

    res.status(201).json({
      success: true,
      data: { chat },
      errors: []
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      errors: [err.message],
      data: null
    });
  }
};

exports.getChats = async (req, res) => {
  try {
    const userId = req.user._id;
    const chats = await Chat.find({ participants: userId })
      .populate('participants', 'username profile.avatar')
      .populate('product', 'name images')
      .sort('-updatedAt');

    res.json({
      success: true,
      data: { chats },
      errors: []
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      errors: [err.message],
      data: null
    });
  }
};

exports.getChatMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user._id;

    const chat = await Chat.findById(chatId)
      .populate('participants', 'username profile.avatar')
      .populate('product', 'name images');

    if (!chat) {
      return res.status(404).json({
        success: false,
        errors: ['Chat not found'],
        data: null
      });
    }

    // Check if user is participant
    if (!chat.participants.some(p => p._id.toString() === userId.toString())) {
      return res.status(403).json({
        success: false,
        errors: ['Not authorized to view this chat'],
        data: null
      });
    }

    res.json({
      success: true,
      data: { chat },
      errors: []
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      errors: [err.message],
      data: null
    });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { message } = req.body;
    const userId = req.user._id;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({
        success: false,
        errors: ['Chat not found'],
        data: null
      });
    }

    // Check if user is participant
    if (!chat.participants.some(p => p.toString() === userId.toString())) {
      return res.status(403).json({
        success: false,
        errors: ['Not authorized to send message in this chat'],
        data: null
      });
    }

    const newMessage = {
      sender: userId,
      content: message
    };

    chat.messages.push(newMessage);
    chat.lastMessage = newMessage;
    await chat.save();

    res.json({
      success: true,
      data: { message: newMessage },
      errors: []
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      errors: [err.message],
      data: null
    });
  }
};