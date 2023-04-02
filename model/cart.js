const mongoose = require('mongoose');

const carts = new mongoose.Schema({
    userId: String, // Reference to the user who owns the cart
    items: [
      {
        itemId: String,
        quantity: Number,
      },
    ],
  });

  exports.Cart = new mongoose.model("Cart", carts);