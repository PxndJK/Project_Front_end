const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const flash = require('connect-flash');
const mongoose = require("mongoose");
const listUser = require("./model/listitem").User;
const listAdmin = require("./model/listitem").Admin;
// const listFood = require("./model/listitem").Food;
// const listCart = require("./model/listitem").Cart;
// const listOrder = require("./model/listitem").Order;
const session = require("express-session")
const at = require("./control/authen")
const atadmin = require("./control/authenad")

// Configure session middleware
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false
}));

app.use(flash());

mongoose.connect('mongodb://127.0.0.1:27017/Projectfontend')
.then(()=> console.log('Database is connected'))
.catch((e) => console.log(e));

app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
    secret: "jklfsodifjsktnwjasdp465dd", // Never ever share this secret in production, keep this in separate file on environmental variable
    variableresave: false,
    saveUninitialized: true,
    cookie: { maxAge: 3600000 }, //one hour
    mongoUrl : ({mongoUrl: "mongodb://127.0.0.1:27017/Projectfontend"}),
}));

app.get("/" ,(req,res) => {
    res.render("Home")
})

app.get("/" ,(req,res) => {
    res.render("cartnew")
})

app.get("/Home" ,(req,res) => {
    res.render("Home")
})


app.get('/HomeUser', at.authentication, async (req, res) => {
    try {
      const user = await listUser.findById(req.session.userId);
      if (user) {
        const username = user.Username;
        res.render('HomeUser', { Username: username }); //push data on ejs
      } else {
        res.redirect('/login'); 
      }
    } catch (error) {
      console.error('Error retrieving user:', error);
      res.status(500).send('Internal Server Error');
    }
});


  

app.get("/cartnew" ,(req,res) => {
    res.render("cartnew")
})

app.get('/Menu', at.authentication, async (req, res) => {
    try {
      const user = await listUser.findById(req.session.userId);
      if (user) {
        const username = user.Username;
        res.render('Menu', { Username: username });
      } else {
        res.redirect('/login'); 
      }
    } catch (error) {
      console.error('Error retrieving user:', error);
      res.status(500).send('Internal Server Error');
    }
});

app.get("/login" ,(req,res) => {
  res.render('login',{message: req.flash('message')})
})

app.get("/loginadmin" ,(req,res) => {
  res.render('loginadmin',{message: req.flash('message')})
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
        req.flash('message','Email or password is incorrect. please try again');
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
        res.redirect('/HomeUser');
       } else {
        req.flash('message','Email or password is incorrect. please try again');
        res.redirect('/login')
    }
})

app.get("/register" ,(req,res) => {
    res.render("register")
})

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

app.get("/Checkout" ,(req,res) => {
    res.render("Checkout")
})

app.get("/Tracking" ,(req,res) => {
    res.render("Tracking")
})

app.post('/logout',(req,res)=>{
    req.session.destroy(function (err) {
        res.redirect('/'); 
    });
})

app.listen(3000, function () {
    console.log("Server app listening on port");
  });