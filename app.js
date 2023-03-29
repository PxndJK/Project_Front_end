const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const mongoose = require("mongoose");
const listUser = require("./model/listitem").User;
const listFood = require("./model/listitem").Food;
const listCart = require("./model/listitem").Cart;
const listOrder = require("./model/listitem").Order;
const session = require("express-session")
const at = require("./control/authen")
mongoose.connect('mongodb://127.0.0.1:27017/todolistDB')
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
    mongoUrl : ({mongoUrl: "mongodb://127.0.0.1:27017/todolistDB"}),
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
        // console.log(`User ${username}`);
        res.render('HomeUser', { Username: username });
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
        // console.log(`User ${username}`);
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
    res.render("login")
})

app.post('/login', async (req,res)=>{
    const email  = req.body.emailAdress;
    const password  = req.body.UserPassword;
    const oldUser = await listUser.findOne({ email: email, password: password });
    if (oldUser) {
        req.session.userId = oldUser.id;
        console.log(req.session);
        // console.log(`Username: ${oldUser.Username}`)
        res.redirect('/HomeUser');
       } else {
        res.redirect('/login')
    }
})

app.get("/register" ,(req,res) => {
    res.render("register")
})

app.post('/register', async(req,res)=>{

    const  email  = req.body.emailAdress;
    const  password  = req.body.UserPassword;
    const  username = req.body.userName;

    const oldUser = await listUser.findOne({ email: email, password: password });

    if (oldUser) {
        res.redirect('/login');
       } else {
        const newUser = new listUser({ email: email, password: password , Username: username}); 
        newUser.save();
        res.redirect('/login');


    }
})

app.get("/admin" ,(req,res) => {
    res.render("admin")
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