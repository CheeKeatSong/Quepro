//set button id on click to hide first modal
$("#confirm").on( "click", function() {
        $('#myModal1').modal('hide').fadeOut(350);  
});
//trigger next modal
$("#confirm").on( "click", function() {
        $('#myModal2').modal('show').fadeIn(350);  
});

$("#confirm-que").on( "click", function() {
       window.location.replace("main.html");
});

$("#skip-que").on( "click", function() {
       window.location.replace("main.html");
});

