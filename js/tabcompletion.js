/*
 *
 * (Basic) tab completion tool built for this sequencer.
 * Built by Hugh Zabriskie.
 *
 */


function TabCompletion() {

	this.elements = document.getElementsByClassName("command");
	this.attrs = document.getElementsByClassName("attribute");
	this.displayTable = document.getElementById("tab-completion");
	this.command = document.getElementById("command");
	this.ul = document.createElement("ul");
	this.displayTable.appendChild(this.ul);

	this.commands = []
	for (var i = 0; i < this.elements.length; i++) {
		this.commands.push(this.elements[i].innerHTML);
	}

	this.attributes = [];
	for (var i = 0; i < this.attrs.length; i++)
		this.attributes[i] = this.attrs[i].innerHTML;

	this.typicalValues = TYPES; // instruments
	this.typicalValues = this.typicalValues.concat(Object.keys(SCALES)); // scales
	for (var i = 0; i <= 1; i += 0.1)
		this.typicalValues.push(i.toString()); // gain, probability, etc.
	for (var i = 1; i < 5; i += 0.25)
		this.typicalValues.push(i.toString()); // rhythms

	this.suggestions = null;

	
	
	// return an array of possible command prototypes that the input suggests
	// completes either commands, instruments and scales, or attributes
	// based on the current state of the command string
	this.offerSuggestion = function (command) {
		if (command === "" || command === " " || command === null)
			return [];

		var that = this;
		this.possibleOptions = [];
		this.suggestions = [];
		var i = command.length;

		var opens = 0;
		var closes = 0;
		for (index = 0; index < i; index++) {
			if (command[index] === "(") opens++;
			if (command[index] === ")") closes++;
		}
		var closures = opens - closes;
		
		// invalid syntax or completed token
		if (closures < 0 || command[i - 1] === ")") {
			return [];
		}

		// just finished token, so offer all attributes
		else if (closures === 0 && opens > 0 && command[i - 1] === " ") {
			return this.attributes;
		}
		
		// return attributes
		else if (closures === 0 && opens > 0) {
			this.possibleOptions = this.attributes;
			command = command.substring(command.lastIndexOf(" ") + 1);
		}

		// typical values
		else if (closures > 0 && opens > 0) {
			this.possibleOptions = this.typicalValues;
			command = command.substring(command.lastIndexOf("(") + 1);
			command = command.split(",");
			command = command[command.length - 1];
			if (command === "") return [];
		}
		
		// return commands
		else {
			this.possibleOptions = this.commands;
		}


		while (i > 0) {
			var fragment = command.slice(0, i)
			_.each(this.possibleOptions, function (d) {
				if (d.indexOf(fragment) !== -1)
					that.suggestions.push(d);
			});
			if (this.suggestions.length > 0)
				break;
			i--;
		}

		this.pruneSuggestions();
		return this.suggestions;
	}
	
	
	// populate the table with possible command prototypes
	this.broadcastSuggestion = function (command) {

		this.clearTable();

		var suggestions = this.offerSuggestion(command);

		if (suggestions.length < 1)
			return;

        for (var i = 0; i < suggestions.length; i++) {
			var li = document.createElement("li");
			li.innerHTML = suggestions[i];
			this.ul.appendChild(li);
        }
	}


	// empty suggestion table
	this.clearTable = function () {
		while (this.ul.firstChild)
			this.ul.removeChild(this.ul.firstChild);
	}
	
	
	// sort the suggestions by length and return the top 3
	this.pruneSuggestions = function () {
		if (!this.suggestions)
			return;

		if (this.suggestions.length <= 3)
			return;

		this.suggestions = this.suggestions.sort(function (a, b) {
			return a.length - b.length;
		});

		this.suggestions = this.suggestions.slice(0, 3);
	}
	
	// tab complete
	this.completeCommand = function () {
		var c = getCommand();

		if (c === "" || c === " " || this.suggestions.length === 0)
			return null;

		var val = this.suggestions[0];
		val = val.replace(/&gt;/g, ">");
		val = val.replace(/&lt;/g, "<");
		setCommand(val);
	}

}