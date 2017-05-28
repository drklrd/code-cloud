var fs = require('fs');

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

		console.log(words);


	})