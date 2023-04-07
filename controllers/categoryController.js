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
];

exports.categoryDeleteGet = (req, res, next) => {
    async.parallel(
        {
            category(callback) {
                Category.findById(req.params.id).exec(callback);
            },
            items(callback) {
                Item.find({ category: req.params.id }).exec(callback);
            }
        },
        (err, results) => {
            if (err) {
                return next(err);
            }

            if (results.category == null) {
                res.redirect('/inventory/categories');
            }

            res.render('categoryDelete', {
                title: 'Delete Category',
                category: results.category,
                items: results.items,
            })
        }
    );
};

exports.categoryDeletePost = (req, res, next) => {
    async.parallel(
        {
            category(callback) {
                Category.findById(req.params.id).exec(callback);
            },
            items(callback) {
                Item.find({ category: req.params.id }).exec(callback);
            }
        },
        (err, results) => {
            if (err) {
                return next(err);
            }

            if (results.items.length > 0) {
                res.render('categoryDelete', {
                    title: 'Delete Category',
                    category: results.category,
                    items: results.items,
                });
                return;
            }

            Category.findByIdAndRemove(results.category._id, (err) => {
                if (err) {
                    return next(err);
                }

                res.redirect('/inventory/categories');
            });
        }
    );
};

exports.categoryUpdateGet = (req, res) => {
    Category.findById(req.params.id).exec((err, category) => {
        if (err) {
            return next(err);
        }

        if (category == null) {
            const err = new Error("Category not found");
            err.status = 404;
            return next(err);
        }

        res.render('categoryForm', {
            title: 'Create Category',
            category: category,
        })
    });
};

exports.categoryUpdatePost = [
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
            _id: req.params.id,
        });
        
        if (!errors.isEmpty()) {
            res.render('categoryForm', {
                title: 'Create Item',
                category,
                errors: errors.array(),
            });
            return;
        }

        Category.findByIdAndUpdate(req.params.id, category, {}, (err, thecategory) => {
            if (err) {
                return next(err);
            }

            res.redirect(thecategory.url);
        });
    }
];

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
            res.render('categoryList', { title : 'Category List', categoryList: categoryList });
        });
};