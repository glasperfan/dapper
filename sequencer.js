/*
 *
 * Basic Sequencer.
 * Built by Hugh Zabriskie.
 *
 */
 
 Sequencer = function(_tempo, _phraseLength) {
	tempo = _tempo; 		// global
	TRACKS = []; 			// global (for all tracks)
	SECTIONS = {};			// global (stores sections, each a collection of tracks)
	playSection = null; 	// global (tracks current selection being played)
	loopOn = false; 		// global (is event loop already running?)
	this.section = null;
	this.phraseLength = _phraseLength;
	 
 	this.init();
 }

Sequencer.prototype.init = function() {

	var that = this;
	
	// set audio context and check API is functional
	try {
	    AudioContext = window.AudioContext || window.webkitAudioContext;
	   	globalContext = new AudioContext(); // global
	} catch(e) {
	    alert("Web Audio API is not supported in this browser");
		return;
	}
	
	// filenames and paths
	this.NAMES = [
		'kick',
		'kick-2',
		'kick-3',
		'ekick-1',
		'ekick-2',
		'ekick-3',
		'dry-kick',
		'boom-kick',
		'zill',
		'gong',
		'ride',
		'ride-2',
		'ride-3',
		'ride-4',
		'hihat',
		'hihat-2',
		'hihat-3',
		'hihat-4',
		'hihat-5',
		'hihat-6',
		'hihat-7',
		'hihat-8',
		'ohihat',
		'ohihat-2',
		'ohihat-3',
		'ohihat-4',
		'cross',
		'cross-2',
		'snare',
		'snare-2',
		'snare-3',
		'snare-4',
		'snare-5',
		'snare-6'	
	];
	this.PATHS = this.NAMES.map(function(d) { return "/sounds/" + d + ".wav"; });

	this.BUFFERS = {}; // buffer objects
	
	// custom class for loading multiple sound clips
	// thanks to Boris Smus (http://www.html5rocks.com/en/tutorials/webaudio/intro/js/buffer-loader.js)
	this.bufferLoader = new BufferLoader(
		globalContext,
		this.PATHS, 
		finishedLoading);
	this.bufferLoader.load();

	// finish loading buffers (audio files)
	function finishedLoading(bufferList) {
		for (var index in that.NAMES) {
			var name = that.NAMES[index];
			that.BUFFERS[name] = bufferList[index];
		}
	}
	
}

Sequencer.prototype.evaluateCommand = function(c) {
	this.tokens = c.split(" ");

	// evalutate on first command
	if (this.tokens[0] === "add") 		this.addLayer();
	if (this.tokens[0] === "remove") 	this.removeLayer();
	if (this.tokens[0] === "build") 	this.buildSection();
	if (this.tokens[0] === "end")		this.endSection();
	if (this.tokens[0] === "tempo") 	this.setTempo();
	if (this.tokens[0] === "play") 		this.play();
	if (this.tokens[0] === "stop") 		this.stopAll();
	if (this.tokens[0] === "pause") 	this.pause();
}

Sequencer.prototype.addLayer = function() {
	// error checking
	if (this.tokens[1] === undefined)
		this.onError("No instrument defined. Try: 'add snare 1 2 4'.");
	else if (this.NAMES.indexOf(this.tokens[1]) < 0)
		this.onError("No instrument exists with the name: '" + this.tokens[1] + "'.");	
	else {
		var newLayer = this.BUFFERS[this.tokens[1]];
		var newTrack = new Track(newLayer, this.tokens);
		if (newTrack.error)
			this.onError(newTrack.error);
		else if (this.section)
			SECTIONS[this.section].tracks.push(newTrack);
		else
			TRACKS.push(newTrack);
	}
}

Sequencer.prototype.removeLayer = function() {
	var that = this;
	// remove all or a specific one?
	if (this.tokens[1] === undefined) {
		TRACKS = [];
		SECTIONS = {};
	} else if (this.tokens[1] === "last") {
		// remove most recently added track
		while(TRACKS.pop() === undefined) {}
	} else if (this.NAMES.indexOf(this.tokens[1]) > -1) {
		TRACKS = TRACKS.filter(function(d) { 
			return d.type !== that.tokens[1];
		});
	}
}

// this is where the sequencing happens
Sequencer.prototype.eventLoop = function() {
	var selection = playSection ? SECTIONS[playSection].tracks : TRACKS;
	// go through stack of tracks and press play on each one
	for (var index in selection) {
		var t = selection[index];
		t.playBar();
	}
}

Sequencer.prototype.setTempo = function() {
	var newTempo = this.tokens[1];
	if (newTempo === undefined)
		this.onError("You must specify a tempo between 60 and 240.");
	else {
		newTempo = parseInt(newTempo);
		if (newTempo < 60 || newTempo > 240)
			this.onError("The tempo must be between 60 and 240.");
		else {
			tempo = newTempo;
			this.stopAll();
		}
	}
}

Sequencer.prototype.buildSection = function() {
	if (this.tokens[1] === undefined)
		this.onError("You must define a section name to build one.");
	else {
		// if they were already building a section, scrap the old one
		if (this.section) {
			this.onError("Scrapping the unfinished section " + this.section);
			delete SECTIONS[this.section];
		}
		// if a section already exists with that name, start over
		if (SECTIONS[this.section] !== undefined) {
			this.onError("Scrapping the existing section " + this.section + " and starting over.");
		}
		
		this.section = this.tokens[1];
		SECTIONS[this.section] = {};
		SECTIONS[this.section].built = false;
		SECTIONS[this.section].tracks = [];
	}
}

Sequencer.prototype.endSection = function() {
	SECTIONS[this.section].built = true; // this.section = current section
	console.log(SECTIONS[this.section]);
	this.section = null;
}

// Start all tracks - synchronized calls to eventLoop
Sequencer.prototype.play = function() {
	if (this.tokens[1] === undefined) { // play TRACKS
		playSection = null;
	} else if (SECTIONS[this.tokens[1]] === undefined) { // error
		return this.onError("No section " + this.tokens[1] + " exists.");
	} else {
		playSection = this.tokens[1];
	}
	
	if (!loopOn) {
		this.eventLoop();
		this.interval = setInterval(this.eventLoop, 60 / tempo * 4000);
		loopOn = true;
	}
}

// Clear tracks and end event loop.
Sequencer.prototype.stopAll = function() {
	TRACKS = [];
	SECTIONS = {};
	this.pause();
}

// Pause loop but don't remove sections
Sequencer.prototype.pause = function() {
	clearInterval(this.interval);
	loopOn = false;
}

Sequencer.prototype.onError = function(reason) {
	console.log(reason);
}
