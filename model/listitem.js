const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    user_id: String,
    email: String,
    password: String,
    Username:String
});

const AdminSchema = new Schema({
    user_id: String,
    email: String,
    password: String,
    Username:String
});

// const foodSchema = new Schema({
//     _id: Number,
//     name: String,
//     description: String,
//     price: Number,
//     image_url: String,
//     type: String
// });

// const CartSchema = new Schema({
//     _id: Number,
//     user_id: Number,
//     items: [
//         {
//           food_item_id: Number,
//           quantity: Number
//         }
//     ]
// });

// const OrderSchema = new Schema({
//     _id: Number,
//     user_id: Number,
//     items: [
//         {
//             food_item_id: Number,
//             quantity: Number
//         }
//     ],
//     total_amount: Number,
//     delivery_address: String,
//     created_at: Date,
//     status: String
// });


exports.User = mongoose.model("User", UserSchema);

exports.Admin = mongoose.model("Admin", AdminSchema);

// exports.Food = mongoose.model("food", foodSchema);

// exports.Cart = mongoose.model("Cart", CartSchema);

// exports.Order = mongoose.model("Order", OrderSchema);