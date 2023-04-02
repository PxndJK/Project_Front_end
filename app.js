const express = require("express");
const app = express();
const expressValidator = require('express-validator');
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const path = require('path');
const mongoose = require("mongoose");
const listUser = require("./model/listitem").User;
const listAdmin = require("./model/listitem").Admin;
const listFood = require("./model/listitem").Food;
const listCart = require("./model/listitem").Cart;
const listOrder = require("./model/listitem").Order;
const session = require("express-session");
const at = require("./control/authen")
const atadmin = require("./control/authenad")
var config = require('./config/database');
var request = require('request');
var fileUpload = require('express-fileupload')
const Cart = require('./model/cart').Cart;
const Order = require('./model/order').Order;




mongoose.connect(config.database)
.then(()=> console.log('Database is connected'))
.catch((e) => console.log(e));

app.use(express.static(__dirname + "/public"));
// app.set('views', path.join(__dirname, '/views'));
app.set("view engine", "ejs");



//Express fileUpload middleware
app.use(fileUpload());

//Body Parser middleware
//
//parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
//parse application/json
app.use(bodyParser.json())

// app.use(express.static(path.join(__dirname,'public')));
// app.use(express.static("public"));

app.use(session({
    secret: "jklfsodifjsktnwjasdp465dd", // Never ever share this secret in production, keep this in separate file on environmental variable
    variableresave: false,
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: 3600000 }, //one hour
    mongoUrl : ({mongoUrl: "mongodb+srv://pxndjj:Po44nd55@projectdd.6p3fk87.mongodb.net/Projectfontend"}),
}));

//Express Validator middleware
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
    var namespace = param.split('.')
    , root    = namespace.shift()
    , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  },
  customValidators: {
    isImage: function(value, filename){
      var extension = (path.extname(filename)).toLowerCase();
      switch(extension) {
        case '.jpg':
            return '.jpg';
        case '.jpeg':
            return '.jpeg';
        case '.png':
            return '.png';
        case '':
            return '.jpg';
        default:
            return false;
      }
    }
  }
}));

app.get('*', function(req, res,next) {
    res.locals.cart = req.session.cart;
    next();
})

// Express Messages middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});


app.get("/" ,(req,res) => {
    res.render("home")
})

// app.get("/" ,(req,res) => {
//     res.render("cartnew")
// })

app.get("/Home" ,(req,res) => {
    res.render("home")
})

app.post("/checkout", async (req, res) => {
  const userId = req.session.userId;

  try {
    // Find the user's cart
    const cart = await Cart.findOne({ userId: userId });

    if (!cart) {
      return res.status(400).send("No cart found for the user");
    }

    const userOrder = await Order.findOne({ userId: userId }).lean();

    if (!userOrder) {
      // Create a new order
      const newOrder = new Order({
        userId: userId,
        items: cart.items,
        orderDate: new Date(),
        status: 'Pending',
      });

      // Save the new order
      await newOrder.save();

      // Empty the user's cart
      cart.items = [];
      await cart.save();
      res.redirect("/checkoutss");
    } else {
      res.redirect('/checkoutss')
    }

  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal server error");
  }
});

app.get("/Checkoutss" ,(req,res) => {
    res.render("checkoutss")
})

app.get("/Tracking" ,(req,res) => {
    res.render("tracking")
})

app.get('/homeuser', at.authentication, async (req, res) => {
    try {
      const user = await listUser.findById(req.session.userId);
      if (user) {
        const username = user.Username;
        res.render('homeuser', { Username: username });
      } else {
        res.redirect('/login'); 
      }
    } catch (error) {
      console.error('Error retrieving user:', error);
      res.status(500).send('Internal Server Error');
    }
});


  

// app.get("/cartnew" ,(req,res) => {
//     res.render("cartnew")
// })

// app.get('/Menu', at.authentication, async (req, res) => {
//     try {
//       const user = await listUser.findById(req.session.userId);
//       if (user) {
//         const username = user.Username;
//         res.render('Menu', { Username: username });
//       } else {
//         res.redirect('/login'); 
//       }
//     } catch (error) {
//       console.error('Error retrieving user:', error);
//       res.status(500).send('Internal Server Error');
//     }
// });

app.get("/login" ,(req,res) => {
    res.render("login")
})

app.get("/loginadmin" ,(req,res) => {
    res.render("loginadmin")
})

app.post('/loginadmin', async (req,res)=>{
    const ademail  = req.body.emailAdressAdmin;
    const adpassword  = req.body.AdminPassword;
    const oldadmin = await listAdmin.findOne({ email: ademail, password: adpassword });
    if (oldadmin) {
        req.session.userId = oldadmin.id;
        console.log(req.session);
        res.redirect('/admin');
       } else {
        res.redirect('/loginadmin')
    }
})

app.post('/login', async (req,res)=>{
    const email  = req.body.emailAdress;
    const password  = req.body.UserPassword;
    const oldUser = await listUser.findOne({ email: email, password: password });
    if (oldUser) {
        req.session.userId = oldUser.id;
        console.log(req.session);
        res.redirect('/homeuser');
       } else {
        res.redirect('/login')
    }
})

app.get("/register" ,(req,res) => {
    res.render("register")
})

// app.get("/products" ,(req,res) => {
//   res.render("all")
// })

app.post('/register', async(req,res)=>{
    // User
    const  email  = req.body.emailAdress;
    const  password  = req.body.UserPassword;
    const  username = req.body.userName;
    // Admin
    // const  adminEmail  = req.body.emailAdress;
    // const  adminPassword  = req.body.UserPassword;
    // const  adminUsername = req.body.userName;
    // User
    const oldUser = await listUser.findOne({ email: email, password: password });
    // Admin
    // const oldAdminUser = await listAdmin.findOne({ email: adminEmail, password: adminPassword });
    // // User
    if (oldUser) {
        res.redirect('/login');
       } else {
        const newUser = new listUser({ email: email, password: password , Username: username}); 
        newUser.save();
        res.redirect('/login');
    }
    // Admin
    // if (oldAdminUser) {
    //     res.redirect('/login');
    //    } else {
    //     const newUser = new listAdmin({ email: adminEmail, password: adminPassword , Username: adminUsername}); 
    //     newUser.save();
    //     res.redirect('/login');


    // }
})

app.get("/admin" , atadmin.authenticationadmin, async (req,res) => {
    try {
        const admin = await listAdmin.findById(req.session.userId);
        if (admin) {
          res.render('admin');
        } else {
          res.redirect('/loginadmin'); 
        }
      } catch (error) {
        console.error('Error retrieving user:', error);
        res.status(500).send('Internal Server Error');
      }
})





var products = require('./routes/products.js');
// var adminPages = require('./routes/admin_pages.js');
var cart = require('./routes/cart.js');
var adminCategories = require('./routes/admin_categories.js');
var adminProducts = require('./routes/admin_products.js');

// app.use('/admin/pages', adminPages);
app.use('/admin/categories', adminCategories);
app.use('/admin/products', adminProducts);
app.use('/cart', cart);

app.use('/products', products);




app.post('/logout',(req,res)=>{
    req.session.destroy(function (err) {
        res.redirect('/'); 
    });
})

//set routes



app.listen(3000, function () {
    console.log("Server app listening on port");
  });