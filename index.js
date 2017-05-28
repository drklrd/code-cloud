var fs = require('fs');
var jsdom = require("jsdom/lib/old-api.js");
var alphabets = 'abcdefghijklmnopqrstuvwxyz';

var svgDimensions = {
	width: 1500,
	height: 800
}

console.log('Searching for JS files ....');

var words = {};
var totalWords = 0;
var ctstring = "";

fs
	.readdirSync(__dirname + '/tests')
	.filter(function(file) {
		return (file.indexOf(".") !== 0) && (file !== "index.js") && (file.split(".")[1] === "js");
	})
	.forEach(function(file) {

		console.log('Found ' + file);
		var fileContent = fs.readFileSync(__dirname + '/tests/' + file, {
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
				.style("margin", `17px`)
				.attr("x", Math.floor(Math.random() * (svgDimensions.width - (200))))
				.attr("y", Math.floor(Math.random() * (svgDimensions.height - (200))))
				.attr("text-anchor", "begin")
				.attr("transform", `translate(300,150) rotate(${textSize})`)
				.text(word)
		}

		fs.writeFileSync('out.html', "<html><body>" + window.d3.select("body").html() + "</body></html>");

		console.log('Generated out.html');

	}
);