
	var Styler = function () {

		// CONST
		var media = {
			xs: 0,
			sm: 1,
			md: 2,
			lg: 3
		}
		var queries = {
			xs: [0,767],
			sm: [768,991],
			md: [992,1199],
			lg: [1200,20000]			
		}

		var win = {w:0, h:0, m:0}, rules = {}, sequence = [], callbacks = [];

		var styleSheet, mediaType, M;

		function getMedia($w) {
			var m = 'xs';
			for (var p in queries) {
				if ($w>= queries[p][0] && $w<= queries[p][1]) {
					m = p;
				}
			}
			return media[m];
		}

		function Resize() {
			win.w = document.documentElement.clientWidth;
			win.h = document.documentElement.clientHeight;
			win.m = getMedia(win.w);
			Callback();
		}
		window.addEventListener ? window.addEventListener('resize', function(event){
			Resize ();
		}) : window.attachEvent('onresize', function(event){
			Resize ();
		});
		Resize ();

		function Callback () {
			var i;
			for (i = 0; i < sequence.length; i++) {
				var selector = sequence[i];
				var rule = rules[selector];
				rule && rule.callback ? rule.callback(rule.rule, win) : null;
			}
			for (i = 0; i < callbacks.length; i++) {
				callbacks[i] ? callbacks[i](rules, win) : null;
			}
		}

		function addCallback (callback) {
			if (callback) {
				callbacks.push(callback);
				callback(rules, win);
			}
		}

		function watchSelector (selector, style, callback) {
			var rule = addSelector (selector, style);
			if (rule) {
				rules[selector] = {'rule': rule, 'callback': callback};
				sequence.push(selector);
			}
			callback ? callback(rule, win) : null;		
			console.log ('Styler.watchSelector');
		}

		function getStylesheet () {
		    if (!document.styleSheets) {
		        return;
		    }
		    if (document.getElementsByTagName("head").length == 0) {
		        return;
		    }
		    var i;
		    if (document.styleSheets.length > 0) {
		        for (i = 0; i < document.styleSheets.length; i++) {
		            if (document.styleSheets[i].disabled) {
		                continue;
		            }
		            var media = document.styleSheets[i].media;
		            mediaType = typeof media;
		            if (mediaType == "string") {
		                if (media == "" || (media.indexOf("screen") != -1)) {
		                    styleSheet = document.styleSheets[i];
		                }
		            } else if (mediaType == "object") {
		                if (media.mediaText == "" || (media.mediaText.indexOf("screen") != -1)) {
		                    styleSheet = document.styleSheets[i];
		                }
		            }
		            if (typeof styleSheet != "undefined") {
		                break;
		            }
		        }
		    }
		    if (typeof styleSheet == "undefined") {
		        var styleSheetElement = document.createElement("style");
		        styleSheetElement.type = "text/css";
		        document.getElementsByTagName("head")[0].appendChild(styleSheetElement);
		        for (i = 0; i < document.styleSheets.length; i++) {
		            if (document.styleSheets[i].disabled) {
		                continue;
		            }
		            styleSheet = document.styleSheets[i];
		        }
		        var media = styleSheet.media;
		        mediaType = typeof media;
		    }
		    return styleSheet;
		}

		function getRule (selector) {
			var rule, i;
			if (mediaType == "string") {
		    	for (i = 0; i < styleSheet.rules.length; i++) {
		            if (styleSheet.rules[i].selectorText && styleSheet.rules[i].selectorText.toLowerCase() == selector.toLowerCase()) {
		                rule = styleSheet.rules[i].style;
		                return rule;
		            }
		        }
		    } else if (mediaType == "object") {
		        for (i = 0; i < styleSheet.cssRules.length; i++) {
		            if (styleSheet.cssRules[i].selectorText && styleSheet.cssRules[i].selectorText.toLowerCase() == selector.toLowerCase()) {
		                rule = styleSheet.cssRules[i].style;
		                return rule;
		            }
		        }
		    }
		}

		function insertRule (selector, style) {
		    if (mediaType == "string") {
		    	styleSheet.addRule(selector, style);
		    } else if (mediaType == "object") {
		        styleSheet.insertRule(selector + "{" + style + "}", styleSheet.cssRules.length);
		    }
		}

		function addSelector (selector, style) {
			styleSheet = styleSheet || getStylesheet();
		    if (!styleSheet) {
		        return;
		    }
		    var rule = getRule(selector);
		    if (rule) {
		    	return rule;
		    }
		    insertRule(selector, style);
		    return getRule(selector);
		}

		var Styler = {};

		Styler.media 			= media;
		Styler.queries 			= queries;
		Styler.addSelector 		= addSelector;
		Styler.watchSelector 	= watchSelector;
		Styler.addCallback 		= addCallback;

		return Styler;

	}();

	/*
	var Styler = function () {
		
		// CONST
		var media = {
			xs: 0,
			sm: 1,
			md: 2,
			lg: 3
		}
		var queries = {
			xs: [0,767],
			sm: [768,991],
			md: [992,1199],
			lg: [1200,20000]			
		}

		// DOM
		var target;

		// PRIVATE
		var style = {}, ww = 0, wh = 0, cols2 = 1, cols3 = 1, cols4 = 1, l2, l3, l4;
		
		var detail2 = $('.list-cols2>detail'),
			detail3 = $('.list-cols3>detail'),
			detail4 = $('.list-cols4>detail'),
			items2 = $('.list-cols2>.item'),
			items3 = $('.list-cols3>.item'),
			items4 = $('.list-cols4>.item'),
			current2 = current3 = current4 = null;
		
		function getMedia($w) {
			var m = 'xs';
			for (var p in queries) {
				if ($w>= queries[p][0] && $w<= queries[p][1]) {
					m = p;
				}
			}
			return media[m];
		}

		function Resize(){
			ww = target.width();
			wh = target.height();
			console.log ('Styler.Resize');
			Repos ();
		}

		function RecolList($cols) {
			$(this).children('.item').each(function($i) {
				if ($i%$cols == 0) {
					$(this).addClass('clear-left');
				} else {
					$(this).removeClass('clear-left');
				}
			});		
		}
		function Recol() {
			$('.list-cols2').each(function(){
				RecolList.call(this, cols2);								
			});
			$('.list-cols3').each(function(){
				RecolList.call(this, cols3);								
			});	
			$('.list-cols4').each(function(){
				RecolList.call(this, cols4);								
			});
		}
		function Remargin(current) {
			// clear: left;
			items2.removeClass('detailMarginBottom2');
			if (current2.size()) {
				var last2 = items2.eq(Math.min(l2,items2.size()-1)).addClass('detailMarginBottom2');
				if (style.detailMarginTop2 && last2.size()) {
					style.detailMarginTop2.marginTop = last2.position().top + last2.height() + 44 + 'px';
					style.detailMarginBottom2.marginBottom = detail2.height() + 44 + 'px';
					style.detailMarginLeft2.marginLeft = (current2.offset().left + current2.outerWidth() / 2) + 'px';
				}				
			}
			items3.removeClass('detailMarginBottom3');
			if (current3.size()) {
				var last3 = items3.eq(Math.min(l3,items3.size()-1)).addClass('detailMarginBottom3');
				if (style.detailMarginTop3 && last3.size()) {
					style.detailMarginTop3.marginTop = last3.position().top + last3.height() + 'px';
					style.detailMarginBottom3.marginBottom = detail3.height() + 'px';
					style.detailMarginLeft3.marginLeft = (current3.offset().left + current3.outerWidth() / 2) + 'px';
				}	
			}
			items4.removeClass('detailMarginBottom4');
			if (current4.size()) {
				var last4 = items4.eq(Math.min(l4,items4.size()-1)).addClass('detailMarginBottom4');
				if (style.detailMarginTop4 && last4.size()) {
					style.detailMarginTop4.marginTop = last4.position().top + last4.height() + 'px';
					style.detailMarginBottom4.marginBottom = detail4.height() + 'px';
					style.detailMarginLeft4.marginLeft = (current4.offset().left + current4.outerWidth() / 2) + 'px';
				}	
			}			
		}
		function Repos () {
			try {
				current2 = $('.list-cols2>.item.active');
				current3 = $('.list-cols3>.item.active');
				current4 = $('.list-cols4>.item.active');
				
				var 	i2 = current2.index() || 0,
						i3 = current3.index() || 0,
						i4 = current4.index() || 0;

				l2 = i2;
				l3 = i3;
				l4 = i4;
				var m = getMedia(ww);
				switch(m) {
					case media.xs:
						// 1 col
						cols2 = 1;
						cols3 = 1;
						cols4 = 1;
					break;
					case media.sm:
						// 2 col
						cols2 = 2;
						cols3 = 2;
						cols4 = 3;						
						l2 = Math.floor(i2/cols2) * cols2 + (cols2-1);
						l3 = Math.floor(i3/cols3) * cols3 + (cols3-1);
						l4 = Math.floor(i4/cols4) * cols4 + (cols4-1);
					break;
					case media.md:
					case media.lg:
						// 3 col
						cols2 = 2;
						cols3 = 3;
						cols4 = 4;						
						l2 = Math.floor(i2/cols2) * cols2 + (cols2-1);
						l3 = Math.floor(i3/cols3) * cols3 + (cols3-1);
						l4 = Math.floor(i4/cols4) * cols4 + (cols4-1);
					break;					
				}
				Recol();
				Remargin ();						
			} catch($e) {
				console.log($e);
			}
			console.log ('Styler.Repos');
		};

		function Init ($target) {	
			target = $target || $(window);

			var i, j, t1, t2, ss, rules, rr;			
			if (!style.detailMarginTop2) {
				t1 = document.styleSheets.length;
				for (i = 0; i < t1; i++) {
					ss = document.styleSheets[i];
					rules = ss.rules || ss.cssRules;
					t2 = rules.length;
					for (j = 0; j < t2; j++) {			
						rr = rules[j];
						switch(rr.selectorText){							
							case '.headerMarginTop':
								style.headerMarginTop = rr.style;							
							break;
							case '.detailMarginTop2':
								style.detailMarginTop2 = rr.style;							
							break;
							case '.detailMarginBottom2':
								style.detailMarginBottom2 = rr.style;
							break;
							case '.detailMarginLeft2':
								style.detailMarginLeft2 = rr.style;															
							break;
							case '.detailMarginTop3':
								style.detailMarginTop3 = rr.style;							
							break;
							case '.detailMarginBottom3':
								style.detailMarginBottom3 = rr.style;
							break;
							case '.detailMarginLeft3':
								style.detailMarginLeft3 = rr.style;															
							break;
							case '.detailMarginTop4':
								style.detailMarginTop4 = rr.style;							
							break;
							case '.detailMarginBottom4':
								style.detailMarginBottom4 = rr.style;
							break;
							case '.detailMarginLeft4':
								style.detailMarginLeft4 = rr.style;	
								i = t1; j = t2;
								console.log ('Styler.Init');								
							break;							
						}
					}
				}
			}

			Resize();	
		}
		
		var Styler = {			
		};
		
		Styler.Init = Init;		
		Styler.Resize = Resize;		
		Styler.Repos = Repos;		
		
		Styler.style = style;		
		Styler.cols2 = cols2;		
		Styler.cols3 = cols3;		
		Styler.cols4 = cols4;		
		
		return Styler;	

	}();
	*/