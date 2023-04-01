var express = require('express');
const product = require('../model/product');
var router = express.Router();
var fs = require('fs-extra');

//Get product model
var Product = require('../model/product');

//Get all products/
router.get('/', async function(req, res) {
    try {
        const products = await Product.find();
        res.render('all_products', {
            title:"All products",
            products: products
        });
    } catch (err) {
        console.log(err);
    }
});

        

//Get product details by category
router.get('/:category:product', function(req, res){

    var galleryImages = null;

    Product.findOne({slug: req.params.products}, function(err, product){
        if(err) {
            console.log(err);
        } else {
            var galleryDir = 'public/product_images/'+product._id + 'gallery';

            fs.resddir(galleryDir, function(err, files) {
                if(err){
                    console.log(err);
                } else {
                    galleryImages = files;

                    res.render('product', {
                        title: product.title,
                        p: product,
                        galleryImages: galleryImages
                    });
                }
            });
        }
    });

});


module.exports = router;