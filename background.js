var started = false,
	username, deckURL, tabURL,
	currentTab = 0,
	pages = [];


// When the extension is installed or upgraded ...
chrome.runtime.onInstalled.addListener(function() {
	chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
		chrome.declarativeContent.onPageChanged.addRules([
			{
		        conditions: [
		          new chrome.declarativeContent.PageStateMatcher({
		            pageUrl: { urlContains: 'slides.com' },
		          })
		        ],
				actions: [ 
					new chrome.declarativeContent.ShowPageAction()
				]
			}
		]);
	});
});

//listen for popup click to start extension
chrome.runtime.onMessage.addListener( function(request, sender, response){
	console.log(request);

	if (request.started){
		started = request.started;
		username = request.username;
		deckURL = request.deckURL;

		start();
	}

	if (request.stop){
		stop();
	}

	response({
		started: started
	})
});

//gets current tab and injects relevant CSS and JS into the tab
function start() {
	console.log('start');
	pages = [];
	chrome.tabs.query({
		active: true,
		currentWindow: true
	}, function(result){
		currentTab = result[0].id;
		tabURL = result[0].url;

		updateQuotes();
	})
}

function stop(){
	started = false;
	chrome.pageAction.setIcon({
        path: '/images/icon-38.png',
        tabId: currentTab
    });
}

function updateQuotes(){
	console.log('updateQuotes');

	chrome.pageAction.setIcon({
        path: '/images/active-icon.png',
        tabId: currentTab
    });

	$.ajax({
	  method: "post",
	  url: "http://localhost:3000/methods/updateQuotesFromExtension",
	  data: JSON.stringify([tabURL, username, deckURL]),
	  contentType: "application/json",
	  success: function (data) {
	  	console.log(data);	  	
	  }
	});
}

chrome.tabs.onUpdated.addListener(function(tabId, changedInfo, tab){
	if (started == true && changedInfo.url && tabId == currentTab){
		tabURL = tab.url
		updateQuotes();
	}
});
	