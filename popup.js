$(function() {
   $('#start-btn').on('click', function(){
	    chrome.runtime.sendMessage({started: true});
	});

   $('#stop-btn').on('click', function(){
   		chrome.runtime.sendMessage({started: false});
   })
});
