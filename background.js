var started = false,
	currentTab = 0,
	pages = [];


//listen for popup click to start extension
chrome.runtime.onMessage.addListener( function(request, sender, response){
	started = request.started;

	if (started == true)
		startReactionaly();
	else if (started == false)
		endReactionaly();
});

//gets current tab and injects relevant CSS and JS into the tab
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

//ends extension by creating a new window, pulling all stored pages in pages array, and appending them to storage.html file which gets rendered in new window
function endReactionaly() {

	//push current page into pages array
	chrome.storage.local.get('page', function(result){
		var page = JSON.parse(result.page);
		var document;

		pages.push(page);

		var views = chrome.extension.getViews();
		var storageCreated = views.some(function(view){
			return endsWith(view.location.href, "/storage.html");
		});

		if (!storageCreated){
			chrome.tabs.create({
				url: "storage.html",
				active: true
			}, function(){
				views = chrome.extension.getViews();
				views.forEach(function(view){
					if (endsWith(view.location.href, "/storage.html")){
						document = view.document;
						renderPages(document, pages);
					}
				});

				resetPages();
			});
		} else {
			views.forEach(function(view){
				if (endsWith(view.location.href, "/storage.html")){
					document = view.document;
					clearDocument(document);
					renderPages(document, pages);
				}
			});

			//reset pages
			resetPages();
		}
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

function renderPages(document, pages){
	pages.forEach(function(page, index){

		var container = document.createElement("div");
		container.setAttribute("class", "screenshot-container");

		document.body.appendChild(container);

		var newCanvas = document.createElement("canvas");
		newCanvas.setAttribute("class", "screenshot-canvas");
		newCanvas.setAttribute("id", "canvas-" + (index + 1));

		container.appendChild(newCanvas);

		var screenShot = new Image;
		screenShot.src = page.initialShot;
		// container.appendChild(screenShot);

		var heatmap = new Image;
		heatmap.src = page.heatmap;
		// container.appendChild(heatmap);

		newCanvas.width = screenShot.width;
		newCanvas.height = screenShot.width;

		var ctx = newCanvas.getContext("2d");

		screenShot.onload = function(){
			var imgWidth = this.width;
			var imgHeight = this.height;
			ctx.drawImage(screenShot, 0, 0, imgWidth, imgHeight);
		}

		heatmap.onload = function(){
			var imgWidth = this.width;
			var imgHeight = this.height;
			ctx.drawImage(heatmap, 0, 0, imgWidth, imgHeight);
		}
	})
}

function resetPages(){
	pages = [];
	chrome.storage.local.remove('page');
}

function clearDocument(document){
	var containers = document.getElementsByClassName('screenshot-container');
	while (containers.length > 0){
		containers[0].remove();
	}
}

function endsWith(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
}
	