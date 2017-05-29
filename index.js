var fs = require('fs');
var jsdom = require("jsdom/lib/old-api.js");
var alphabets = 'abcdefghijklmnopqrstuvwxyz';

var svgDimensions = {
	width: 1500,
	height: 800
};

function sortObj(obj){

	var sortedArray = [];
	var sortedobj = {};
	for (var word in words) {
	    sortedArray.push([word, words[word]]);
	}

	sortedArray.sort(function(a, b) {
	    return a[1] - b[1];
	});

	sortedArray.forEach(function(sorted){
		sortedobj[sorted[0]] = sorted[1];
	});

	return sortedobj;
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


words = sortObj(words);

console.log(words);

var startingHex = '255';
var colorChangeRate = Math.floor(Number(startingHex)/(Object.keys(words).length));

jsdom.env(
	"<html><body></body></html>", ['http://d3js.org/d3.v3.min.js'],
	function(err, window) {

		var svg = window.d3.select("body")
			.append("svg")
			.style("position","absolute")
			.style("left","20%")
			.attr("width", "100%")
			.attr("height", "100%")
			.append("g")
			.attr("transform", "translate(250,250)");

		var colorStep = 0;
		for (var word in words) {
			var textSize = Math.floor((words[word] * 100) / totalWords).toString();
			svg.append("text")
				.style("font-size", `${textSize*10+10}px`)
				.style('fill',`rgb(${startingHex-colorStep},${startingHex-colorStep},${startingHex-colorStep})`)
				.attr("x", (Math.random() < 0.5 ? -1 : 1) * Math.floor(Math.random() * (svgDimensions.width)/3))
				.attr("y", (Math.random() < 0.5 ? -1 : 1) * Math.floor(Math.random() * (svgDimensions.height)/3)	)
				.attr("text-anchor", "begin")
				.attr("transform", `translate(300,150) rotate(${textSize})`)
				.text(word)

			if(Object.keys(words).length % colorStep !== colorChangeRate) {
				colorStep  = colorStep + colorChangeRate;
			}
			

		}

		fs.writeFileSync('out.html', window.d3.select("body").html() + "<script> \
				window.d3.select('body')\
					.call(window.d3.behavior.zoom()\
					.on('zoom',function(){  \
						var text = `scale(${window.d3.event.scale})` ;  \
						window.d3.select('body').style('transform',text)  \
					})).append('g') \
		</script>");

		console.log('Generated out.html');

	}
);