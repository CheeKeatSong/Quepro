var bcrypt = require('bcryptjs');
// var jQuery = require('jquery');
// var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var request = require('request');

var method = Users.prototype;

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

module.exports.comparePassword = function(candidatePassword, hash, callback){
	bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
		if(err) throw err;
		callback(null, isMatch);
	});
}

