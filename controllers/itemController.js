const Item = require('../models/item');
const Category = require('../models/item');

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

exports.itemUpdatePost = (req, res) => {
    res.send('Not yet implemented.');
};

exports.itemDetail = (req, res) => {
    res.send('Not yet implemented.');
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