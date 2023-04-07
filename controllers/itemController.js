const Item = require('../models/item');
const Category = require('../models/category');

const async = require('async');
const { body, validationResult } = require("express-validator");

exports.itemCreateGet = (req, res, next) => {
    Category.find({}, 'name').exec((err, categories) => {
        if (err) {
            next(err);
        }

        res.render('itemForm', {
            title: 'Create Item',
            categories: categories, 
        });
    })
};

exports.itemCreatePost = [
    body('itemname', 'Name must not be empty.')
        .trim()
        .isLength({ min: 3, max: 100 })
        .escape(),
    body('itemdesc', 'Description must not be empty.')
        .trim()
        .isLength({ min: 3 })
        .escape(),
    body('itemcategory', 'Description must not be empty.')
        .trim()
        .isLength({ min: 3 })
        .escape(),
    body('itemprice', 'Price must not be empty.')
        .trim()
        .isLength({ min: 1})
        .escape(),
    body('itemstock', 'Stock must not be empty.')
        .trim()
        .isLength({ min: 1 })
        .escape(),

    (req, res, next) => {
        const errors = validationResult(req);

        const item = new Item({
            name: req.body.itemname,
            description: req.body.itemdesc,
            category: req.body.itemcategory,
            price: req.body.itemprice,
            numberInStock: req.body.itemstock,
        });
        
        if (!errors.isEmpty()) {
            Category.find({}, 'name').exec((err, categories) => {
                if (err) {
                    next(err);
                }
                
                for (const category of categories) {
                    if (item.category.toString() === category._id.toString()) {
                        category.selected = "true";
                    }
                }
        
                res.render('itemForm', {
                    title: 'Create Item',
                    item,
                    categories: categories, 
                    errors: errors.array(),
                });
            })
            return;
        }
        item.save((err) => {
            if (err) {
              return next(err);
            }
            // Successful: redirect to new item record.
            res.redirect(item.url);
          });
    }
]

exports.itemDeleteGet = (req, res) => {
    Item.findById(req.params.id).exec((err, item) => {
        res.render('itemDelete', { title: 'Delete Item', item });
    })
};

exports.itemDeletePost = (req, res) => {
    res.send('Not yet implemented.');
};

exports.itemUpdateGet = (req, res) => {
    res.send('Not yet implemented.');
};

exports.itemUpdatePost = (req, res, next) => {
    res.send('Not yet implemented.');
};

exports.itemDetail = (req, res, next) => {
    Item.findById(req.params.id)
        .populate('category')
        .exec(function(err, item) {
            if (err) {
                return next(err);
            }

            if (item == null) {
                const err = new Error("Item not found");
                err.status = 404;
                return next(err);
            }

            res.render('itemDetail', { title: item.name, item: item });
        });
};

exports.itemList = (req, res, next) => {
    Item.find({}, 'name description')
        .sort({ name: 1})
        .populate('category')
        .exec(function(err, itemList) {
            if (err) {
                return next(err);
            }
            res.render('itemList', { title : 'Item List', itemList: itemList });
        });
};