$('body').append('<div id="heatmapContainer"></div>');


$('#heatmapContainer').css({
  "height": $('body').outerHeight(),
  "width": $(window).outerWidth()
});

var initialScreenShot,
    page = {};

//capture screenshot of page on start and save it to local storage
takeScreenShot(null);


//config heatmap settings
var config = {
  container: document.getElementById('heatmapContainer'),
  radius: 30,
  maxOpacity: .5,
  minOpacity: 0,
  blur: .75
};

var heatmap = h337.create(config);
var trackData = false;
var idleTimeout, 
    idleInterval,
    lastX,
    lastY,
    idleCount = 0;

setInterval(function() {
  trackData = true;
}, 50);


$(window).on('mousemove', function(e){
  if (idleTimeout) clearTimeout(idleTimeout);
  if (idleInterval) clearInterval(idleInterval);

  if (trackData) {
    lastX = e.pageX;
    lastY = e.pageY;
    heatmap.addData({
      x: lastX,
      y: lastY
    });
    trackData = false;

    page = {
      initialShot: initialScreenShot,
      heatmap: heatmap.getDataURL()
    }

    page = JSON.stringify(page);


    chrome.storage.local.set({'page': page});
  }
  
  idleTimeout = setTimeout(startIdle, 500);
})

$(window).on('click', function(){
  takeScreenShot(heatmap);
})

function startIdle() {
  function idle() {
    heatmap.addData({
      x: lastX,
      y: lastY
    });
    idleCount++;
    if (idleCount > 10) {
      clearInterval(idleInterval);
    }
  };
  idle();
  idleInterval = setInterval(idle, 1000);
};

function takeScreenShot(heatmap){
  html2canvas(document.body, {
    useCORS: true,
    logging: true,
    onrendered: function(canvas) {
      console.log('screenshot taken');
      initialScreenShot = canvas.toDataURL();

      page = {
        initialShot: initialScreenShot,
        heatmap: heatmap
      }

      page = JSON.stringify(page);

      chrome.storage.local.set({'page': page});
    }
  });
}