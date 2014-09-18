$(function(){
	$('.download-button').on('click', function(){
		var zip = new JSZip();

		var screenShots = $('.screenshot-canvas');

		screenShots.each(function(index){
			var image = this.toDataURL("image/png");
			console.log(image);

			var prefix = "data:image/png;base64,";
			console.log(prefix.length);

			image = image.substr(22);
			console.log(image);

			console.log(image);
			zip.file("screenshot" + index + ".png", image, {
				base64: true
			});

			console.log(zip);
		})

		var blob = zip.generate({type:"blob"});

		saveAs(blob, "screenshots.zip");
	});
});