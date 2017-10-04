var bcrypt = require('bcryptjs');
var request = require('request');

var method = Registration.prototype;

var userId = 0, firstName, lastName, email, password, mobileNumber;

var verificationRequestCounter = 0;

function Registration(firstName, lastName, email, password, mobileNumber, verificationCode){
	this.userId = userId;
	this.firstName = firstName;
	this.lastName = lastName;
	this.email = email;
	this.password = password;
	this.mobileNumber = mobileNumber;
   // this.verificationCode = verificationCode;
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

// method.getVerificationCode = function(){
//    return this.verificationCode;
// }

// method.setVerificationCode = function(verificationCode){
//    this.verificationCode = verificationCode;
// }

module.exports = Registration;

module.exports.createUser = function(newUser, callback){
	bcrypt.genSalt(10, function(err, salt) {
		bcrypt.hash(newUser.password, salt, function(err, hash) {
			newUser.password = hash;
			request.post(
				'https://rest-quepro.herokuapp.com/api/registration',
				{ json: { firstName : newUser.firstName, lastName : newUser.lastName, email : newUser.email, password : newUser.password, mobileNumber : newUser.mobileNumber } },
				function (error, response, body) {
					if (!error && response.statusCode == 200) {
						userId = body.data.userid;
						callback(true);
					}
					else{
						callback(false, 'Registration Error');
					}
				}
				);
		});
	});
}

module.exports.accountVerification = function(verificationCode, callback){
			// match verification code
			request.post(
				"https://rest-quepro.herokuapp.com/api/accountVerification",
				{ json: { id : userId, verificationcode: verificationCode } },
				function (error, response, body) {
					if (!error && response.statusCode == 200) {
                    // insert data in users DB officially
                    method = "POST";
                    request.post(
                    	"https://rest-quepro.herokuapp.com/api/createUserAccount",
                    	{ json: body.data },
                    	function (error, response, body) {
                    		if (!error && response.statusCode == 200) {
                    			callback(true,'Your account is verified. Please login!');
                    		}else{
                    			console.log(error)
                    			callback(false, error);
                    		}
                    	}
                    	);
                }else{
                	callback(false, body.message);
                	console.log(body.message);
                }
            }
            );
		}

		module.exports.registrationValidation = function(email, mobileNumber, callback){
			request.post(
				"https://rest-quepro.herokuapp.com/api/registrationValidation",
				{ json: { email : email, mobileNumber: mobileNumber } },
				function (error, response, body) {
					console.log(body)
					if (!error && response.statusCode == 200) {
						verificationRequestCounter = 0;
						callback(true);   
					}else{
						callback(false, body.message);   
					}
				}
				);
		}

		module.exports.sendVerificationCode = function(callback){
			if (verificationRequestCounter < 3){
				var url = "https://rest-quepro.herokuapp.com/api/sendAccountVerificationSMSCode/" + userId;
			}else{
				var url = "https://rest-quepro.herokuapp.com/api/sendAccountVerificationEmailCode/" + userId;
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