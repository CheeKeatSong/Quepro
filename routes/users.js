var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var request = require('request');

var Registration = require('../models/registration.js');

var registrationId = 0;
var verificationRequestCounter = 0;

// var registrationId = ;
// var verificationRequestCounter = 0;

// Register
router.get('/register', function(req, res){
	res.render('register');
});

// Login
router.get('/login', function(req, res){
	res.render('login');
});

// Register User
router.post('/register', function(req, res){
	var firstName = req.body.firstName;
	var lastName = req.body.lastName;
	var email = req.body.email;
	var password = req.body.password;
	var password2 = req.body.password2;
	var mobileNumber = req.body.mobileNumber;

	// Validation - Error on heroku
	req.checkBody('firstName', 'First name is required').notEmpty();
	req.checkBody('lastName', 'Last name is required').notEmpty();
	req.checkBody('email', 'Email is required').notEmpty();
	req.checkBody('email', 'Email is not valid').isEmail();
	req.checkBody('password', 'Password is required').notEmpty();
	req.checkBody('password2', 'Passwords do not match').equals(req.body.password);
	req.checkBody('mobileNumber', 'Mobile Number is required').notEmpty();

	var errors = req.validationErrors();

	if(errors){
		res.render('register',{
			errors:errors
		});
	} else {

		var newRegistration = new Registration(firstName,lastName,email,password,mobileNumber);

		// newRegistration.setFirstName = firstName;
		// newRegistration.setLastName = lastName;
		// newRegistration.setEmail = email;
		// newRegistration.setPassword = password;
		// newRegistration.setMobileNumber = mobileNumber;

		Registration.createUser(newRegistration, function(err, user){
			if(err) throw err;
			console.log(user);
		});

		res.redirect('/users/account-verification');

		registrationId = Registration.retrieveId();
		request.get(
			"https://rest-quepro.herokuapp.com/api/resendSMSCode/" + registrationId,
			function (error, response, body) {
				if (!error && response.statusCode == 200) {
					console.log(body)
				}
			}
			);
	}
});

// Account Verification
router.get('/account-verification', function(req, res){
	res.render('account-verification');
});

// Account verification submit
router.post('/account-verification', function(req, res){

	var verificationCode = req.body.verificationCode;
	// Validation - Error on heroku
	req.checkBody('verificationCode', 'Verification code is required').notEmpty();

	var errors = req.validationErrors();

	if(errors){
		res.render('account-verification',{
			errors:errors
		});
	} else {
		// match verification code
		method = "POST";
		request.post(
			url,
			{ json: { id : registrationId, verificationCode: verificationCode } },
			function (error, response, body) {
				if (!error && response.statusCode == 200) {
                    // insert data in users DB officially
                    method = "POST";
                    request.post(
                    	url,
                    	{ json: body },
                    	function (error, response, body) {
                    		if (!error && response.statusCode == 200) {
                    			req.flash('success_msg', 'Your account is verified. Please login!');
                    			res.redirect('/users/login');
                    		}else{
                    			req.flash('error_msg', error);	
                    		}
                    	}
                    	);
                }else{
                	req.flash('error_msg', 'Verification code does not matched!');
                }
            }
            );
	}
});

// Send verification code
router.post('/send-verification-code', function(req, res){

	verificationRequestCounter++;
	registrationId = Registration.retrieveId();

	if (verificationRequestCounter < 4){
		var url = "https://rest-quepro.herokuapp.com/api/resendSMSCode/" + registrationId;
	}else{
		var url = "https://rest-quepro.herokuapp.com/api/resendEmailCode/" + registrationId;
	}
	method = "GET";

	request.get(
		url,
		function (error, response, body) {
			if (!error && response.statusCode == 200) {
				console.log(body)
			}
		}
		);
});

passport.use(new LocalStrategy(
	function(username, password, done) {
		User.getUserByUsername(username, function(err, user){
			if(err) throw err;
			if(!user){
				return done(null, false, {message: 'Unknown User'});
			}

			User.comparePassword(password, user.password, function(err, isMatch){
				if(err) throw err;
				if(isMatch){
					return done(null, user);
				} else {
					return done(null, false, {message: 'Invalid password'});
				}
			});
		});
	}));

passport.serializeUser(function(user, done) {
	done(null, user.id);
});

passport.deserializeUser(function(id, done) {
	User.getUserById(id, function(err, user) {
		done(err, user);
	});
});

router.post('/login',
	passport.authenticate('local', {successRedirect:'/', failureRedirect:'/users/login',failureFlash: true}),
	function(req, res) {
		res.redirect('/');
	});

router.get('/logout', function(req, res){
	req.logout();

	req.flash('success_msg', 'You are logged out');

	res.redirect('/users/login');
});

module.exports = router;