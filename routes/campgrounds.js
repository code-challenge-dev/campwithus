const express = require('express');
const router = express.Router();
const campgrounds = require('../controllers/campgrounds.js');
const catchAsync = require('../utils/catchAsync.js');
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware.js')
const multer  = require('multer');
const { storage } = require('../cloudinary')
const upload = multer({ storage });

const Campground = require('../models/campground.js');

router.route('/')
    .get(catchAsync(campgrounds.index))
    .post(isLoggedIn,
        upload.array('image'),
        validateCampground,
        catchAsync(campgrounds.createNewForm)),

router.get('/new', isLoggedIn, campgrounds.renderNewForm)

router.route('/:id')
    .get(catchAsync(campgrounds.showCampground))
    .put(isLoggedIn,
        isAuthor,
        upload.array('image'),
        validateCampground,
        catchAsync(campgrounds.updateCampground))
    .delete(isLoggedIn,
        isAuthor,
        catchAsync(campgrounds.destroyCampground))

router.get('/:id/edit',
    isLoggedIn,
    isAuthor,
    catchAsync(campgrounds.renderEditForm))

module.exports = router;