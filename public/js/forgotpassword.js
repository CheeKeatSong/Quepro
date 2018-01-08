 function validateEmail($email) {
  var emailReg = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
  return emailReg.test( $email );
}

 
$("#reset-password").on( "click", function(event) {
	event.preventDefault();	
     var email = $("#email").val();
	 if(!validateEmail(email)){
		alert("Insert all the fields");
	} else{
		alert(" all the fields");

	}
});

