const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const mongoose = require("mongoose");

mongoose.connect('mongodb://127.0.0.1:27017/todolistDB')
.then(()=> console.log('Database is connected'))
.catch((e) => console.log(e));


app.use(express.static(__dirname + "/public"));

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/" ,(req,res) => {
    res.render("Home")
})

app.get("/" ,(req,res) => {
    res.render("cartnew")
})

app.get("/Home" ,(req,res) => {
    res.render("Home")
})

app.get("/cartnew" ,(req,res) => {
    res.render("cartnew")
})

app.get("/Menu" ,(req,res) => {
    res.render("Menu")
})

app.get("/login" ,(req,res) => {
    res.render("login")
})

app.get("/register" ,(req,res) => {
    res.render("register")
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

app.listen(3000, function () {
    console.log("Server app listening on port");
  });