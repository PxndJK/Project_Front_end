var express = require("express");
var router = express.Router();
const check = require('request');
const mongoose = require("mongoose");
var flash = require('connect-flash');

//Get Category model
var Category = require('../model/category');
const category = require("../model/category");

//GET category Index
router.get("/", function (req, res) {
    Category.find({}).then((categories) => {
        res.render('../views/admin/categories', {
            categories: categories
        });
    }).catch(error => console.log(error));
});


//GET add category
router.get("/add-category", function (req, res) {
  var title = "";

  res.render("admin/add_category", {
    title: title
  });
});

//Post add category
router.post("/add-category", function (req, res) {
  req.checkBody("title", "Title must have a value").notEmpty();

  var title = req.body.title;
  var slug = title.replace(/\s+/g, "-").toLowerCase();
 
  var errors = req.validationErrors();

  if (errors) {
    
    res.render("admin/add_category", {
      errors: errors,
      title: title,
    });
  } else {
    Category.findOne({slug: slug})
    .then(category => {
        if(category) {
            req.flash('danger', 'Category title slug exists, choose another.');
            res.render("admin/add_category", {
                title: title,

              });
        } else {
            var category = new Category({
                title: title,
                slug: slug,
            });

            category.save()
                .then(() => {
                    req.flash('success', 'Category added!');
                    res.redirect('/admin/categories');
                })
                .catch(err => console.log(err));
        }
    })
    .catch(err => console.log(err));
  }
});

//GET edit category
router.get("/edit-category/:id", function (req, res) {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).send('Invalid object ID');
  }

  Category.findById(req.params.id).then((category) => {
      res.render("admin/edit_category",{
          title: category.title,
          id: category._id
      });
  }).catch(error => console.log(error));
});
    

//Post edit category
router.post("/edit-category/:id", function (req, res) {
    req.checkBody("title", "Title must have a value").notEmpty();

    var title = req.body.title;
    var slug = title.replace(/\s+/g, "-").toLowerCase();
    var id = req.params.id;

    var errors = req.validationErrors();
  
    if (errors) {
      
      res.render("admin/edit_category", {
        errors: errors,
        title: title,
        id: id
      });
    } else {
      Category.findOne({slug: slug, _id:{'$ne':id}})
      .then(category => {
          if(category) {
              req.flash('danger', 'Category title exists, choose another.');
              res.render("admin/edit_category", {
                  title: title,
                  id: id
                });
          } else {
            Category.findById(id)
            .then(category => {
              if (!category) {
                req.flash('danger', 'Page not found.');
                return res.redirect('/admin/page');
              }
          
              category.title = title;
              category.slug = slug;
          
              return category.save();
            })
            .then(() => {
              req.flash('success', 'Category edited!');
              res.redirect('/admin/categories');
            });
          }
      })
      .catch(err => console.log(err));
    }
  });
  
    
//GET delete Index
router.get("/delete-category/:id", async function (req, res) {
    try {
      const deletedCat = await Category.findByIdAndRemove(req.params.id);
      req.flash('success', 'Category deleted!');
      res.redirect('/admin/categories');
    } catch (err) {
      console.log(err);
      req.flash('danger', 'Error deleting page!');
      res.redirect('/admin/categories');
    }
  });


module.exports = router;
