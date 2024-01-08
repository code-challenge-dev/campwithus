const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const passport = require('passport');
const { storeReturnTo } = require('../middleware');
const users = require('../controllers/users.js');
const User = require('../models/user');

router.route('/register')
    .get(users.renderRegister)
    .post(catchAsync(users.registerUser))

router.route('/login')
    .get(users.renderLogin)
    .post(
        // using the storeReturnTo middleware to save the returnTo value from session to res.locals
        storeReturnTo,
        // passport.authenticate logs the user in and clears req.session
        passport.authenticate('local', {failureFlash: true, failureRedirect: '/login'}),
        // using res.locals.returnTo to redirect the user after login
        users.loginUser)

router.get('/logout', users.logoutUser); 

module.exports = router;