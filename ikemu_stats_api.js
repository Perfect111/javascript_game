/**
 * Base64 encoder for javascript
 */
function encode64(e){var t="ABCDEFGHIJKLMNOP"+"QRSTUVWXYZabcdef"+"ghijklmnopqrstuv"+"wxyz0123456789+/"+"=";e=escape(e);var n="";var r,i,s="";var o,u,a,f="";var l=0;do{r=e.charCodeAt(l++);i=e.charCodeAt(l++);s=e.charCodeAt(l++);o=r>>2;u=(r&3)<<4|i>>4;a=(i&15)<<2|s>>6;f=s&63;if(isNaN(i)){a=f=64}else if(isNaN(s)){f=64}n=n+t.charAt(o)+t.charAt(u)+t.charAt(a)+t.charAt(f);r=i=s="";o=u=a=f=""}while(l<e.length);return n}
 
 /**
 * GetXmlHttpObject for vanilla javascript AJAX request
 */
function GetXmlHttpObject(){var e=null;try{e=new XMLHttpRequest}catch(t){try{e=new ActiveXObject("Msxml2.XMLHTTP")}catch(t){e=new ActiveXObject("Microsoft.XMLHTTP")}}return e}

/**
 * Get cookie for vanilla javascript
 * www.chirp.com.au
 */
function getCookie(name) { var re = new RegExp(name + "=([^;]+)"); var value = re.exec(document.cookie); return (value != null) ? unescape(value[1]) : null; }

/**
 * Delete cookie for vanilla javascript
 * Sets the 'expires' date of the cookie to something in the past.
 */
function deleteCookie(name) { document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:01 GMT;'; };

/**
 * IKEMU Javascript GAME API (v.1.0)
 * May 13, 2015
 */
var ikemuSettings, ikemuDomain = "https://developer.ikemu.com/", primaryDomain = "ikemu.com", gaTrackingID = "", pingFunction, pingCounter = 0, pingInterval = 10;
var ikemuGameCompleteable = false,
	isAdmin = false;

var IkemuStatsAPI = (function() {

    return {

        init : function(){

            IkemuStatsAPI.log('init method called!');
            
            /**
             * Needed for the same-origin policy.
             * Set the domain of S3 to match the domain of the Player Side...
             */
            try {
            	document.domain = primaryDomain;
			} catch(err) {
				isAdmin = true;
				IkemuStatsAPI.log('Failed to set S3 domain. Game will not be connect to the server.');
			}
        	
			if(UtilityService.ikemuIsMobile()) { //If mobile, get settings from cookie
				
				IkemuStatsAPI.log('MOBILE Mode - Getting tokens from cookie.');
				var sessionTokens = JSON.parse(JSON.parse(getCookie("ikemu-session-tokens")));
				
				ikemuSettings = sessionTokens;
				
			} else { //If web, get settings from parent container
				IkemuStatsAPI.log('WEB Mode - Getting tokens from parent.');

				try {
					var $parent = parent.document.getElementById("game-iframe");
					if ($parent != null) {
						/**
						 * If ikemuSettings create empty object...
						 */
						if(ikemuSettings == null)
							ikemuSettings = {};
						
						/**
						 * Get all data attributes of game wrapper and set to ikemuSettings...
						 */
						for(var data in $parent.dataset){
							ikemuSettings[data] = $parent.dataset[data];
						}
					} else {
						isAdmin = true;
					}
				} catch(err) {
					isAdmin = true;
					IkemuStatsAPI.log('Failed to get tokens from parent.');
				}
			}
			
			IkemuStatsAPI.log("ikemuDomain : " + ikemuDomain);
			IkemuStatsAPI.log("primaryDomain : " + primaryDomain);
			
			if(ikemuSettings != null){
				
				if(UtilityService.ikemuIsMobile()) {
					Analytics.init(gaTrackingID);
					IkemuStatsAPI.log('MOBILE Mode - Initialize Google Analytics with Tracking ID : ', gaTrackingID);
					
					pingInterval = ikemuSettings.pingInterval;
				}
				
				if(ikemuSettings.gameTitle) {
					IkemuStatsAPI.log("gameTitle : " + ikemuSettings.gameTitle);
					UtilityService.setTitle(ikemuSettings.gameTitle);
				}
				if(ikemuSettings.gameUrl) {
					IkemuStatsAPI.log("gameUrl : " + ikemuSettings.gameUrl);
				}
				IkemuStatsAPI.log("gameSessionToken : " + ikemuSettings.gameSessionToken);
				IkemuStatsAPI.log("playerSessionToken : " + ikemuSettings.playerSessionToken);
				IkemuStatsAPI.log("pingInterval : " + pingInterval);
				
	            IkemuStatsAPI.log('The iKEMU API is good to go!');
			} else {
	            IkemuStatsAPI.log('No tokens received.');
	            if(!isAdmin) 
	            	window.alert('Sorry! The game session has expired! Please go back to the previous screen.')
			}

			ikemuAjax("init");
        },

        log : function(message){
            if (window.console && window.console.log){
                console.log("[gameAPI] " + message);
            }
        },

        getSessionToken: function(message){
            return ikemuSettings.playerSessionToken;
        },

        getPlayerInfo: function(){
            ikemuAjax("get-player-info");
        },

        getGameData: function(){
            ikemuAjax("get-game-data");
        },

        setGameData: function(gameData){
            ikemuAjax("set-game-data", function(){}, null, gameData);
        },

        gameStart: function(){	
			IkemuStatsAPI.log("GameStart called.");
			ikemuGameCompleteable = true;
            ikemuAjax("game-start", function(){
                window.clearInterval(pingFunction);
                pingFunction = setInterval(function(){
                    pingCountdown();
                }, 1000);
            });
        },

        gameLevelComplete: function(gameScore){
            ikemuAjax("game-level-complete", function(){}, gameScore);
        },

        gameComplete: function(gameScore){
			IkemuStatsAPI.log("GameComplete called.");
			if(ikemuGameCompleteable) {
				ikemuGameCompleteable = false;
				ikemuAjax("game-complete", function(data){
					window.clearInterval(pingFunction);
				}, gameScore);
			} else {
				IkemuStatsAPI.log("Game start not yet called.");
			}
        },

        gameClose: function(){
            //send message to iframe to trigger GAME CLOSE events
            IkemuStatsAPI.log("Game will now close. (Player will be brought back to iKEMU site)");
            ikemuSendStat("game-close");
            if(UtilityService.ikemuIsMobile()) {
            	if(UtilityService.isCustomPlay() === "true") {
					window.location.href = ikemuDomain + "?embed=1&amp;customPlay=1&amp;gameId=" + ikemuSettings.gameId + "#/custom-end-game/" + ikemuSettings.gameId + "?isCustomPlay=true&gameId=" + ikemuSettings.gameId;
            	} else {
            		// Delete cookie before redirecting
                	deleteCookie("ikemu-session-tokens");
                	window.location.href = ikemuDomain + "#/end-game/" + ikemuSettings.gameId;
            	}
            }
            
        },

        gameLevelUp: function(gameScore){
            ikemuAjax("game-level-up", function(){}, gameScore);
        },

        gameRestart: function(){
            ikemuAjax("game-restart");
        },

        gameLevelRestart: function(){
            ikemuAjax("game-level-restart");
        },
		
        testConnection: function(){
            ikemuAjax("test");
        },

        ping: function(){
            ikemuAjax("ping", function() {});
        }

    }
})();

function pingCountdown() {
    if(pingInterval == pingCounter) {
        IkemuStatsAPI.ping();
    } else {
        pingCounter += 1;
    }

}

function ikemuAjax(route, successCallback, gameScore, gameData) {

	IkemuStatsAPI.log(route + " method called!");

    if(ikemuSettings != null) {
        var data = "gameId=" + ikemuSettings.gameId + "&" +
                    "gameSessionToken=" + ikemuSettings.gameSessionToken + "&" +
                    "playerSessionToken=" + ikemuSettings.playerSessionToken, 
            xhr = GetXmlHttpObject();
        
        if(route == 'game-start') {
        	var resolution = {
        		width: window.innerWidth || document.documentElement.clientWidth || document.body.offsetWidth,
        		height: window.innerHeight || document.documentElement.clientHeight || document.body.offsetHeight
        	};
            data += "&resolution=" + resolution.width + "x" + resolution.height + "&isCustomPlay=" + ikemuSettings.isCustomPlay;
        }
        
        if(!gameScore) {
			gameScore = 0;
        }
        data += "&gameScore=" + gameScore;
        data += "&signature=" + encode64(ikemuSettings.playerSessionToken + "_" + gameScore);


        if(gameData) {
            data += "&gameData=" + gameData;
        }

        xhr.open('POST', ikemuDomain + "api/" + route, true);
        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded;charset=utf-8");
        xhr.onreadystatechange = function(ev) {
            if (xhr.readyState != 4)  { return; }
            if (xhr.status == 200) {
                //IkemuStatsAPI.log("Server responded with response : " + xhr.response);
                if(successCallback) {
                    pingCounter = 0;
                    successCallback(xhr.response)
                }
				ikemuSendStat(route);
            } else {
				//IkemuStatsAPI.log('Connection with the server was interrupted.');
				ikemuSendStat(route);
			}
        }
        xhr.send(data);

    } else {
        if(successCallback) {
            pingCounter = 0;
            successCallback("no-connection");
        }
		ikemuSendStat(route);
    }

}

/**
 * API will attempt to communicate with the parent.
 * Things to consider:
 * document.domain must be set
 * Game must have a parent
 * Parent should have a receiveStat method
 * 
 */
function ikemuSendStat(stat) {
	var GAME_STATUS = ["init","game-start","game-level-complete","game-complete","game-close","game-level-up","game-restart","game-level-restart","game-restart"];
	
	if(!UtilityService.ikemuIsMobile()) {
		try {
			if(GAME_STATUS.indexOf(stat) >= 0) {
				IkemuStatsAPI.log('Sending stat ' + stat + ' to parent.');
				parent.ikemuReceiveStat(stat);
			}
		} catch (err) {
			IkemuStatsAPI.log('Unable to send stat ' + stat + ' to parent.');
		}
	} else {
		if(GAME_STATUS.indexOf(stat) >= 0) 
			Analytics.trackEvent(stat);
	}
}

var UtilityService = (function() {
	var inst = this,
		  gameTitle = "";
	return {
		
		/**
		 * Detect Mobile Browsers | Open source mobile phone detection
		 * http://detectmobilebrowsers.com/
		 */
		ikemuIsMobile : function() {
			var isMobile = false;
			(function(a,b){
				if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|android|ipad|playbook|silk|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))
					isMobile = true;
			})(navigator.userAgent||navigator.vendor||window.opera);
		  	return isMobile;
		},
		
		/**
		 * Detect if this is a custom campaign to handle custom events...
		 * Read cookie with name 'ikemu-custom-play'...
		 */
		isCustomPlay : function() {
			return getCookie("ikemu-custom-play");
		}, 
		
		/**
		 * Sets the title of the game to Campaign Title + " | " + Campaign Brand...
		 */
		setTitle : function(title) {
			// Set gameTitle...
			gameTitle = title;
			/**
			 * Write gameTitle to <title></title>
			 */
			var finalTitle = UtilityService.getTitle();
			document.title = finalTitle;
		},
		
		hexToString : function(tmp) {
			var arr = tmp.split('&#'), str = '', i = 0, arr_len = arr.length, c;
			
			var h2d = function(h) {
				if(h.toUpperCase() != "A" && h.toUpperCase() != "B" && h.toUpperCase() != "C" && h.toUpperCase() != "D" && h.toUpperCase() != "E" && h.toUpperCase() != "F")
					return parseInt(h, 16);
			}
			
		    for (; i < arr_len; i += 1) {
		    		var hex = h2d(arr[i]);
		    		if(!isNaN(hex)) {
		    			c = String.fromCharCode(hex);
		    			str += c;
		    		} else {
		    			str += arr[i];
		    		}
		    }
		 
		    return str;
		},
		
		/**
		 * Gets the game title of the game....
		 */
		getTitle : function() {
			return UtilityService.hexToString(gameTitle);
		}
		
	}
	
})();

var Analytics = (function() {
	return {
        init : function(acct){
			(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
        		(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
        		m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
        		})(window,document,'script','//www.google-analytics.com/analytics.js','ga');
        	
	        	//create the tracker
	        	//ga('create', acct, primaryDomain); 
	        	//ga('require', 'displayfeatures');
        },
		trackEvent	: function(event){
			if(ikemuSettings != null){
				//IkemuStatsAPI.log('[Mobile Analytics] Tracking game start of game ', ikemuSettings.gameId);
				//ga('send', 'event', 'game', event, ikemuSettings.gameId);
			}
		}
	}
})();