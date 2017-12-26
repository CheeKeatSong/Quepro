var express = require('express');
var router = express.Router();
var expressValidator = require('express-validator');
router.use(expressValidator());
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var request = require('request');
// var emailExistence = require('email-existence');

var Registration = require('../models/registration.js');
var Users = require('../models/users.js');

var newUser = new Users();
var newRegistration = new Registration();

// Register
router.get('/register', function(req, res){
	res.render('register');
});

// Login
router.get('/login', function(req, res){
	res.render('login');
});

// Forgot Password - mobile number
router.get('/password-reset-mobile-number', function(req, res){
	res.render('password-reset-mobile-number');
});

// Forgot Password - mobile number
router.post('/password-reset-mobile-number', function(req, res){
	
	var mobileNumber = req.body.mobileNumber;

	req.checkBody('mobileNumber', 'Mobile Number is required').notEmpty();
	req.checkBody('mobileNumber', 'This is not an existing mobile number').isMobilePhone("any"); // any locale
	var errors = req.validationErrors();

	Users.getUserByMobileNumber(mobileNumber, function(status, message, data) {
		if (status && !errors){
			newUser = new Users(data.userId,data.firstName,data.lastName,data.email,data.password,data.mobileNumber,data.smsInterval,data.smsActivation,data.pushInterval,data.pushActivation,data.points);
			Users.sendVerificationCode(newUser.getUserId(), function(status, message) {
				if (status){
					req.flash('success_msg', message);
					res.redirect('/users/password-reset-verification');	
				}else{
					req.flash('error_msg', message);
					res.redirect('/users/password-reset-mobile-number');	
				}
			});
		}else{
			res.render('password-reset-mobile-number',{
				errors:errors,
				errmsgs:[{errmsg:message}]
			});
		}
	});
});

// Forgot Password - password reset verification
router.get('/password-reset-verification', function(req, res){
	res.render('password-reset-verification');
});

// Forgot Password - password reset verification
router.post('/password-reset-verification', function(req, res){
	
	var verificationCode = req.body.verificationCode;

	req.checkBody('verificationCode', 'Verification Code is required').notEmpty();
	var errors = req.validationErrors();

	if(errors){
		res.render('password-reset-verification',{
			errors:errors
		});
	} else {
		Users.passwordResetVerification(newUser.getUserId(), verificationCode, function(status, message){
			if (status){
				req.flash('success_msg', message);
				res.redirect('/users/password-reset');	
			}else{
				res.render('password-reset-verification',{
					errmsgs:[{errmsg:message}]
				});
			}
		});
	}
});

// Forgot Password - send verification code
router.post('/send-password-reset-verification-code', function(req, res){
	Users.sendVerificationCode(newUser.getUserId(), function(status, message) {
		if (status){
			req.flash('success_msg', message);
			res.redirect('/users/password-reset-verification');	
		}else{
			req.flash('error_msg', message);
			res.redirect('/users/password-reset-verification');	
		}
	});
});

// Forgot Password - password reset
router.get('/password-reset', function(req, res){
	res.render('password-reset');
});

// Forgot Password - password reset
router.post('/password-reset', function(req, res){

	var newPassword = req.body.newPassword;
	var newPassword2 = req.body.newPassword2;

	req.checkBody('newPassword', 'Password is required').notEmpty();
	req.checkBody('newPassword', 'Password requires minumum 6 or maximum 18 characters').isLength({min:6, max: 18});
	req.checkBody('newPassword2', 'Passwords do not match').equals(newPassword);
	var errors = req.validationErrors();

	if(errors){
		res.render('password-reset',{
			errors:errors
		});
	} else {
		Users.resetPassword(newUser.getUserId(), newPassword, function(status, message){
			if (status){
				req.flash('success_msg', message);
				res.redirect('/users/login');	
			}else{
				res.render('password-reset',{
					errmsgs:[{errmsg:message}]
				});
			}
		});
	}
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
	req.checkBody('password', 'Password requires minumum 6 or maximum 18 characters').isLength({min:6, max: 18});
	req.checkBody('password2', 'Passwords do not match').equals(req.body.password);
	req.checkBody('mobileNumber', 'Mobile Number is required').notEmpty();
	req.checkBody('mobileNumber', 'This is not an existing mobile number').isMobilePhone("any"); // any locale
	var errors = req.validationErrors();

	// emailExistence.check(email, function(error, response){
	// 	console.log(response);
	// 	if (response == true){

	// 	}else{
	// 		res.render('register',{
	// 			errmsgs2:[{errmsg2:"Email does not exists!"}]
	// 		});
	// 	}
	// });

	Registration.registrationValidation(email,mobileNumber, function(status, message){
		if (status && !errors){
			newRegistration = new Registration(firstName,lastName,email,password,mobileNumber);
			Registration.createUser(newRegistration, function(status, message, id){
				if(status){
					newRegistration.setUserId(id);
					Registration.sendVerificationCode(newRegistration.getUserId(), function(status, message) {
						if (status){
							req.flash('success_msg', message);
							res.redirect('/users/account-verification');	
						}else{
							req.flash('error_msg', message);
							res.redirect('/users/account-verification');	
						}
					});
				}else{
					req.flash('error_msg', message);
					res.redirect('/users/account-verification');	
				}
			});
		}else{
			res.render('register',{
				errors:errors,
				errmsgs:[{errmsg:message}],
				firstName:firstName,
				lastName:lastName,
				email:email,
				mobileNumber:mobileNumber
			});
		}
	});
});

// Account Verification
router.get('/account-verification', function(req, res){
	res.render('account-verification');
});

// Account verification submit
router.post('/account-verification', function(req, res){

	var verificationCode = req.body.verificationCode;

	req.checkBody('verificationCode', 'Verification code is required').notEmpty();
	var errors = req.validationErrors();

	if(errors){
		res.render('account-verification',{
			errors:errors
		});
	} else {
		Registration.accountVerification(newRegistration.getUserId(), verificationCode, function(status, message){
			if (status){
				req.flash('success_msg', message);
				res.redirect('/users/login');	
			}else{
				res.render('account-verification',{
					errmsgs:[{errmsg:message}]
				});
			}
		});
	}
});

// Send verification code
router.post('/send-account-verification-code', function(req, res){
	Registration.sendVerificationCode(function(status, message) {
		if (status){
			req.flash('success_msg', message);
			res.redirect('/users/account-verification');	
		}else{
			req.flash('error_msg', message);
			res.redirect('/users/account-verification');	
		}
	});
});

passport.use(new LocalStrategy({
	usernameField: 'email',
	passwordField: 'password'},
	function(username, password, done) {
		Users.getUserByEmail(username, function(status, message, data) {
			if (status) {
				Users.comparePassword(password, data.password, function(err, isMatch){
					if(isMatch){
						var user = new Users(data.userId,data.firstName,data.lastName,data.email,data.password,data.mobileNumber,data.smsInterval,data.smsActivation,data.pushInterval,data.pushActivation,data.points);
						// req.flash('success_msg', 1'You are logged in');
						return done(null,user);
						// res.redirect('/');
					} else {
						return done(null, false, {message: 'Invalid password'});
						// console.log("failed");
						// req.flash('error_msg', 'Invalid password');
						// res.redirect('/users/login');
					}
				});
			}else{
				// req.flash('error_msg', 'Unknown User');
				// res.redirect('/users/login');
				return done(null, false, {message: 'Unknown User'});
			}
		})
	})
);

passport.serializeUser(function(user, done) {
	done(null, user.userId);
});

passport.deserializeUser(function(id, done) {
	Users.getUserById(id, function(message, data) {
		var user = new Users(data.userId, data.firstName,data.lastName,data.email,data.password,data.mobileNumber,data.smsInterval,data.smsActivation,data.pushInterval,data.pushActivation,data.points);
		done(null, user);
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