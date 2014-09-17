$('body').append('<div id="heatmapContainer"></div>');


$('#heatmapContainer').css({
  "height": $('body').outerHeight(),
  "width": $(window).outerWidth()
});

var initialScreenShot,
    page = {};

//capture screenshot of page on start and save it to local storage
html2canvas(document.body, {
  onrendered: function(canvas) {
    console.log('screenshot taken');
    initialScreenShot = canvas.toDataURL();

    page = {
      initialShot: initialScreenShot,
      heatmap: ''
    }

    page = JSON.stringify(page);

    chrome.storage.local.set({'page': page});
  }
});



//config heatmap settings
var config = {
  container: document.getElementById('heatmapContainer'),
  radius: 50,
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


$('#heatmapContainer').on('mousemove', function(e){
  console.log('moving');
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