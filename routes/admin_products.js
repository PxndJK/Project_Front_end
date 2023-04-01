var express = require("express");
var router = express.Router();
const check = require('request');
const mongoose = require("mongoose");
var flash = require('connect-flash');
var mkdirp = require('mkdirp')
var fs = require('fs-extra')
var resizeImg = require('resize-img')

//Get page model
var Product = require('../model/product');

//Get Category model
var Category = require('../model/category');

//GET products Index
router.get("/", async function (req, res) {
  try {
      const count = await Product.countDocuments();
      const products = await Product.find();
      res.render('admin/products', {
          products: products,
          count: count
      });
  } catch (error) {
      console.error(error);
      res.status(500).send("Internal server error");
  }
});


//GET add product
router.get("/add-product", async function (req, res) {
  try {
      const categories = await Category.find();
      res.render("admin/add_product", {
          title: "",
          desc: "",
          categories: categories,
          price: ""
      });
  } catch (error) {
      console.error(error);
      res.status(500).send("Internal server error");
  }
});

//Post add product
router.post("/add-product", function (req, res) {

  var imageFile = typeof req.files.image !== "undefined" ? req.files.image.name : "";

  req.checkBody("title", "Title must have a value").notEmpty();
  req.checkBody("desc", "Description must have a value").notEmpty();
  req.checkBody("price", "Price must have a value").isDecimal();
  req.checkBody('image', "You must upload an image").isImage(imageFile);

  var title = req.body.title;
  slug = title.replace(/\s+/g, "-").toLowerCase();
  var desc = req.body.desc;
  var price = req.body.price;
  var category = req.body.category;

  var errors = req.validationErrors();

  if (errors) {
    Category.find()
      .exec()
      .then(categories => {
        res.render("admin/add_product", {
          errors: errors,
          title: title,
          desc: desc,
          categories: categories,
          price: price
        });
      })
      .catch(err => console.log(err));
  } else {
    Product.findOne({slug: slug})
      .then(product => {
        if(product) {
          req.flash('danger', 'Product title exists, choose another.');
          Category.find()
            .exec()
            .then(categories => {
              res.render("admin/add_product", {
                errors: errors,
                title: title,
                desc: desc,
                categories: categories,
                price: price
              });
            })
            .catch(err => console.log(err));
        } else {
          var price2 = parseFloat(price).toFixed(2);
          var product = new Product({
            title: title,
            slug: slug,
            desc: desc,
            price: price2,
            category: category,
            image: imageFile
          });

          product.save()
            .then(() => {
              mkdirp.sync('public/product_images/'+product._id);

              mkdirp.sync('public/product_images/'+product._id + '/gallery');

              mkdirp.sync('public/product_images/'+product._id + '/gallery/thumbs');

              if (imageFile != "") {
                var productImage = req.files.image;
                var path = 'public/product_images/' + product._id + '/' + imageFile;

                productImage.mv(path, function(err){
                  if (err) {
                    console.log(err);
                  }
                });
              }

              req.flash('success', 'Product added!');
              res.redirect('/admin/products');
            })
            .catch(err => console.log(err));
        }
      })
      .catch(err => console.log(err));
  }
});

//GET edit product
router.get("/edit-product/:id", async function (req, res) {
  var errors;

  if (req.session.errors) errors = req.session.errors;
  req.session.errors = null;

  try {
    const categories = await Category.find();
    const p = await Product.findById(req.params.id);
    const galleryDir = 'public/product_images/' + p._id + '/gallery';
    let galleryImages = null;

    try {
      const files = await fs.promises.readdir(galleryDir);
      galleryImages = files;
    } catch (err) {
      console.log(err);
    }

    res.render("admin/edit_product", {
      title: p.title,
      errors: errors,
      desc: p.desc,
      categories: categories,
      category: p.category.replace(/\s+/g, "-").toLowerCase(),
      price: parseFloat(p.price).toFixed(2),
      image: p.image,
      galleryImages: galleryImages,
      id: p._id
    });
  } catch (err) {
    console.log(err);
    res.redirect('/admin/products');
  }
});
    

//Post edit product
router.post("/edit-product/:id", async function (req, res) {
  try {
    var imageFile = typeof req.files.image !== "undefined" ? req.files.image.name : "";

    req.checkBody("title", "Title must have a value").notEmpty();
    req.checkBody("desc", "Description must have a value").notEmpty();
    req.checkBody("price", "Price must have a value").isDecimal();
    req.checkBody('image', "You must upload an image").isImage(imageFile);

    var title = req.body.title;
    slug = title.replace(/\s+/g, "-").toLowerCase();
    var desc = req.body.desc;
    var price = req.body.price;
    var category = req.body.category;
    var pimage = req.body.pimage;
    var id = req.params.id;

    var errors = req.validationErrors();

    if(errors) {
      req.session.errors = errors;
      res.redirect('/admin/products/edit-product/' +id);
    } else {
      const existingProduct = await Product.findOne({slug: slug, _id:{'$ne':id}}).exec();

      if(existingProduct) {
        req.flash('danger', 'Product title exists, choose another.');
        res.redirect('/admin/products/edit-product/'+id);
      } else {
        const product = await Product.findById(id).exec();

        product.title = title;
        product.slug = slug;
        product.desc = desc;
        product.price = parseFloat(price).toFixed(2);
        product.category = category;

        if(imageFile != "") {
          product.image = imageFile;
        }

        await product.save();

        if(imageFile != "") {
          if(pimage != "") {
            await fs.remove('public/product_images/' + id +'/' +pimage);
          }

          var productImage = req.files.image;
          var path = 'public/product_images/' + product._id + '/' + imageFile;

          await productImage.mv(path);
        }

        req.flash('success', 'Product edited!');
        res.redirect('/admin/products/edit-product/' + id);
      }
    }
  } catch (err) {
    console.log(err);
    res.redirect('/admin/products');
  }
});
  
    
//GET delete Index
router.get("/delete-product/:id", async function (req, res) {
  try {
    const id = req.params.id;
    const path = 'public/product_images/' + id;

    await fs.promises.rm(path, { recursive: true });

    await Product.findByIdAndRemove(id);
    
    req.flash('success', 'Product deleted!');
    res.redirect('/admin/products/');
  } catch (err) {
    console.log(err);
    res.redirect('/admin/products/');
  }
});


module.exports = router;
