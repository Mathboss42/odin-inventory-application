const Category = require('../models/category');
const Item = require('../models/item');

const async = require('async');
const { body, validationResult } = require("express-validator");

exports.categoryCreateGet = (req, res) => {
    res.render('categoryForm', { title: 'Create Category', category: undefined });
};

exports.categoryCreatePost = [
    body('categoryname', 'Name must not be empty.')
        .trim()
        .isLength({ min: 3, max: 100 })
        .escape(),
    body('categorydesc', 'Description must not be empty.')
        .trim()
        .isLength({ min: 3 })
        .escape(),
    
    (req, res, next) => {
        const errors = validationResult(req);

        const category = new Category({
            name: req.body.categoryname,
            description: req.body.categorydesc,
        });
        
        if (!errors.isEmpty()) {
            console.log('error');
            res.render('categoryForm', {
                title: 'Create Item',
                category,
                errors: errors.array(),
            });
            return;
        }

        category.save((err) => {
            if (err) {
              return next(err);
            }
            // Successful: redirect to new item record.
            res.redirect(category.url);
          });
    }
]

exports.categoryDeleteGet = (req, res) => {
    res.send('Not yet implemented.');
};

exports.categoryDeletePost = (req, res) => {
    res.send('Not yet implemented.');
};

exports.categoryUpdateGet = (req, res) => {
    res.send('Not yet implemented.');
};

exports.categoryUpdatePost = (req, res) => {
    res.send('Not yet implemented.');
};

exports.categoryDetail = (req, res, next) => {
    async.parallel(
        {
            category(callback) {
                Category.findById(req.params.id).exec(callback)
            },
            items(callback) {
                Item.find({ category: req.params.id }).exec(callback)
            },
        },
        (err, results) => {
            if (err) {
                return next(err);
            }

            if(results.category == null) {
                const err = new Error("Category not found");
                err.status = 404;
                return next(err);
            }

            res.render('categoryDetail', {
                title: results.category.name, 
                category: results.category, 
                items: results.items
            });
        }
    )
};

exports.categoryList = (req, res, next) => {
    Category.find()
        .sort({ name: 1})
        .exec(function(err, categoryList) {
            if (err) {
                return next(err);
            }
            console.log(categoryList)
            res.render('categoryList', { title : 'Category List', categoryList: categoryList });
        });
};