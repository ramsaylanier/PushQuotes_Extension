$(function(){
	$('.download-button').on('click', function(){
		var zip = new JSZip();

		var screenShots = $('.screenshot-canvas');

		screenShots.each(function(index){
			var image = this.toDataURL("image/png");
			var prefix = "data:image/png;base64,";
			image = image.substr(22);

			zip.file("screenshot" + index + ".png", image, {
				base64: true
			});

			console.log(zip);
		})

		var blob = zip.generate({type:"blob"});

		saveAs(blob, "screenshots.zip");
	});

	var changeCount = 0,
		originalImageData = {};

	$('.slider-input').on('change', function(){
		var heatmaps = $('.heatmap-canvas');
		var value = this.value / 255;

		changeCount++;

		heatmaps.each(function(index, heatmap){
			var context = heatmap.getContext('2d');
			var imageData = context.getImageData(0,0,heatmap.width, heatmap.height);

			if (changeCount == 1){
				originalImageData[index] = imageData;
			}
			
			changeImageData(index, heatmap, imageData, value);
			context.putImageData(imageData, 0, 0);

		});
	});


	function changeImageData(index, heatmap, imageData, value){
		var data = imageData.data;
		for(var i = 0, n = data.length; i < n; i += 4) {
			originalAlpha = originalImageData[index].data[i+3];
       		data[i + 3] = originalAlpha * value;
        }
	}
});
