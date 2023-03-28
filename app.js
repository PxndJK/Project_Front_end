const express = require("express");
const app = express();
const bodyParser = require("body-parser");


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


app.listen(3000, function () {
    console.log("Server app listening on port");
  });