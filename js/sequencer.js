/*
 *
 * Basic Sequencer.
 * Built by Hugh Zabriskie.
 *
 */

Sequencer = function (_tempo) {
	tempo = _tempo; 		// global tempo
	TRACKS = []; 			// global track container
	PLAYTRACKS = [];		// global list of playing tracks
	DISPLAYTRACKS = [];		// the subset of TRACKS displayed
	loopOn = false; 		// is event loop running?
	buildingSection = null;	// currently defining this section
	showSection = null;		// section displayed in the track table
	measureStart = 0.0; 	// store most recent measure start time
	globalTrackIndex = 0;	// increases with each new track created 
	
	this.table = document.getElementById("tracks-table");
	this.instructions = document.getElementById("instructions");
	this.message = document.getElementById("message");

	this.init();
};

Sequencer.prototype.init = function () {

	// validate the settings file
	if (!validator.settings.validate()) {
		console.log("ERROR: settings.js invalid...");
		return;
	}
	
	// set audio context and check API is functional
	try {
		AudioContext = window.AudioContext || window.webkitAudioContext;
		globalContext = new AudioContext(); // global
	} catch (e) {
		alert("Web Audio API is not supported in this browser");
		return;
	}
	
	// stores all buffer objects
	BUFFERS = new Object();
	
	// load default instruments
	var defaultInstruments = settings.defaultLoadedInstruments;
	if (defaultInstruments === undefined)
		defaultInstruments = Object.keys(settings.instruments);
	var loader = new InstrumentLoader();
	defaultInstruments.forEach(function (instr) {
		loader.load(instr);
	});

};




Sequencer.prototype.evaluateCommand = function (c) {
	this.tokens = c.split(" ");

	// evalutate on first command
	if (this.tokens[0] === "add") return this.addLayer();
	if (this.tokens[0] === "rm") return this.removeLayer();
	if (this.tokens[0] === "tempo") return this.setTempo();
	if (this.tokens[0] === "play") return this.play();
	if (this.tokens[0] === "stop") return this.stopAll();
	if (this.tokens[0] === "pause") return this.pause();
	if (this.tokens[0] === "show") return this.show();
	if (this.tokens[0] === "hide") return this.hide();
	if (this.tokens[0] === "define") return this.define();
	if (this.tokens[0] === "set") return this.set();

	return validator.onError(this.tokens[0] + " is not a command.");
};



Sequencer.prototype.addLayer = function () {
	
	var newTrack;
	if (this.tokens[1].indexOf("generator") === 0)
		newTrack = new Generator(this.tokens);
	else
		newTrack = new Instrument(this.tokens);

	if (newTrack.error)
		return validator.onError(newTrack.error);
	TRACKS.push(newTrack);

	this.update();
};



Sequencer.prototype.removeLayer = function () {
	var that = this;
	
	// remove all (cmd: rm)
	if (this.tokens[1] === undefined) {
		for (var track in TRACKS) TRACKS[track].stop();
		TRACKS = [];
	}
	
	// remove most recent (cmd: rm last)
	else if (this.tokens[1] === "last") { // remove most recently added track
		TRACKS[TRACKS.length - 1].stop();
		TRACKS.pop();
	}
	
	// remove by index (cmd: rm 5)
	else if (!isNaN(this.tokens[1])) {
		var index = parseInt(this.tokens[1]);
		if (index < 0 || index >= TRACKS.length)
			return validator.onError("rm : Invalid index argument.");
		TRACKS.splice(index, 1);
	}
	
	// remove by section (cmd: rm A)
	else if (sectionExists(this.tokens[1])) {
		var section = this.tokens[1].toUpperCase();
		TRACKS = TRACKS.filter(function (d) {
			var keepIt = true;
			if (_.contains(d.attributes.sections, section)) {
				d.stop();
				keepIt = false;
			}
			return keepIt;
		});
	}
	
	// remove by instrument (cmd: rm drums/Drum Kit)
	else if (instrumentExists(this.tokens[1])) {
		TRACKS = TRACKS.filter(function (d) {
			var keepIt = true;
			if (d.alias === that.tokens[1] || d.fullName === that.tokens[1]) {
				d.stop();
				keepIt = false;
			}
			return keepIt;
		});
	}
	
	// else fail
	else {
		return validator.onError("rm: Invalid argument.");
	}

	this.update();
};



Sequencer.prototype.eventLoop = function () {
	measureStart = globalContext.currentTime;
	for (var index in PLAYTRACKS)
		PLAYTRACKS[index].playBar();
};




Sequencer.prototype.setTempo = function () {
	var that = this;
	var newT = this.tokens[1];

	if (newT === undefined)
		return validator.onError("You must specify a tempo between 60 and 240.");

	newT = parseInt(newT);
	if (newT < 16)
		return validator.onError("The lowest recognized tempo is 16 bpm.");

	var oldTempo = tempo;
	tempo = newT;
	for (var i in TRACKS)
		TRACKS[i].init();

	if (loopOn) {
		this.pause();
		this.tokens = []; // flush tokens
		var waitTime = (measureStart + (60 / oldTempo * 4) - globalContext.currentTime) * 1000;
		setTimeout(function () { that.play(); }, waitTime);
	}
};




// Start tracks - synchronized calls to eventLoop
// TODO: fix tempo issue. add a track, play, set tempo or play then set tempo
Sequencer.prototype.play = function (isUpdate) {

	if (!isUpdate)
		this.lastPlayCommand = this.tokens[1];
	
	// "play", "play all"
	if (this.lastPlayCommand === undefined)
		PLAYTRACKS = TRACKS;
	else {
		// "play <sections>"
		var tracks = evaluateSectionEquation(this.lastPlayCommand);
		if (!tracks)
			return validator.onError("At least one specified section does not exist.");
		PLAYTRACKS = tracks;
	}
	
	// start the loop
	if (!loopOn) {
		this.eventLoop();
		this.interval = setInterval(this.eventLoop, 60 / tempo * 4000);
		loopOn = true;
	}
};




// Clear tracks and end event loop.
Sequencer.prototype.stopAll = function () {
	for (var t in TRACKS)
		TRACKS[t].stop();
	TRACKS = [];
	updateDisplay();
	this.pause();
};




// Pause loop
Sequencer.prototype.pause = function () {
	for (var t in TRACKS)
		TRACKS[t].pause();
	clearInterval(this.interval);
	loopOn = false;
};




// show tracks
Sequencer.prototype.show = function () {
	// display the instructions page
	if (this.tokens[1] === "instructions")
		show(this.instructions);	
	
	// display all tracks
	else if (this.tokens[1] === "all" || this.tokens[1] === undefined) {
		showSection = null;
		updateDisplay();
		show(this.table, "table");
	} 
	
	// display the section (if it exists)
	else {
		var section = this.tokens[1].toUpperCase();
		if (sectionExists(section))
			showSection = section;
		else
			return validator.onError("No section exists called " + section);
		updateDisplay();
	}
};




// hide tracks
Sequencer.prototype.hide = function () {
	if (this.tokens[1] === "instructions")
		hide(this.instructions);
	else
		hide(this.table);
};




Sequencer.prototype.define = function () {
	if (this.tokens[1] === undefined)
		return validator.onError("Define what? Specify a section.");
	else {
		var newSection = this.tokens[1].toUpperCase();
		// define end
		if (newSection === "END")
			buildingSection = null;
		
		// define <sectionEquation>
		else if (newSection.indexOf("=") !== -1) {
			// TODO: check that only one equals sign exists
			var components = newSection.split("=");
			var newSection = components[0];
			var tracks = evaluateSectionEquation(trimWhiteSpace(components[1]));
			TRACKS.map(function (d) {
				if (_.contains(tracks, d))
					d.sections.push(newSection);
				return d;
			});
			updateDisplay();
			return this.onInfo("Section " + newSection + " is now defined.");
		}
		
		// ensure the section does not have reserved symbols
		else if (newSection.indexOf("+") !== -1 ||
			newSection.indexOf("-") !== -1) {
			return validator.onError("Invalid section name.");
		} 
		
		//
		else
			buildingSection = newSection;
	}

	if (buildingSection)
		this.onInfo("Defining section " + buildingSection);
	else
		this.onInfo("Back to master...");
};

Sequencer.prototype.set = function () {
	var index = parseInt(this.tokens[1]);
	TRACKS[index].grabAttributes(this.tokens.join(" "));
};




Sequencer.prototype.update = function () {
	updateDisplay();
	// if it's already looping, generate a new play command to update PLAYTRACKS
	if (loopOn)
		this.play(true);
};



// TODO: make this different than onError?
Sequencer.prototype.onInfo = function (reason) {
	validator.onError(reason);
};



Sequencer.prototype.onError = function (reason) {
	this.message.innerHTML = "<code>" + reason + "</code>";
	show(this.message);
};