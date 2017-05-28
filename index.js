var fs = require('fs');
var jsdom = require("jsdom/lib/old-api.js");
var alphabets = 'abcdefghijklmnopqrstuvwxyz';

var svgDimensions = {
	width: 1000,
	height: 800
}

console.log('Searching for JS files ....');

fs
	.readdirSync(__dirname)
	.filter(function(file) {
		return (file.indexOf(".") !== 0) && (file !== "index.js") && (file.split(".")[1] === "js");
	})
	.forEach(function(file) {

		console.log('Found ' + file);
		var fileContent = fs.readFileSync(file, {
			encoding: 'utf-8'
		});

		var strippedContent = fileContent.replace(/\r?\n|\r|\t/g, '').toLowerCase();
		var fillables = [];
		var contentClone = strippedContent;
		var ctstring = "";
		var words = {};

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

		var totalWords = 0;
		for (var word in words) {
			totalWords = totalWords + words[word];
		};

		jsdom.env(
			"<html><body></body></html>", ['http://d3js.org/d3.v3.min.js'],
			function(err, window) {
				var svg = window.d3.select("body")
					.append("svg")
					.attr("width", svgDimensions.width).attr("height", svgDimensions.height);

				for (var word in words) {
					var textSize = Math.floor((words[word] * 100) / totalWords).toString();
					svg.append("text")
						.style("font-size", `${textSize*3}px`)
						.attr("x", Math.floor(Math.random() * (svgDimensions.width - (svgDimensions.width - svgDimensions.height) * 2)))
						.attr("y", Math.floor(Math.random() * (svgDimensions.height - (svgDimensions.width - svgDimensions.height) * 2)))
						.attr("text-anchor", "begin")
						.attr("transform", `translate(300,150) rotate(${textSize})`)
						.text(word)
				}

				fs.writeFileSync('out.html', "<html><body>" + window.d3.select("body").html() + "</body></html>");

				console.log('Generated out.html');

			}
		);

	})