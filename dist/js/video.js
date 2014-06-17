
	var Video = function () {
		
		// CONST
		
		// FLAGS

		// DOM
		var win, html, videoDiv, videoPlayer, target, source;

		// PRIVATE
		var video, videoWidth = 16, videoHeight = 9, vw, vh, vl, vt;

		var items = [], videoplayers = {};

		function onLoad ($item) {
			// console.log ('Video.onLoad', $item);	
			$item.videoplayer.addClass('loading');					
		}
		function onProgress ($item) {
			// console.log ('Video.onProgress', $item);		
		}
		function onReady ($item) {
			// console.log ('Video.onReady', $item);		
			$item.videoplayer.removeClass('loading').addClass('canplay');	
			Resize();
			$item.callback ? $item.callback () : null;
		}
		function onLoadComplete ($item) {
			// console.log ('Video.onLoadComplete', $item);			
		}
		function onEnded ($item) {
			// console.log ('Video.onEnded', $item);
			$item.videoplayer.removeClass('playing');						
		}
		function onError ($item) {
			console.log ('Video.onError', $item);
			$item.videoplayer.addClass('error');			
		}
		function onState ($item) {
			// console.log ('Video.onState', $item);
			$item.paused ? 		$item.videoplayer.removeClass('playing') : 	$item.videoplayer.addClass('playing');
			$item.buffering ? 	$item.videoplayer.addClass('buffering') : 	$item.videoplayer.removeClass('buffering');
		}

		function Init ($callback) {
			$("videoplayer[data-init!='true']").each(function(){
				var videoplayer = $(this);
				videoplayer.attr('data-init','true');
				var item = {
					vimeo: 				videoplayer.attr('data-vimeo'),
					youtube: 			videoplayer.attr('data-youtube'),
					route : 			videoplayer.attr('data-route'),
					poster : 			videoplayer.attr('data-poster'),
					videoplayer : 		videoplayer,
					paused : 			true,
					callback : 			$callback
				}
				item.onLoad 		= onLoad;
				item.onProgress 	= onProgress;
				item.onReady 		= onReady;
				item.onLoadComplete = onLoadComplete;
				item.onEnded 		= onEnded;
				item.onState 		= onState;

				items.push (item);
				videoplayers[videoplayer] = item;
				if (item.vimeo) {
					VideoVimeo.Load(item);
				} else if (item.youtube) {
					VideoYoutube.Load(item);
				} else {
					VideoHtml5.Load(item);
				}
				if (item.poster) {
					Poster(item);
		    	}		    	
			});
		}

		function Poster ($item) {
			$('<img src="'+ $item.poster +'" class="poster"/>').prependTo($item.videoplayer.find('overlay'));
			var img = new Image();
			img.onload = function() {
				$item.posterWidth = this.naturalWidth;
				$item.posterHeight = this.naturalHeight;
				Resize();
			};
			img.onerror = function(){	
			};												
			img.src = $item.poster;	
			$item.videoplayer.addClass('poster');	
		}

		win = $(window);
		win.on('resize',function(){
			Resize();
		});	
		function Resize() {
			// var ww = win.width();
			// var wh = win.height();
			$.each(items,function(i,item) {
				var ww = item.videoplayer.width();
				var ratio = 16 / 9;
				if (item.videoWidth) {
					ratio = item.videoWidth / item.videoHeight;
				} else if (item.posterWidth) {
					ratio = item.posterWidth / item.posterHeight;
				}
				var nw = ww, nh = ww / ratio;
				if (item.player) {
					item.player.width = nw;
					item.player.height = nh;
					if (item.vimeo) {
						var iframe = $('videoplayer iframe');
						iframe.width(nw); iframe.height(nh);
					} else if (item.youtube) {
						var iframe = $('videoplayer iframe');
						iframe.width(nw); iframe.height(nh);
					}
				}
				// console.log ('Video.Resize', nw, nh);				
			});

		}

		function Clear () {
			// youtube player.destroy()
			/*
			if (video) {
				videoPlayer.attr('src','video/empty.mp4');
				video.load();
				videoPlayer.remove();
			}
			*/
		}

		function togglePlay () {
			// SetVars.call ($(this).closest('.detail')[0]);
			// console.log ('Video.togglePlay', video);
			var videoplayer = $(this).closest('videoplayer');
			var item = videoplayers[videoplayer];
			if (item.player) {
				if (item.paused) {
					item.Play ();					
				} else {
					item.Stop ();
				}
			}		
		}

		function Load () {
			if (video) {
				video.load();
			}
		}

		function Play () {
			if (video) {
				video.play();
			}
		}

		function Pause () {
			if (video) {
				video.pause();
			}
		}

		$('body').on('click', 'videoplayer > overlay, videoplayer .btn-play', function($e) {
	        togglePlay.call (this);
	        return false;
	    });

		var Video = {			
		};
		
		Video.Init 		= Init;	
		Video.Clear 	= Clear;	
		Video.togglePlay = togglePlay;

		return Video;	

	}();



	/********************************
	VideoHtml5
	********************************/

	var VideoHtml5 = function () {
		
		var READY = false, players = {}, count = 0;

		function timeRangesToString(r) {
		  var log = "";
		  for (var i=0; i<r.length; i++) {
		    log += "[" + r.start(i) + "," + r.end(i) + "]<br>";
		  }
		  return log;
		}

		function Buffer ($e) {
			var player = $e.target;
			var item = players[player];			
			var buffer = player.buffered, start, end, maxBuffer = 0;
			if (buffer) {
				var i = 0; t = buffer.length;
			   	while(i<t) {
					start = buffer.start(i) / player.duration;
					end = buffer.end(i) / player.duration;
					maxBuffer = Math.max(maxBuffer, end);
					i++;
			    }
			    /*
			    var log = "Buffered:<br>"
			            + timeRangesToString(video.buffered)
			            + "<br>" 
			            + "Seekable:<br>" 
			            + timeRangesToString(video.seekable)
			            + "<br>";
			    var currentTime = video.currentTime / video.duration * 100;
			    videoDiv.find('.btn-play .progress').css({'width': (Math.round(maxBuffer*10)/10) + '%'});
				console.log ('Video.updateBuffer', maxBuffer);		
				*/
			}
			return maxBuffer;
		}

		function onVideoLoadStart ($e) {
			var player = $($e.target)[0];
			var item = players[player];
			// console.log ('VideoHtml5.onVideoLoadStart', item);
			item.onLoad ? item.onLoad(item) : null;
		}
		function onVideoProgress ($e) {
			var player = $($e.target)[0];
			var item = players[player];
			// console.log ('VideoHtml5.onVideoProgress', item);
			item.progress = Buffer ($e);
			item.onProgress ? item.onProgress(item) : null;	
		}
		function onVideoCanPlay ($e) {
			var player = $($e.target)[0];
			var item = players[player];
			// console.log ('VideoHtml5.onVideoCanPlay', item);
			item.videoWidth = player.videoWidth;
			item.videoHeight = player.videoHeight;
			item.onReady ? item.onReady(item) : null;
		}
		function onVideoCanThrough ($e) {
			var player = $($e.target)[0];
			var item = players[player];
			// console.log ('VideoHtml5.onVideoCanThrough', item);
			item.onLoadComplete ? item.onLoadComplete(item) : null;
		}
		function onVideoEnded ($e) {
			var player = $($e.target)[0];
			var item = players[player];
			// console.log ('VideoHtml5.onVideoEnded', item);
			item.paused = true;
			item.buffering = false;
			item.onEnded ? item.onEnded(item) : null;
		}
		function onVideoError ($e) {
			var player = $($e.target)[0];
			var item = players[player];
			// console.log ('VideoHtml5.onVideoError', item);
			item.paused = true;
			item.buffering = false;
			item.onError ? item.onError(item) : null;
		}
		function onVideoPlay ($e) {
			var player = $($e.target)[0];
			var item = players[player];
			// console.log ('VideoHtml5.onVideoPlay', item);
			item.paused = false;
			item.buffering = false;
			item.onState ? item.onState(item) : null;
		}
		function onVideoPause ($e) {
			var player = $($e.target)[0];
			var item = players[player];
			// console.log ('VideoHtml5.onVideoPause', item);
			item.paused = true;
			item.buffering = false;
			item.onState ? item.onState(item) : null;
		}
		function onVideoWaiting ($e) {
			var player = $($e.target)[0];
			var item = players[player];
			// console.log ('VideoHtml5.onVideoWaiting', item);
			item.paused = true;
			item.buffering = true;
			item.onState ? item.onState(item) : null;
		}

	    function Load ($item) {
	    	$item.id = 'videohtml5-' + count; count ++;
	    	var playerTag = $('<video id="'+ $item.id +'" class="html5player"><source src="'+ $item.route +'" type="video/mp4"></video>').prependTo($item.videoplayer);
	    	var player = playerTag[0];

	    	player.addEventListener('loadstart', 			onVideoLoadStart, false);
			player.addEventListener('progress', 			onVideoProgress, false);
			player.addEventListener('canplay', 				onVideoCanPlay, false);
			player.addEventListener('canplaythrough', 		onVideoCanThrough, false);
			player.addEventListener('ended', 				onVideoEnded, false);	
			player.addEventListener('error', 				onVideoError, false);	
			player.addEventListener('play', 				onVideoPlay, false);	
			player.addEventListener('pause', 				onVideoPause, false);	
			player.addEventListener('waiting', 				onVideoWaiting, false);	

			$item.player = player;
			players[player] = $item;

			$item.Play = function () {
				player.play();
			}
			$item.Stop = function () {
				player.pause();
			}
			player.load ();

			// console.log ('VideoHtml5.Load', $item.id, players);	    	
	    }

		var VideoHtml5 = {};

      	VideoHtml5.Load = Load;

      	return VideoHtml5;

	} ();

	/********************************
	VideoYoutube
	********************************/

	var VideoYoutube = function () {
		
		var INIT = false, READY = false, callbacks = [], players = {};

		function Init() {
			// console.log ('VideoYoutube.Init');
	    	if (INIT) {
				return;
			}
			INIT = true;
			var tag = document.createElement('script');
			tag.src = "https://www.youtube.com/iframe_api";
			var firstScriptTag = document.getElementsByTagName('script')[0];
	      	firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
	    }

	    function RemoveAds ($player) {
	    	var iframe = $player.getIframe();
	    	$(	'<style>'+
	    		'	 .video-ads {' +
				'		display: none!important;'+
				'}	'+
	    		'</style>').appendTo($(iframe));
    		console.log ('VideoYoutube.RemoveAds', $(iframe).contents().find("head"));
	    }

	    function onPlayerReady ($e) {
	    	var player = $e.target;
	    	var item = players[player];
	    	// console.log ('VideoYoutube.onPlayerReady', item);
	    	// console.log ('VideoYoutube.onPlayerReady', 'item.id', item.id);
	    	// console.log ('VideoYoutube.onPlayerReady.getVideoData', player.width, player.height);
	    	// player.playVideo();
			// player.stopVideo();
			// RemoveAds (player);

			console.log ('VideoYoutube.onPlayerReady', player);

			/*
			$.ajax({
				dataType: "json",
				method: 'GET',
				url: 'http://www.youtube.com/oembed?url=http%3A//www.youtube.com/watch?v%3D'+item.youtube+'&format=json',
				success: function($json) {
					console.log ('VideoYoutube.onPlayerReady', $json);
	    			item.videoWidth = $json.width;
					item.videoHeight = $json.height;			
					item.onReady ? item.onReady(item) : null;
				}
			});			
			*/

	    }
		function onPlayerPlaybackQualityChange ($e) {
	    	// console.log ('VideoYoutube.onPlayerPlaybackQualityChange', $e.data, $e.target, $e.target.getVideoInfo());
	    }
		function onPlayerStateChange ($e) {
	    	// console.log ('VideoYoutube.onPlayerStateChange', $e.data);
	    	var player = $e.target;
	    	var item = players[player];
	    	switch ($e.data) {
	    		case YT.PlayerState.PLAYING:
	    			item.paused = false;
	    			item.buffering = false;
	    			item.onState ? item.onState(item) : null;
	    		break;
	    		case YT.PlayerState.PAUSED:
	    			item.paused = true;
	    			item.buffering = false;
	    			item.onState ? item.onState(item) : null;
	    		break;
	    		case YT.PlayerState.BUFFERING:
	    			item.paused = true;
	    			item.buffering = true;
	    			item.onState ? item.onState(item) : null;
	    		break;
	    		case YT.PlayerState.ENDED:
	    			item.paused = true;
	    			item.buffering = false;
	    			item.onEnded ? item.onEnded(item) : null;
	    		break;				
			}
	    }
		function onPlayerError ($e) {
	    	console.log ('VideoYoutube.onPlayerError');	
	    	var player = $e.target;
	    	var item = players[player];
	    	item.onError ? item.onError(item) : null;    	
	    }

	    function Create ($item) {
    		// console.log ('VideoYoutube.Create', $item.id);
	    	// 'M7lc1UVf-VE'
	    	var id = $item.id, url = $item.youtube, player;
			player = new YT.Player(id, {
				width: $(window).width(),
    			height: $(window).width() / 16 * 9,
    			videoId: url,
				playerVars: { 'autoplay': 0, 'controls': 0, 'html5':1,'enablejsapi':1, 'origin':document.location.hostname, 'suggestedQuality': 'hd1080' },
				events: {
					'onReady': onPlayerReady,
					'onPlaybackQualityChange': onPlayerPlaybackQualityChange,
					'onStateChange': onPlayerStateChange,
					'onError': onPlayerError
				}
			});
			$item.player = player;
			players[player] = $item;

			$item.Play = function () {
				player.playVideo();
			}
			$item.Stop = function () {
				player.pauseVideo();
			}

			$item.onLoad ? $item.onLoad($item) : null;
	    }

	    function Load ($item) {
	    	$item.id = 'youtube-' + $item.youtube;
	    	$('<div id="'+ $item.id +'" class="youtubeplayer"></div>').prependTo($item.videoplayer);
	    	// console.log ('VideoYoutube.Load', $item.id);
	    	Init ();
	    	callbacks.push ($item);
	    	if (READY) {
	    		Callbacks ();
	    	}
	    }

	    function Callbacks () {
	    	// console.log ('VideoYoutube.Callbacks');
	    	while (callbacks.length>0) {
	    		var item = callbacks.shift();
	    		Create (item);
	    	}	    	
	    }

		function onYouTubeIframeAPIReady() {
			// console.log ('VideoYoutube.onYouTubeIframeAPIReady');
	    	READY = true;
			Callbacks ();		  
		}
		window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady; 

		var VideoYoutube = {};

      	VideoYoutube.Load = Load;

      	return VideoYoutube;

	} ();


	/********************************
	VideoVimeo
	********************************/

	var VideoVimeo = function () {
		
		var INIT = false, READY = false, callbacks = [], players = {};

		function Init() {
			// console.log ('VideoVimeo.Init');
	    	if (INIT) {
				return;
			}
			INIT = true;
			var fl = $.ajax({
				url: 'http://a.vimeocdn.com/js/froogaloop2.min.js',
				dataType: "script",
				success: onVimeoFroogaloopReady
			});
	    }
		function onVimeoFroogaloopReady() {
			// console.log ('VideoVimeo.onVimeoFroogaloopReady');
	    	READY = true;
			Callbacks ();		  
		}
		
	    function RemoveAds ($player) {
	    	var iframe = $player.getIframe();
	    	$(	'<style>'+
	    		'	 .video-ads {' +
				'		display: none!important;'+
				'}	'+
	    		'</style>').appendTo($(iframe));
    		console.log ('VideoVimeo.RemoveAds', $(iframe).contents().find("head"));
	    }

	    function onPlayerReady ($e) {
	    	var player = $e.target;
	    	var item = players[player];
	    	// console.log ('VideoVimeo.onPlayerReady', item);
	    	// console.log ('VideoVimeo.onPlayerReady', 'item.id', item.id);
	    	// console.log ('VideoVimeo.onPlayerReady.getVideoData', player.width, player.height);
	    	// player.playVideo();
			// player.stopVideo();
			// RemoveAds (player);

			console.log ('VideoVimeo.onPlayerReady', player.api);

			player.api('getVideoWidth', function ($val, $id) {
	            item.videoWidth = parseInt($val);
	            player.api('getVideoHeight', function ($val, $id) {
		            item.videoHeight = parseInt($val);

		            console.log ('VideoVimeo.onPlayerReady', item.videoWidth, item.videoHeight);
					item.onReady ? item.onReady(item) : null;
		        });
	        });

	    }
	    /*
		function onPlayerPlaybackQualityChange ($e) {
	    	// console.log ('VideoVimeo.onPlayerPlaybackQualityChange', $e.data, $e.target, $e.target.getVideoInfo());
	    }
		function onPlayerStateChange ($e) {
	    	// console.log ('VideoVimeo.onPlayerStateChange', $e.data);
	    	var player = $e.target;
	    	var item = players[player];
	    	switch ($e.data) {
	    		case YT.PlayerState.PLAYING:
	    			item.paused = false;
	    			item.buffering = false;
	    			item.onState ? item.onState(item) : null;
	    		break;
	    		case YT.PlayerState.PAUSED:
	    			item.paused = true;
	    			item.buffering = false;
	    			item.onState ? item.onState(item) : null;
	    		break;
	    		case YT.PlayerState.BUFFERING:
	    			item.paused = true;
	    			item.buffering = true;
	    			item.onState ? item.onState(item) : null;
	    		break;
	    		case YT.PlayerState.ENDED:
	    			item.paused = true;
	    			item.buffering = false;
	    			item.onEnded ? item.onEnded(item) : null;
	    		break;				
			}
	    }
	    */

	    function timeRangesToString(r) {
		  var log = "";
		  for (var i=0; i<r.length; i++) {
		    log += "[" + r.start(i) + "," + r.end(i) + "]<br>";
		  }
		  return log;
		}

		function Buffer ($e) {
			var player = $e.target;
			var item = players[player];			
			var buffer = player.buffered, start, end, maxBuffer = 0;
			if (buffer) {
				var i = 0; t = buffer.length;
			   	while(i<t) {
					start = buffer.start(i) / player.duration;
					end = buffer.end(i) / player.duration;
					maxBuffer = Math.max(maxBuffer, end);
					i++;
			    }
			    /*
			    var log = "Buffered:<br>"
			            + timeRangesToString(video.buffered)
			            + "<br>" 
			            + "Seekable:<br>" 
			            + timeRangesToString(video.seekable)
			            + "<br>";
			    var currentTime = video.currentTime / video.duration * 100;
			    videoDiv.find('.btn-play .progress').css({'width': (Math.round(maxBuffer*10)/10) + '%'});
				console.log ('Video.updateBuffer', maxBuffer);		
				*/
			}
			return maxBuffer;
		}

		function onPlayerProgress ($e) {
	    	// console.log ('VideoVimeo.onPlayerProgress', arguments);	
	    	var player = $e.target;
	    	var item = players[player];
	    	// console.log ($e.data);
	    	item.progress = parseFloat($e.data.percent);
			item.onProgress ? item.onProgress(item) : null;			
	    }
	    function onPlayerTimeline ($e) {
	    	// console.log ('VideoVimeo.onPlayerTimeline', arguments);	
	    	var player = $e.target;
	    	var item = players[player];
	    	// console.log ($e.data);
	    	/*
	    	item.progress = Buffer ($e.data);
			item.onProgress ? item.onProgress(item) : null;
			*/
	    }
	    function onPlayerPlay ($e) {
	    	// console.log ('VideoVimeo.onPlayerPause', arguments);	
	    	var player = $e.target;
	    	var item = players[player];
	    	item.paused = false;
	    	item.buffering = false;
	    	item.onState ? item.onState(item) : null;	    	
	    }
	    function onPlayerPause ($e) {
	    	// console.log ('VideoVimeo.onPlayerPause', arguments);	
	    	var player = $e.target;
	    	var item = players[player];
	    	item.paused = true;
	    	item.buffering = false;
	    	item.onState ? item.onState(item) : null;	  	
	    }
	    function onPlayerEnd ($e) {
	    	// console.log ('VideoVimeo.onPlayerEnd', arguments);	
	    	/*
	    	var player = $e.target;
	    	var item = players[player];
	    	item.onError ? item.onError(item) : null;    	
	    	*/
	    	item.paused = false;
	    	item.buffering = false;
	    	item.onState ? item.onState(item) : null;
	    }
	    function onPlayerError ($e) {
	    	// console.log ('VideoVimeo.onPlayerError');	
	    	var player = $e.target;
	    	var item = players[player];
	    	item.onError ? item.onError(item) : null;    	
	    }

	    function Create ($item) {
    		// console.log ('VideoVimeo.Create', $item.id);
	    	// 'M7lc1UVf-VE'
	    	var id = $item.id, url = $item.vimeo, player;
	    	var ww = $(window).width();
	    	var wh = ww / 16 * 9;
	    	
	    	var iframe = $('<iframe id="'+id+'" src="http://player.vimeo.com/video/'+url+'?api=1&player_id='+id+'" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>');
	    	iframe.prependTo($item.videoplayer);

	    	var player = $f(iframe[0])
	    	player.addEvent('ready', function($id) {
			    onPlayerReady.call(player, {target:player, id:$id});
			    player.addEvent('play', function ($id) {
			    	onPlayerPlay.call(player, {target:player, id:$id})
			    });
			    player.addEvent('pause', function ($id) {
			    	onPlayerPause.call(player, {target:player, id:$id})
			    });
			    player.addEvent('finish', function ($id) {
			    	onPlayerEnd.call(player, {target:player, id:$id})
			    });
			    player.addEvent('playProgress', function ($data, $id) {
			    	onPlayerTimeline.call(player, {target:player, id:$id, data:$data});
			    });
				player.addEvent('loadProgress', function ($data, $id) {
			    	onPlayerProgress.call(player, {target:player, id:$id, data:$data});
			    });
			});

	    	// player.api($(this).text().toLowerCase());
			/*
			function onPause(id) {
			    status.text('paused');
			}

			function onFinish(id) {
			    status.text('finished');
			}

			function onPlayProgress(data, id) {
			    status.text(data.seconds + 's played');
			}
			*/

	    	/*
			player = new YT.Player(id, {
				width: $(window).width(),
    			height: $(window).width() / 16 * 9,
    			videoId: url,
				playerVars: { 'autoplay': 0, 'controls': 0, 'html5':1,'enablejsapi':1, 'origin':document.location.hostname, 'suggestedQuality': 'hd1080' },
				events: {
					'onReady': onPlayerReady,
					'onPlaybackQualityChange': onPlayerPlaybackQualityChange,
					'onStateChange': onPlayerStateChange,
					'onError': onPlayerError
				}
			})
			*/

			$item.player = player;
			players[player] = $item;

			$item.Play = function () {
				// player.playVideo();
				player.api('play');
			}
			$item.Stop = function () {
				// player.pauseVideo();
				player.api('pause');
			}

			$item.onLoad ? $item.onLoad($item) : null;
	    }

	    function Load ($item) {
	    	$item.id = 'vimeo-' + $item.vimeo;
	    	// $('<div id="'+ $item.id +'" class="vimeoplayer"></div>').prependTo($item.videoplayer);
	    	console.log ('VideoVimeo.Load', $item.id);
	    	Init ();
	    	callbacks.push ($item);
	    	if (READY) {
	    		Callbacks ();
	    	}
	    }

	    function Callbacks () {
	    	// console.log ('VideoVimeo.Callbacks');
	    	while (callbacks.length>0) {
	    		var item = callbacks.shift();
	    		Create (item);
	    	}	    	
	    }

		var VideoVimeo = {};

      	VideoVimeo.Load = Load;

      	return VideoVimeo;

	} ();

	