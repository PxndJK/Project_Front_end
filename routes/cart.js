var express = require("express");
var router = express.Router();
const Cart = require("../model/cart").Cart;

//Get product model
var Product = require("../model/product");

//Get add product to cart

router.get("/add/:product", function (req, res) {
  var slug = req.params.product;

  Product.findOne({ slug: slug })
    .exec()
    .then(async function (p) {
      if (!p) {
        console.log("Product not found");
        return res.redirect("/");
      }

      // if (typeof req.session.cart == "undefined") {
      //     let userId = req.session.userId;
      //     console.log(userId);
      //     // Find the cart of the user
      // let cart = await Cart.findOne({ userId: userId });

      // // If the cart does not exist, create a new cart for the user
      // if (!cart) {
      //     cart = new Cart({
      //     userId: userId,
      //     items: [],
      // });
      // }

      // req.session.cart = [];
      // req.session.cart.push({
      //     title: slug,
      //     qty: 1,
      //     price: parseFloat(p.price).toFixed(2),
      //     Image: '/product_images/' +p._id +'/' +p.image
      // });
      // cart.items.push({
      //     itemId: slug,
      //     quantity: 1
      // })
      // await cart.save();
      // } else {
      //     var cart = req.session.cart;
      //     var newItem = true;

      //     for(var i=0; i < cart.length; i++){
      //         if(cart[i].title == slug) {
      //             cart[i].qty++;
      //             newItem = false;
      //             break;
      //         }
      //     }

      //     if (newItem) {
      //         cart.items.push({
      //             itemId: slug,
      //             quantity: 1
      //         })
      //         await cart.save();
      //         cart.push({
      //             title: slug,
      //             qty: 1,
      //             price: parseFloat(p.price).toFixed(2),
      //             Image: '/product_images/' +p._id +'/' +p.image
      //         });
      //     }
      // }
      let userId = req.session.userId;

      let cart = await Cart.findOne({ userId: userId });

      // If the cart does not exist, create a new cart for the user
      if (!cart) {
        cart = new Cart({
          userId: userId,
          items: [],
        });
      }

      const existingItemIndex = cart.items.findIndex(
        (item) => item.itemId == slug
      );

      if (existingItemIndex !== -1) {
        // If the item is already in the cart, update its quantity
        cart.items[existingItemIndex].quantity += 1;
      } else {
        // If the item is not in the cart, add it with the specified quantity
        cart.items.push({ itemId: slug, quantity: 1 });
      }

      // Save the updated cart
      await cart.save();

      console.log(req.session.cart);
      req.flash("success", "Product added!");
      res.redirect("back");
    })
    .catch(function (err) {
      console.log(err);
      res.redirect("/");
    });
});

//Get checkout page
router.get("/checkout", async function (req, res) {
  let cart = await Cart.findOne({ userId: req.session.userId });
  const allMenu = await Product.find().lean();
  //   if (req.session.cart && req.session.cart.length == 0) {
  //     delete req.session.cart;
  //     res.redirect("/cart/checkout");
  //   } else {
  //     res.render("checkout", {
  //       title: "Checkout",
  //       cart: req.session.cart,
  //     });
  //   }
  // console.log(cart)
  res.render("checkout", {
    title: "Checkout",
    cart: cart,
    menus: allMenu,
  });
});

//Get Update product
router.get("/update/:product", function (req, res) {
  var slug = req.params.product;
  var cart = req.session.cart;
  var action = req.query.action;

  for (var i = 0; i < cart.length; i++) {
    if (cart[i].title == slug) {
      switch (action) {
        case "add":
          cart[i].qty++;
          break;
        case "remove":
          cart[i].qty--;
          if (cart[i].qty < 1) cart.splice(i, 1);
          break;
        case "clear":
          cart.splice(i, 1);
          if (cart.length == 0) delete req.session.cart;
          break;
        default:
          console.log("update problem");
          break;
      }
      break;
    }
  }

  req.flash("success", "Cart updated!");
  res.redirect("/cart/checkout");
});

module.exports = router;
