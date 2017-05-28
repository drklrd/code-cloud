var fs = require('fs');
var jsdom = require("jsdom/lib/old-api.js");
var alphabets = 'abcdefghijklmnopqrstuvwxyz';

fs
	.readdirSync(__dirname)
	.filter(function(file) {
		return (file.indexOf(".") !== 0) && (file !== "index.js") && (file.split(".")[1] === "js");
	})
	.forEach(function(file) {
		
		var fileContent = fs.readFileSync(file, {
			encoding: 'utf-8'
		});
		console.log(fileContent)
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

		jsdom.env(
			"<html><body></body></html>", ['http://d3js.org/d3.v3.min.js'],
			function(err, window) {
				var svg = window.d3.select("body")
					.append("svg")
					.attr("width", 1000).attr("height", 1000);

				for (var word in words) {
					svg.append("text")
						.attr("x", Math.floor(Math.random() * 1000))
						.attr("y", Math.floor(Math.random() * 1000))
						.text(word)
				}

				fs.writeFileSync('out.html', "<html><body>" + window.d3.select("body").html() + "</body></html>"); // or this

			}
		);

	})