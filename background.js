var started = false,
	currentTab = 0,
	pages = [];


chrome.runtime.onMessage.addListener( function(request, sender, response){
	started = request.started;

	if (started == true)
		startReactionaly();
	else if (started == false)
		endReactionaly();
});

function startReactionaly() {
	pages = [];
	chrome.tabs.query({
		active: true,
		currentWindow: true
	}, function(result){

		currentTab = result[0].id;

		chrome.tabs.insertCSS(currentTab, {
			file : "heatmap.css"
		});
		chrome.tabs.executeScript(currentTab, {file: "jquery-1.11.1.min.js"}, function() {
			chrome.tabs.executeScript(currentTab, {file: "heatmap.min.js" });
			chrome.tabs.executeScript(currentTab, {file: "html2canvas.js"});
		    chrome.tabs.executeScript(currentTab, {file: "reactional.js" });
		});
	})
}

function endReactionaly() {
	pageIndex = 0;

	//push current page into pages array
	chrome.storage.local.get('page', function(result){
		var page = JSON.parse(result.page);
		pages.push(page);

		chrome.windows.create({
			url: "storage.html",
			focused: true,
			type: 'panel'
		}, function(){
			var views = chrome.extension.getViews();
			views.forEach(function(view){
				if (endsWith(view.location.href, "/storage.html")){
					pages.forEach(function(page){
						console.log(page);
						console.log(page.initialShot);
						console.log(page.heatmap);
						var document = view.document;

						var container = document.createElement("div");
						container.setAttribute("class", "screenshot-container");

						var screenShot = document.createElement( "img" );
						screenShot.setAttribute("class", "screenshot");
						screenShot.src = page.initialShot;

						var heatmap = document.createElement('img');
						heatmap.setAttribute("class", "heatmap");
						heatmap.src = page.heatmap;

						container.appendChild(screenShot);
						container.appendChild(heatmap);

						document.body.appendChild(container);
					})
				}
			});
		});
	});
}

chrome.tabs.onUpdated.addListener(function(tabId, changedInfo, tab){
	if (started == true && changedInfo.url && tabId == currentTab){

		chrome.tabs.insertCSS(currentTab, {
			file : "heatmap.css"
		});


		chrome.tabs.executeScript(currentTab, {file: "jquery-1.11.1.min.js"}, function() {
			chrome.tabs.executeScript(currentTab, {file: "heatmap.min.js" });
			chrome.tabs.executeScript(currentTab, {file: "html2canvas.js"});
		    chrome.tabs.executeScript(currentTab, {file: "reactional.js" });
		});

		chrome.storage.local.get('page', function(result){
			var page = JSON.parse(result.page);
			pages.push(page);
		});
	}
});

function endsWith(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
}
// chrome.storage.local.get( 'page1', function(result){
// 	console.log(result);
// });
	