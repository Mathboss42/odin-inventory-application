const Item = require('../models/item');
const Category = require('../models/category');

const async = require('async');
const { body, validationResult } = require("express-validator");
const multer  = require('multer');
const upload = multer({ dest: 'public/images/' });

exports.itemCreateGet = (req, res, next) => {
    Category.find({}, 'name').exec((err, categories) => {
        if (err) {
            next(err);
        }

        res.render('itemForm', {
            title: 'Create Item',
            item: undefined,
            categories: categories, 
            restricted: false,
        });
    })
};

exports.itemCreatePost = [
    upload.single('itemimage'),

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
        console.log(req.file);

        let filename = null;
        if (req.file) {
            filename = req.file.filename;
        }

        const item = new Item({
            name: req.body.itemname,
            description: req.body.itemdesc,
            category: req.body.itemcategory,
            price: req.body.itemprice,
            numberInStock: req.body.itemstock,
            imageName: filename,
        });
        console.log(item);
        if (!errors.isEmpty()) {
            Category.find({}, 'name').exec((err, categories) => {
                if (err) {
                    next(err);
                }
                
                for (const category of categories) {
                    console.log(item.category);
                    if (item.category.toString() === category._id.toString()) {
                        category.selected = "true";
                    }
                }
        
                res.render('itemForm', {
                    title: 'Create Item',
                    item,
                    categories: categories,
                    restricted: false, 
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
];

exports.itemDeleteGet = (req, res, next) => {
    Item.findById(req.params.id).exec((err, item) => {
        if (err) {
            return next(err);
        }

        if (item == null) {
            res.redirect('/inventory/items');
        }

        res.render('itemDelete', { title: 'Delete Item', item });
    })
};

exports.itemDeletePost = [
    body('password', 'Wrong password')
        .trim()
        .isLength({ min: 1})
        .escape()
        .custom((value, { req }) => value === process.env.ADMIN_PASS),

    (req, res, next) => {
        const errors = validationResult(req);

        Item.findById(req.params.id).exec((err, item) => {
            if (err) {
                return next(err);
            }

            if (!errors.isEmpty()) {
                res.render('itemDelete', { title: 'Delete Item', item });
                return;
            }

            Item.findByIdAndRemove(item._id, (err) => {
                if (err) {
                    return next(err);
                }

                res.redirect('/inventory/items');
            });
        })
    }
];

exports.itemUpdateGet = (req, res, next) => {
    async.parallel(
        {
            item(callback) {
                Item.findById(req.params.id)
                    .populate('category')
                    .exec(callback);
            },
            categories(callback) {
                Category.find(callback);
            }
        },
        (err, results) => {
            if (err) {
                return next(er);
            }

            if (results.item == null) {
                // No results.
                const err = new Error("Item not found");
                err.status = 404;
                return next(err);
            }

            for (const category of results.categories) {
                if (category._id.toString() === results.item.category._id.toString()) {
                        category.selected = "true";
                }
            }

            res.render('itemForm', {
                title: 'Update Item',
                item: results.item,
                categories: results.categories,
                restricted: true,
            })
        }
    )
};

exports.itemUpdatePost = [
    upload.single('itemimage'),

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
    body('password', 'Wrong password')
        .trim()
        .isLength({ min: 1})
        .escape()
        .custom((value, { req }) => value === process.env.ADMIN_PASS),

    (req, res, next) => {
        const errors = validationResult(req);

        let filename = Item.findById(req.params.id).imageName;
        if (req.file) {
            filename = req.file.filename;
        }

        const item = new Item({
            name: req.body.itemname,
            description: req.body.itemdesc,
            category: req.body.itemcategory,
            price: req.body.itemprice,
            numberInStock: req.body.itemstock,
            imageName: filename,
            _id: req.params.id,
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
                    title: 'Update Item',
                    item,
                    categories: categories, 
                    restricted: true,
                    errors: errors.array(),
                });
            })
            return;
        }

        Item.findByIdAndUpdate(req.params.id, item, {}, (err, theitem) => {
            if (err) {
                return next(err);
            }

            res.redirect(theitem.url);
        })
    }
];

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