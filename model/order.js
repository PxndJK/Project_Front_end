const mongoose = require("mongoose");

const orders = new mongoose.Schema({
  userId: String, // Reference to the user who placed the order
  items: [
    {
      itemId: String, // Reference to the item
      quantity: Number,
      price: Number, // Store price at the time of the order to handle price changes
    },
    // ... more items
  ],
  orderDate: Date,
  status: String, // e.g., 'Processing', 'Shipped', 'Delivered', 'Canceled'
});

exports.Order = new mongoose.model("order", orders);
