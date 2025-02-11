const Order = require('../models/Order');
const Product = require('../models/Product');
const { User } = require('../models/User');
const mongoose = require('mongoose');
const paymentService = require('../services/paymentService');
const notificationService = require('../services/notificationService');

const ORDER_STATUS_FLOW = {
  pending: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered', 'cancelled'],
  delivered: [], // Final state
  cancelled: [] // Final state
};

const isValidStatusTransition = (currentStatus, newStatus) => {
  const allowedTransitions = ORDER_STATUS_FLOW[currentStatus] || [];
  return allowedTransitions.includes(newStatus);
};

// exports.createOrder = async (req, res) => {
//   try {
//     const { productId, quantity, shippingAddress, paymentMethod } = req.body;
//     const userId = req.user._id;

//     // Validate input
//     if (!productId || !quantity || !shippingAddress || !paymentMethod) {
//       return res.status(400).json({
//         success: false,
//         data: null,
//         errors: ['Missing required fields']
//       });
//     }

//     // Find prodct and check availability
//     const product = await Product.findById(productId)
//       .populate('shop', 'name email')
//       .populate('category', 'name');

//     if (!product) {
//       return res.status(404).json({
//         success: false,
//         data: null,
//         errors: ['Product not found']
//       });
//     }

//     // Check stock availability
//     if (product.stock < quantity) {
//       return res.status(400).json({
//         success: false,
//         data: null,
//         errors: [`Only ${product.stock} items available in stock`]
//       });
//     }

//     // Calculate total amount
//     const subtotal = product.price * quantity;
//     const tax = subtotal * 0.15; // Assuming 15% tax
//     const shippingCost = 0;
//     // const shippingCost = 10;
//     const totalAmount = subtotal + tax + shippingCost;

//     // Create order
//     const order = new Order({
//       user: userId,
//       shop: product.shop._id,
//       items: [{
//         product: productId,
//         quantity,
//         price: product.price,
//         name: product.name
//       }],
//       shippingAddress,
//       paymentMethod,
//       amounts: {
//         subtotal,
//         tax,
//         shipping: shippingCost,
//         total: totalAmount
//       },
//       status: 'pending'
//     });

//     try {
//       // Save order
//       await order.save();

//       // Process payment if mobile money is selected
//       if (paymentMethod === 'mobile_money') {
//         const user = await User.findById(userId);
//         const paymentResult = await paymentService.processPayment({
//           amounts: order.amounts,
//           user: {
//             name: user.username,
//             email: user.email
//           },
//           shippingAddress
//         });

//         console.log("payment results:",paymentResult)

//         // Update order with payment information
//         order.paymentDetails = {
//           transactionId: paymentResult.transactionId,
//           provider: 'zenopay',
//           status: paymentResult.status
//         };
//         await order.save();
//       }

//       // Update product stock and add order reference
//       await Product.findByIdAndUpdate(
//         productId,
//         {
//           $inc: { stock: -quantity },
//           $push: { orders: order._id }
//         }
//       );

//       // Update user's orders
//       await User.findByIdAndUpdate(
//         userId,
//         { $push: { orders: order._id } }
//       );

//       // Create notification for shop owner
//       const notificationMessage = `New order #${order.orderNumber} for ${product.name}`;

//       // Create persistent notification
//       await notificationService.createPersistentNotification(
//         product.shop._id,
//         notificationMessage,
//         order._id
//       );

//       // Send Expo push notification if shop owner has token
//       if (product.shop.expoPushToken) {
//         await notificationService.sendPushNotification(
//           product.shop.expoPushToken,
//           notificationMessage
//         );
//       }

//       // Fetch the complete order with populated fields for response
//       const populatedOrder = await Order.findById(order._id)
//         .populate('shop', 'name')
//         .populate('items.product', 'name image price');

//       res.status(201).json({
//         success: true,
//         data: {
//           order: {
//             _id: populatedOrder._id,
//             orderNumber: populatedOrder.orderNumber,
//             status: populatedOrder.status,
//             amounts: populatedOrder.amounts,
//             items: populatedOrder.items.map(item => ({
//               product: {
//                 _id: item.product._id,
//                 name: item.product.name,
//                 image: item.product.image
//               },
//               quantity: item.quantity,
//               price: item.price
//             })),
//             shippingAddress: populatedOrder.shippingAddress,
//             paymentMethod: populatedOrder.paymentMethod,
//             createdAt: populatedOrder.createdAt
//           }
//         },
//         errors: []
//       });

//     } catch (error) {
//       // If there's an error,rollback the order
//       if (order._id) {
//         await Order.findByIdAndDelete(order._id);
//       }
//       throw error;
//     }

//   } catch (err) {
//     res.status(500).json({
//       success: false,
//       data: null,
//       errors: [err.message]
//     });
//   }
// };


exports.createOrder = async (req, res) => {
  try {
    const { productId, quantity, shippingAddress, paymentMethod } = req.body;
    const userId = req.user._id;

    // Validate input
    if (!productId || !quantity || !shippingAddress || !paymentMethod) {
      return res.status(400).json({
        success: false,
        data: null,
        errors: ['Missing required fields']
      });
    }

    // Find product and check availability
    const product = await Product.findById(productId)
      .populate('shop', 'name email expoPushToken')
      .populate('category', 'name');

    if (!product) {
      return res.status(400).json({
        success: false,
        data: null,
        errors: ['Product not found']
      });
    }

    // Check stock availability
    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        data: null,
        errors: [`Only ${product.stock} items available in stock`]
      });
    }

    // Calculate total amount
    const subtotal = product.price * quantity;
    const tax = subtotal * 0.15;
    const shippingCost = 0;
    const totalAmount = subtotal + tax + shippingCost;

    // Prepare order data
    const orderData = {
      user: userId,
      shop: product.shop._id,
      items: [{
        product: productId,
        quantity,
        price: product.price,
        name: product.name
      }],
      shippingAddress,
      paymentMethod,
      amounts: {
        subtotal,
        tax,
        shipping: shippingCost,
        total: totalAmount
      },
      status: 'pending'
    };

    // Process payment first if mobile money is selected
    if (paymentMethod === 'mobile_money') {
      const user = await User.findById(userId);
      const paymentResult = await paymentService.processPayment({
        amounts: orderData.amounts,
        user: {
          name: user.username,
          email: user.email
        },
        shippingAddress
      });

      if (!paymentResult.success || paymentResult.message.status !== 'success') {
        return res.status(400).json({
          success: false,
          data: null,
          errors: ['Payment processing failed']
        });
      }

      // Add payment details to order data
      orderData.paymentDetails = {
        transactionId: paymentResult.message.order_id,
        provider: 'zenopay',
        status: paymentResult.message.status,
        message: paymentResult.message.message
      };
    }

    // Create and save order after successful payment
    const order = new Order(orderData);
    await order.save();

    // Update product stock and add order reference
    await Product.findByIdAndUpdate(
      productId,
      {
        $inc: { stock: -quantity },
        $push: { orders: order._id }
      }
    );

    // Update user's orders
    await User.findByIdAndUpdate(
      userId,
      { $push: { orders: order._id } }
    );

    // Create notification for shop owner
    const notificationMessage = `New order #${order.orderNumber} for ${product.name}`;

    // Create persistent notification
    await notificationService.createPersistentNotification(
      product.shop._id,
      notificationMessage,
      order._id
    );

    // Send Expo push notification if shop owner has token
    if (product.shop.expoPushToken) {
      await notificationService.sendPushNotification(
        product.shop.expoPushToken,
        notificationMessage
      );
    }

    // Fetch the complete order with populated fields for response
    const populatedOrder = await Order.findById(order._id)
      .populate('shop', 'name')
      .populate('items.product', 'name image price');

    res.status(201).json({
      success: true,
      data: {
        order: {
          _id: populatedOrder._id,
          orderNumber: populatedOrder.orderNumber,
          status: populatedOrder.status,
          amounts: populatedOrder.amounts,
          items: populatedOrder.items.map(item => ({
            product: {
              _id: item.product._id,
              name: item.product.name,
              image: item.product.image
            },
            quantity: item.quantity,
            price: item.price
          })),
          shippingAddress: populatedOrder.shippingAddress,
          paymentMethod: populatedOrder.paymentMethod,
          createdAt: populatedOrder.createdAt
        }
      },
      errors: []
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      data: null,
      errors: [err.message]
    });
  }
};


exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('shop', 'name email')
      .populate('items.product', 'name image price');

    if (!order) {
      return res.status(404).json({
        success: false,
        data: null,
        errors: ['Order not found']
      });
    }

    // Check if the user is authorized to view this order
    if (order.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        data: null,
        errors: ['Not authorized to view this order']
      });
    }

    res.json({
      success: true,
      data: { order },
      errors: []
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      data: null,
      errors: [err.message]
    });
  }
};

exports.getUserOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;

    let query = { user: req.user._id };
    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate('shop', 'name')
      .populate('items.product', 'name image price')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          current: page,
          total: Math.ceil(total / limit),
          totalRecords: total
        }
      },
      errors: []
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      data: null,
      errors: [err.message]
    });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    // Validate status value
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        data: null,
        errors: ['Invalid status value']
      });
    }

    // Find the order
    const order = await Order.findById(orderId)
      .populate('shop', 'name')
      .populate('items.product', 'name image price');

    if (!order) {
      return res.status(404).json({
        success: false,
        data: null,
        errors: ['Order not found']
      });
    }

    // Check authorization (only shop owner or admin can update status)
    const isShopOwner = order.shop._id.toString() === req.user._id.toString();
    const isAdmin = req.user.userType === 'ADMIN';
    if (!isShopOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        data: null,
        errors: ['Not authorized to update this order']
      });
    }

    // Validate status transition
    if (!isValidStatusTransition(order.status, status)) {
      return res.status(400).json({
        success: false,
        data: null,
        errors: [`Invalid status transition from ${order.status} to ${status}`]
      });
    }

    // Update status and add status history
    const statusUpdate = {
      status,
      updatedAt: Date.now(),
      statusHistory: [
        ...order.statusHistory || [],
        {
          status: order.status,
          timestamp: new Date(),
          updatedBy: req.user._id
        }
      ]
    };

    // Special handling for specific status transitions
    if (status === 'cancelled') {
      // If order is cancelled, restore product stock
      await Promise.all(order.items.map(async (item) => {
        await Product.findByIdAndUpdate(
          item.product._id,
          { $inc: { stock: item.quantity } }
        );
      }));
    }

    // Update the order
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      statusUpdate,
      { new: true }
    ).populate('shop', 'name')
      .populate('items.product', 'name image price')
      .populate('statusHistory.updatedBy', 'username');
      // .populate('items.product', 'name image price')
      // .populate('statusHistory.updatedBy', 'username');

    // Send notification to user (you can implement this based on your notification system)
    // await notifyUser(order.user, `Your order status has been updated to ${status}`);

    res.json({
      success: true,
      data: { order: updatedOrder },
      errors: []
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      data: null,
      errors: [err.message]
    });
  }
};

exports.getOrderStatuses = async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        statuses: {
          pending: {
            description: 'Order has been placed but not yet processed',
            nextPossibleStatuses: ORDER_STATUS_FLOW.pending
          },
          processing: {
            description: 'Order is being processed and prepared for shipping',
            nextPossibleStatuses: ORDER_STATUS_FLOW.processing
          },
          shipped: {
            description: 'Order has been shipped and is in transit',
            nextPossibleStatuses: ORDER_STATUS_FLOW.shipped
          },
          delivered: {
            description: 'Order has been delivered to the customer',
            nextPossibleStatuses: ORDER_STATUS_FLOW.delivered
          },
          cancelled: {
            description: 'Order has been cancelled',
            nextPossibleStatuses: ORDER_STATUS_FLOW.cancelled
          }
        }
      },
      errors: []
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      data: null,
      errors: [err.message]
    });
  }
};