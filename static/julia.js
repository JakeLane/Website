// global variables
var zoomX, zoomY, zoomFactor, zoomTop, zoomLeft, mouseDownX, moueDownY, daIP;
$.ajaxSetup({
	async : false
});

// get canvas element
var canvas = document.getElementById("juliaset");

// Reset zoom to default
Reset();

$.get('http://jsonip.com', function(res) {
	daIP = res.ip;
});

// Generate iteration points
try {
	var randomStreamReal = new Math.seedrandom(daIP);
	var randomStreamImaginary = new Math.seedrandom(daIP.split("").reverse().join(""));
	var realFix = ((randomStreamReal() * (0.99999 + 0.99999) - 0.99999).toFixed(5)) * (-1 + Math.round(randomStreamImaginary()) * 2);
	var imagFix = ((randomStreamImaginary() * (0.99999 + 0.99999) - 0.99999).toFixed(5)) * (-1 + Math.round(randomStreamImaginary()) * 2);
} catch (error) {
	console.log("Error occured generating fixed interation positions: " + error)
	var realFix = -0.65175;
	var imagFix = 0.41850;
}

DrawMandelbrot(); // Run code

function Reset() {
	// default position and size
	zoomX = 0.0;
	zoomY = 0.0;

	width = canvas.width;
	height = canvas.width;

	// scale down to smaller of both sides
	if (width < height) {
		zoomFactor = width / 3.6;
	} else {
		zoomFactor = height / 3.6;
	}
}

function DrawMandelbrot() {
	// recalc left top
	zoomLeft = zoomX - (width / zoomFactor / 2);
	zoomTop = zoomY - (height / zoomFactor / 2);

	var ctx = canvas.getContext("2d");
	if (ctx) {
		var imgData = ctx.createImageData(width, height);

		// calculate each point of rectangle
		for (var y = 1; y <= height; y++) {
			for (var x = 1; x <= width; x++) {
				var dataPointer = (((y - 1) * width + x) - 1) * 4;

				var real = zoomLeft + x / zoomFactor;
				var imag = zoomTop + y / zoomFactor;

				var iterations = IsJuliaMenge(real, imag);
				if (iterations == -1) {
					// is in mandelbrot, make point white
					imgData.data[dataPointer + 0] = 0;
					imgData.data[dataPointer + 1] = 0;
					imgData.data[dataPointer + 2] = 0;
					imgData.data[dataPointer + 3] = 255;
				} else {
					// is outside mandelbrot, color dependent on iterations
					imgData.data[dataPointer + 0] = iterations % 255;
					imgData.data[dataPointer + 1] = iterations % 255;
					imgData.data[dataPointer + 2] = (iterations * 5) % 255;
					imgData.data[dataPointer + 3] = iterations * 30;
				}
			}
		}
		ctx.putImageData(imgData, 0, 0);
		var imageDataURL = canvas.toDataURL();
		changeFavicon(imageDataURL);
	}
}

function IsJuliaMenge(real, imag) {
	var temp = 0.0;
	var realNew = real;
	var imagNew = imag;

	for (var iteration = 0; iteration < 20; iteration++) {
		temp = realNew * realNew - imagNew * imagNew + realFix;
		imagNew = 2 * realNew * imagNew + imagFix;
		realNew = temp;

		// check if not in mandelbrot
		if (realNew * realNew + imagNew * imagNew > 4) {
			return iteration;
		}
	}

	// this point is in mandelbrot
	return -1;
}

function changeFavicon(src) {
	var link = document.createElement("link"), oldLink = document.getElementById("dynamic-favicon");
	link.id = "dynamic-favicon";
	link.rel = "shortcut icon";
	link.href = src;
	document.head = document.head || document.getElementsByTagName("head")[0];
	if (oldLink) {
		document.head.removeChild(oldLink);
	}
	document.head.appendChild(link);
}