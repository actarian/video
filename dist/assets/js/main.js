/** MAIN JS **/

window['console'] ? null : window['console'] = {log:function(){}};

var s = skrollr.init({
	smoothScrolling : true,
	forceHeight: true, 
	edgeStrategy: 'bounce'
});

$(document).ready(function(){

	console.log ('Main.Init');

});