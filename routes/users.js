var express = require('express');
var router = express.Router();
var expressValidator = require('express-validator');
router.use(expressValidator());
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var request = require('request');

var Registration = require('../models/registration.js');
var User = require('../models/users.js');

var registrationId = 0;
var verificationRequestCounter = 0;

// Register
router.get('/register', function(req, res){
	res.render('register');
});

// Login
router.get('/login', function(req, res){
	res.render('login');
});

// Forgot Password
router.post('/forgot-password', function(req, res){

});

// Login
router.post('/login', function(req, res){
	var email = req.body.email;
	var password = req.body.password;

	if (req.body.email == ""||req.body.password == ""){
		req.flash('error_msg', 'Missing Credential');
		res.redirect('/users/login');
	}else{
		method = "POST";
		request.post(
			"https://rest-quepro.herokuapp.com/api/loginCredentialRetrieval",
			{ json: { email : email} },
			function (error, response, body) {
				if (!error && response.statusCode == 200) {

					console.log(body.data.password + "    " + password);

					User.comparePassword(password, body.data.password, function(err, isMatch){
						if(isMatch){
							console.log("success");

							var user = new Users(body.data.userId, body.data.firstName,body.data.lastName,body.data.email,body.data.password,body.data.mobileNumber,body.data.smsInterval,body.data.smsActivation,body.data.pushInterval,body.data.pushActivation,body.data.points);

							req.flash('success_msg', 'You are logged in');
							return done(null,user);
							res.redirect('/');
						} else {
							console.log("failed");
							req.flash('error_msg', 'Invalid password');
							res.redirect('/users/login');
						}
					});
				}else{
					req.flash('error_msg', 'Unknown User');
					res.redirect('/users/login');
				}
			}
			);
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

	method = "POST";
	request.post(
		"https://rest-quepro.herokuapp.com/api/registrationValidation",
		{ json: { email : email, mobileNumber: mobileNumber } },
		function (error, response, body) {
			if (!errors && !error && response.statusCode == 200) {

				verificationRequestCounter = 0;

				var newRegistration = new Registration(firstName,lastName,email,password,mobileNumber);

				Registration.createUser(newRegistration, function(err, user){
					if(err) throw err;
					console.log(user);
				});

				req.flash('success_msg', 'Verification code is SMS to your mobile number');
				res.redirect('/users/account-verification');	
			}else{

				res.render('register',{
					errors:errors,
					errmsgs:[{errmsg:body.message}]
				});

			}
		}
		);
});

// Account Verification
router.get('/account-verification', function(req, res){
	res.render('account-verification');
});

// Account verification submit
router.post('/account-verification', function(req, res){

	var verificationCode = req.body.verificationCode;
	registrationId = Registration.retrieveId();

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
			"https://rest-quepro.herokuapp.com/api/accountVerification",
			{ json: { id : registrationId, verificationcode: verificationCode } },
			function (error, response, body) {
				if (!error && response.statusCode == 200) {
					console.log(2 + " " + response.statusCode + verificationCode + body.data.verificationcode);
                    // insert data in users DB officially
                    method = "POST";
                    request.post(
                    	"https://rest-quepro.herokuapp.com/api/createUserAccount",
                    	{ json: body.data },
                    	function (error, response, body) {
                    		console.log(3 + " " + response.statusCode);
                    		if (!error && response.statusCode == 200) {
                    			console.log(4 + "registration succeed");
                    			req.flash('success_msg', 'Your account is verified. Please login!');
                    			res.redirect('/users/login');
                    		}else{
                    			console.log(error)
                    			req.flash('error_msg', error);	
                    		}
                    	}
                    	);
                }else{
                	console.log(error)
                	req.flash('error_msg', 'Verification code does not matched!');
                }
            }
            );
	}
});

// Send verification code
router.post('/send-verification-code', function(req, res){

	registrationId = Registration.retrieveId();

	if (verificationRequestCounter < 3){
		var url = "https://rest-quepro.herokuapp.com/api/resendSMSCode/" + registrationId;
	}else{
		var url = "https://rest-quepro.herokuapp.com/api/resendEmailCode/" + registrationId;
	}
	method = "GET";

	request.get(
		url,
		function (error, response, body) {
			if (!error && response.statusCode == 200) {
				if (verificationRequestCounter < 3){
					req.flash('success_msg', 'Verification code is SMS to your mobile number');
				}else{
					req.flash('success_msg', 'Verification code is sent to your email');
				}
				verificationRequestCounter++;
				res.redirect('/users/account-verification');	
				// res.render('account-verification');
			}
		}
		);
});

// passport.use(new LocalStrategy(
// 	function(email, password, done) {

// console.log(email);
// console.log(password);
// 		var email = req.body.email;
// 		var password = req.body.password;

// 		method = "POST";
// 		request.post(
// 			"https://rest-quepro.herokuapp.com/api/registrationValidation",
// 			{ json: { email : email} },
// 			function (error, response, body) {
// 				if (!error && response.statusCode == 200) {

// 					User.comparePassword(password, body.data.password, function(err, isMatch){
// 						if(isMatch){
// 							return done(null, body.data);
// 						} else {
// 							return done(null, false, {message: 'Invalid password'});
// 						}
// 					});
// 				}else{
// 					return done(null, false, {message: 'Unknown User'});
// 				}
// 			}
// 			);

// 		// User.getUserByUsername(username, function(err, user){
// 		// 	if(err) throw err;
// 		// 	if(!user){
// 		// 		return done(null, false, {message: 'Unknown User'});
// 		// 	}

// 		// });
// 	}));

// passport.serializeUser(function(user, done) {
// 	done(null, user.id);
// });

// passport.deserializeUser(function(id, done) {
// 	User.getUserById(id, function(err, user) {
// 		done(err, user);
// 	});
// });

// router.post('/login',
// 	passport.authenticate('local', {successRedirect:'/', failureRedirect:'/users/login',failureFlash: true}),
// 	function(req, res) {

// 		res.redirect('/');
// 	});

router.get('/logout', function(req, res){
	req.logout();

	req.flash('success_msg', 'You are logged out');

	res.redirect('/users/login');
});

module.exports = router;