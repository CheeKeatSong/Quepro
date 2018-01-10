function changeBackgroundToGreenBlueGradient() {
	$('body').css('background-image', 'linear-gradient(rgb(104, 145, 162), rgb(12, 97, 33))');
	$('body').css('background-attachment', 'fixed');
}

function changeBackgroundToWhite() {
	$('body').css('background-attachment', 'none');
	$('body').css({ 'background-color': '#ffffff' });
	$('body').css('background-image', 'none');
	$('body').css('background-attachment', 'fixed');
}