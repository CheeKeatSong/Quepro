var bcrypt = require('bcryptjs');
var request = require('request');

var method = Users.prototype;

var userId, firstName, lastName, email, password, mobileNumber, smsInterval, smsActivation, pushInterval, pushActivation, points;

var verificationRequestCounter = 0;

function Users(){}

function Users(userId ,firstName, lastName, email, password, mobileNumber, smsInterval, smsActivation, pushInterval, pushActivation, points){
	this.userId = userId;
	this.firstName = firstName;
	this.lastName = lastName;
	this.email = email;
	this.password = password;
	this.mobileNumber = mobileNumber;
	this.smsInterval = smsInterval;
	this.smsActivation = smsActivation;
	this.pushInterval = pushInterval;
	this.pushActivation = pushActivation;
	this.points = points;
}

method.getUserId = function(){
	return this.userId;
}

method.setUserId = function(userId){
	this.userId = userId;
}

method.getFirstName = function(){
	return this.firstName;
}

method.setFirstName = function(firstName){
	this.firstName = firstName;
}

method.getLastName = function(){
	return this.lastName;
}

method.setLastName = function(lastName){
	this.lastName = lastName;
}

method.getEmail = function(){
	return this.email;
}

method.setEmail = function(email){
	this.email = email;
}

method.getPassword = function(){
	return this.password;
}

method.setPassword = function(password){
	this.password = password;
}

method.getMobileNumber = function(){
	return this.mobileNumber;
}

method.setMobileNumber = function(mobileNumber){
	this.mobileNumber = mobileNumber;
}

method.getSmsInterval = function(){
	return this.smsInterval;
}

method.setSmsInterval = function(smsInterval){
	this.smsInterval = smsInterval;
}

method.getSmsActivation = function(){
	return this.smsActivation;
}

method.setSmsActivation = function(smsActivation){
	this.smsActivation = smsActivation;
}

method.getPushInterval = function(){
	return this.pushInterval;
}

method.setPushInterval = function(pushInterval){
	this.pushInterval = pushInterval;
}
method.getPushActivation = function(){
	return this.pushActivation;
}

method.setPushActivation = function(pushActivation){
	this.pushActivation = pushActivation;
}

method.getPoints = function(){
	return this.points;
}

method.setPoints = function(points){
	this.points = points;
}

module.exports = Users;

module.exports.comparePassword = function(candidatePassword, hash, callback){
	bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
		if(err) throw err;
		callback(null, isMatch);
	});
}

module.exports.getUserByEmail = function(email, callback){
	method = "POST";
	request.post(
		"https://rest-quepro.herokuapp.com/api/loginCredentialRetrieval",
		{ json: { email : email} },
		function (error, response, body) {
			if (!error && response.statusCode == 200) {
				callback(true, 'User Retrieved', body.data);
			}else{
				callback(false, 'User does not exists');
			}
		}
		);
}

module.exports.getUserById = function(id, callback){
	method = "GET";
	request.get(
		"https://rest-quepro.herokuapp.com/api/getUserById/" + id,
		function (error, response, body) {

			if (!error && response.statusCode == 200) {
				var obj = JSON.parse(body);
				callback('User Retrieved', obj.data);
			}else{
				callback('User does not exists');
			}
		}
		);
}

module.exports.getUserByMobileNumber = function(mobileNumber, callback){
	verificationRequestCounter = 0;
	request.get(
		"https://rest-quepro.herokuapp.com/api/getUserByMobileNumber/" + mobileNumber,
		{ json: { mobileNumber : mobileNumber} },
		function (error, response, body) {
			console.log(body);
			if (!error && response.statusCode == 200) {
				callback(true, 'User Retrieved', body.data);
			}else{
				callback(false, 'Mobile Number is not registered');
			}
		}
		);
}

module.exports.sendVerificationCode = function(userId, callback){
	console.log(userId);
	if (verificationRequestCounter < 3){
		var url = "https://rest-quepro.herokuapp.com/api/sendPasswordResetSMSCode/" + userId;
	}else{
		var url = "https://rest-quepro.herokuapp.com/api/sendPasswordResetEmailCode/" + userId;
	}
	request.get(
		url,
		function (error, response, body) {
			if (!error && response.statusCode == 200) {
				console.log(body);
				if (verificationRequestCounter < 3){
					callback(true, 'Verification code is SMS to your mobile number');
				}else{
					callback(true, 'Verification code is sent to your email');
				}
				verificationRequestCounter++;
			}else{
				console.log(error);
				callback(false, 'Verification code request error');
			}
		}
		);
}

module.exports.passwordResetVerification = function(userId, verificationCode, callback){
	request.post(
		"https://rest-quepro.herokuapp.com/api/resetPasswordVerification",
		{ json: { id : userId, verificationCode: verificationCode } },
		function (error, response, body) {
			console.log(body);
			if (!error && response.statusCode == 200) {
				callback(true,'Verification success! Please change your password.');
			}else{
				callback(false, body.message);
			}
		}
		);
}

module.exports.resetPassword = function(userId, newPassword, callback){
	bcrypt.genSalt(10, function(err, salt) {
		bcrypt.hash(newPassword, salt, function(err, hash) {
			newPassword = hash;
			request.post(
				"https://rest-quepro.herokuapp.com/api/resetPassword",
				{ json: { id: userId,  newPassword: newPassword } },
				function (error, response, body) {
					if (!error && response.statusCode == 200) {
						callback(true, 'Successfully reset password!');
					}else{
						console.log(body);
						callback(false, 'Password reset fail!');
					}
				}
				);
		});
	});
}