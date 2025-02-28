const Chat = require('../models/Chat');
const { User } = require('../models/User');
const Product = require('../models/Product');
const Notification = require('../models/Notification');
const { Expo } = require('expo-server-sdk');

const expo = new Expo();

async function sendPushNotification(expoPushToken, title, body, data = {}) {
  try {
    if (!Expo.isExpoPushToken(expoPushToken)) {
      console.error(`Invalid Expo push token: ${expoPushToken}`);
      return;
    }

    const message = {
      to: expoPushToken,
      sound: 'default',
      title,
      body,
      data,
      priority: 'high',
    };

    const chunks = expo.chunkPushNotifications([message]);
    for (let chunk of chunks) {
      try {
        await expo.sendPushNotificationsAsync(chunk);
      } catch (error) {
        console.error('Error sending push notification:', error);
      }
    }
  } catch (error) {
    console.error('Push notification error:', error);
  }
}

// Helper function to create notification
async function createNotification(recipientId, title, message, type, referenceId) {
  try {
    await Notification.create({
      recipient: recipientId,
      title,
      message,
      type,
      reference: {
        type: 'Chat',
        id: referenceId
      }
    });
  } catch (error) {
    console.error('Error creating notification:', error);
  }
}

// exports.initiateChat = async (req, res) => {
//   try {
//     const { productId, message } = req.body;
//     const buyerId = req.user._id;

//     // Find product and seller
//     const product = await Product.findById(productId).populate('shop');
//     if (!product) {
//       return res.status(404).json({
//         success: false,
//         errors: ['Product not found'],
//         data: null
//       });
//     }

//     // Check if chat already exists
//     let chat = await Chat.findOne({
//       participants: { $all: [buyerId, product.shop.owner] },
//       product: productId
//     });

//     if (!chat) {
//       chat = new Chat({
//         participants: [buyerId, product.shop.owner],
//         product: productId,
//         messages: [{
//           sender: buyerId,
//           content: message
//         }],
//       });
//       chat.lastMessage = chat.messages[0];
//       await chat.save();
//     } else {
//       chat.messages.push({
//         sender: buyerId,
//         content: message
//       });
//       chat.lastMessage = chat.messages[chat.messages.length - 1];
//       await chat.save();
//     }

//     res.status(201).json({
//       success: true,
//       data: { chat },
//       errors: []
//     });

//   } catch (err) {
//     res.status(500).json({
//       success: false,
//       errors: [err.message],
//       data: null
//     });
//   }
// };

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

    // Get seller details
    const seller = await User.findById(product.shop.owner);
    if (!seller) {
      return res.status(404).json({
        success: false,
        errors: ['Seller not found'],
        data: null
      });
    }

    // Check if chat already exists
    let chat = await Chat.findOne({
      participants: { $all: [buyerId, seller._id] },
      product: productId
    });

    const isNewChat = !chat;

    if (!chat) {
      chat = new Chat({
        participants: [buyerId, seller._id],
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

    // If this is a new chat or the seller is not the last sender,
    // send notification to seller
    if (isNewChat || chat.lastMessage.sender.toString() !== seller._id.toString()) {
      const buyer = await User.findById(buyerId);
      const notificationTitle = isNewChat ? 'New Chat Inquiry' : 'New Message';
      const notificationMessage = isNewChat 
        ? `${buyer.username} has inquired about ${product.name}`
        : `New message from ${buyer.username} about ${product.name}`;

      // Create in-app notification
      await createNotification(
        seller._id,
        notificationTitle,
        notificationMessage,
        'chat',
        chat._id
      );

      // Send push notification if seller has push token
      if (seller.expoPushToken) {
        await sendPushNotification(
          seller.expoPushToken,
          notificationTitle,
          notificationMessage,
          {
            type: 'chat',
            chatId: chat._id.toString(),
            productId: productId
          }
        );
      }
    }

    // Populate the response data
    await chat.populate([
      { path: 'participants', select: 'username profile.avatar' },
      { path: 'product', select: 'name images' }
    ]);

    res.status(201).json({
      success: true,
      data: { chat },
      errors: []
    });

  } catch (err) {
    console.error('Chat initiation error:', err);
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

// exports.sendMessage = async (req, res) => {
//   try {
//     const { chatId } = req.params;
//     const { message } = req.body;
//     const userId = req.user._id;

//     const chat = await Chat.findById(chatId);
//     if (!chat) {
//       return res.status(404).json({
//         success: false,
//         errors: ['Chat not found'],
//         data: null
//       });
//     }

//     // Check if user is participant
//     if (!chat.participants.some(p => p.toString() === userId.toString())) {
//       return res.status(403).json({
//         success: false,
//         errors: ['Not authorized to send message in this chat'],
//         data: null
//       });
//     }

//     const newMessage = {
//       sender: userId,
//       content: message
//     };

//     chat.messages.push(newMessage);
//     chat.lastMessage = newMessage;
//     await chat.save();

//     res.json({
//       success: true,
//       data: { message: newMessage },
//       errors: []
//     });

//   } catch (err) {
//     res.status(500).json({
//       success: false,
//       errors: [err.message],
//       data: null
//     });
//   }
// };

exports.sendMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { message } = req.body;
    const userId = req.user._id;

    const chat = await Chat.findById(chatId)
      .populate('participants', 'username expoPushToken')
      .populate('product', 'name');

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

    // Find the recipient (the other participant)
    const recipient = chat.participants.find(p => p._id.toString() !== userId.toString());
    const sender = chat.participants.find(p => p._id.toString() === userId.toString());

    // Send notification to recipient
    const notificationMessage = `New message from ${sender.username} about ${chat.product.name}`;

    // Create in-app notification
    await createNotification(
      recipient._id,
      'New Message',
      notificationMessage,
      'chat',
      chat._id
    );

    // Send push notification if recipient has push token
    if (recipient.expoPushToken) {
      await sendPushNotification(
        recipient.expoPushToken,
        'New Message',
        notificationMessage,
        {
          type: 'chat',
          chatId: chat._id.toString(),
          productId: chat.product._id.toString()
        }
      );
    }

    res.json({
      success: true,
      data: { message: newMessage },
      errors: []
    });

  } catch (err) {
    console.error('Send message error:', err);
    res.status(500).json({
      success: false,
      errors: [err.message],
      data: null
    });
  }
};