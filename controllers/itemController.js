const Item = require('../models/item');

const async = require('async');
const { body, validationResult } = require("express-validator");

exports.itemCreateGet = (req, res) => {
    res.send('Not yet implemented.');
};

exports.itemCreatePost = (req, res) => {
    res.send('Not yet implemented.');
};

exports.itemDeleteGet = (req, res) => {
    res.send('Not yet implemented.');
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

exports.itemDetail = (req, res) => {
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