	
	window["console"] ? null : window["console"] = {log:function(){}};

	var ua = {
		ua:window.navigator.userAgent.toLowerCase(),
		init:function () {
			var tt = window["ua"];
			var ua = tt.ua;
			tt.webkit = ua.indexOf('webkit')!=-1;
			if(!tt.webkit) {
				tt.msie = ua.indexOf('msie')!=-1;
				if(!tt.msie) {
					tt.firefox = ua.indexOf('firefox')!=-1;
					if (!tt.firefox) {
						tt.opera = ua.indexOf('opera')!=-1;
					} else {
						tt.moz = true;
					}
				} else {
					tt.ie10 = ua.indexOf('msie 10')!=-1;
					tt.ie9 = ua.indexOf('msie 9')!=-1;
					tt.ie8 = ua.indexOf('msie 8')!=-1;
					tt.ie7 = ua.indexOf('msie 7')!=-1;
					tt.ie6 = ua.indexOf('msie 6')!=-1;
				}
			} else {
				tt.ios = (ua.match(/(ipad|iphone|ipod)/i)?true:false);
				if(!tt.ios) {
					tt.chrome = ua.indexOf('chrome')!=-1;
					if (!tt.chrome) {
						tt.safari = ua.indexOf('safari')!=-1 && !tt.chrome;								
					} else {
						var canvas = document.createElement('canvas'), gl;
						try {
							gl = canvas.getContext("experimental-webgl");
							gl.viewportWidth = canvas.width;
							gl.viewportHeight = canvas.height;
						} catch ($e) {}
						if (gl) {
							tt.chromewebgl = true;
						}
					}
				} else {
					tt.iphone = ua.indexOf('iphone')!=-1;
					tt.ipad = ua.indexOf('ipad')!=-1;
					tt.ipod = ua.indexOf('ipod')!=-1;								
				}
			}
			tt.mobile = ua.indexOf('mobile')!=-1;
			tt.win = ua.indexOf('win')!=-1;
			if (tt.mobile) {
				if ((screen.width > 960 || screen.height > 960) && !tt.iphone && !tt.ipod) {
					tt.tablet = true;
				} else {
					tt.phone = true;
				}
			} else {
				tt.desktop = true;
			}
			var browsers = [];
			for (var k in tt) {
				if (tt[k] === true) {
					browsers.push (k);
				}
			}
			function onSetHtmlClasses () {
				var hh = document.getElementsByTagName("html")[0];
				var c = hh.getAttribute('class');
				cc = document.createAttribute('class');
				cc.value = c ? c + ' ' + browsers.join(' ') : browsers.join(' ');
				// alert('['+cc.value+']');
				console.log ('ua ['+cc.value+']');
				hh.setAttributeNode(cc);	
				// alert ('UA ['+browsers.join(', ')+']');		
			}
			onSetHtmlClasses ();
			/*
			function onReady ($callback){
				var addListener = document.addEventListener || document.attachEvent,
					removeListener =  document.removeEventListener || document.detachEvent
					$e = document.addEventListener ? "DOMContentLoaded" : "onreadystatechange",
					callback = function(){
						removeListener.call(document, $e);
						$callback();
					};	
				addListener.call(document, $e, callback, false);
			}
			onReady (onSetHtmlClasses);
			*/			
		}
	};
	ua.init ();
	window["ua"] = ua;
