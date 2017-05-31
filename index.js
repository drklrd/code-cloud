var fs = require('fs');
var jsdom = require("jsdom/lib/old-api.js");
var alphabets = 'abcdefghijklmnopqrstuvwxyz';
var recursive = require("recursive-readdir");

try {
	var config = require(__dirname + '/codecloud.config.js');
} catch (e) {
	throw e;
}

var svgDimensions = {
	width: "1000",
	height: "1000"
};
var startingHex = '255';
var words = {};
var totalWords =  0;
var ctstring = "";

function sortObj(obj) {

	var sortedArray = [];
	var sortedobj = {};
	for (var word in words) {
		sortedArray.push([word, words[word]]);
	}
	sortedArray.sort(function(a, b) {
		return a[1] - b[1];
	});
	sortedArray.forEach(function(sorted) {
		sortedobj[sorted[0]] = sorted[1];
	});
	return sortedobj;
}

console.log('Searching for  files ....');

recursive("./", config.exclude, function(err, files) {

	var filesToRead = files.filter(function(file) {
		return (config.tests).test(file) && (file !== "codecloud.config.js");
		// return (file.indexOf(".") !== 0) && (file !== "index.js") && (file.split(".")[1] === "js");
	});

	console.log(`Found ${filesToRead.length} files ....`)

	filesToRead.forEach(function(file) {

		console.log('=====> ' + file);
		var fileContent = fs.readFileSync(config.inputDir + '/' + file, {
			encoding: 'utf-8'
		});

		var strippedContent = fileContent.replace(/\r?\n|\r|\t/g, '').toLowerCase();

		for (var char = 0; char < strippedContent.length; char++) {
			if (alphabets.indexOf(strippedContent[char]) === -1) {
				if (words[ctstring] || words[ctstring] === 0) {
					words[ctstring] = words[ctstring] + 1;
				} else {
					words[ctstring] = 1;
				}
				ctstring = "";
			} else {
				ctstring = ctstring + strippedContent[char];
			}
		}

	});

	for (var word in words) {
		var allAlphabets = true;
		if (word && word.length) {
			for (var char = 0; char < word.length; char++) {
				if (alphabets.indexOf(word[char]) === -1) {
					allAlphabets = false;
					break;
				}
			}
		} else {
			allAlphabets = false;
		}

		if (!allAlphabets) {
			delete words[word];
		}
	};

	for (var word in words) {
		totalWords =  totalWords + words[word];
	};

	words = sortObj(words);
	var rate = Number(startingHex) / (Object.keys(words).length);
	var colorChangeRate = rate <=0.5 ? 1 : Math.round(rate);

	console.log(`Found ${Object.keys(words).length} different words`)

	console.log('Creating DOMs. Please wait ....');

	jsdom.env(
		"<html><body></body></html>", ['./node_modules/d3/d3.min.js'],
		function(err, window) {

			var svg = window.d3.select("body")
				.append("svg")
				.attr("width", `${svgDimensions.width}`)
				.attr("height", `${svgDimensions.height}`)

			var colorStep = 0;
			var wordStep = 0;
			for (var word in words) {
				var textSize = ((words[word]*100) / totalWords);
				if (wordStep === (Object.keys(words).length - 1)) {
					var posX = (svgDimensions.width / 2);
					var posY = (svgDimensions.height / 2);
				} else {
					var posX = Math.round((Math.random() * svgDimensions.width) - 30);
					var posY = Math.round((Math.random() * svgDimensions.height) - 30);
				}
				svg.append("text")
					.style("font-size", `${textSize*10+5}px`)
					.style('fill', `rgb(${startingHex-colorStep},${startingHex-colorStep},${startingHex-colorStep})`)
					.attr("x", posX)
					.attr("y", posY)
					.attr("text-anchor", "begin")
					.attr("transform", `rotate(${textSize})`)
					.text(word)

				colorStep = colorStep + colorChangeRate;
				wordStep++;
			};

			var infoHTML = `<h1>Code-cloud generated from ${Object.keys(words).length} words , ${filesToRead.length} files </h1> `;
			var statText = `<p>Most frequent word : ${Object.keys(words)[Object.keys(words).length-1]} <p> `;

			fs.writeFileSync('index.html', infoHTML + statText+ window.d3.select("body").html() + "<script> \
  				window.d3.select('body')\
  					.call(window.d3.behavior.zoom()\
  					.on('zoom',function(){  \
  						var text = `scale(${window.d3.event.scale})` ;  \
  						window.d3.select('body').style('transform',text)  \
  					})).append('g'); \
  				var factor=0;\
  				var interval = setInterval(function(){\
  					if(factor<=1){\
  						window.d3.select('body').style('transform',`scale(${factor})`);\
  						factor = factor + 0.1;\
  					}else{\
  						clearInterval(interval);\
  					}\
  				},100);\
  				</script>");

			console.log('Generated out.html');
			console.log('DONE !!!!!!!!!!!!!');
			process.exit();

		}
	);



});