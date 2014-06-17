/** MAIN JS **/

window['console'] ? null : window['console'] = {log:function(){}};

$(document).ready(function(){

	console.log ('Main.Init');


	Video.Init.call(this, function() {
		console.log ('Video.Init.callback');
		// Columnzr.Recol.call(link.closest('.items')[0]);
	});

});