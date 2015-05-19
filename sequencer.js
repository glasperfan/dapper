/*
 *
 * Basic Sequencer.
 * Built by Hugh Zabriskie.
 *
 */
 
 Sequencer = function(_tempo, _phraseLength) {
	tempo = _tempo; // global (for all tracks)
	TRACKS = []; // global (for all tracks)
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
	
	this.PATHS = ['kick.wav', 'snare.wav', 'hihat.wav']; // filenames
	this.NAMES = this.PATHS.map(function(el) { return el.substr(0, el.length - 4); });
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
		for (var index in that.PATHS) {
			var file = that.PATHS[index];
			var name = file.substr(0, file.length - 4);
			that.BUFFERS[name] = globalContext.createBufferSource();
			that.BUFFERS[name].buffer = bufferList[index];
			that.BUFFERS[name].connect(globalContext.destination);
		}
	}
	
	// NOTE: REMOVE AFTER TESTS
	this.testloop = document.getElementById("testloop");
}

Sequencer.prototype.evaluateCommand = function(c) {
	this.tokens = c.split(" ");

	// evalutate on first command
	if (this.tokens[0] === "add") this.addLayer();
	if (this.tokens[0] === "tempo") this.setTempo();
	if (this.tokens[0] === "play") this.startAll();
	if (this.tokens[0] === "stop") this.stopAll();
	if (this.tokens[0] === "pause") this.pause();
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
		if (!newTrack.error)
			TRACKS.push(newTrack);
	}
}

// this is where the sequencing happens
Sequencer.prototype.eventLoop = function() {
	console.log("playing");
	// go through stack of tracks and press play on each one
	for (var index in TRACKS) {
		var t = TRACKS[index];
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

// Start all tracks - synchronized calls to eventLoop
Sequencer.prototype.startAll = function() {
	this.eventLoop();
	this.interval = setInterval(this.eventLoop, 60 / tempo * 4000);
}

// Clear tracks and end event loop.
Sequencer.prototype.stopAll = function() {
	TRACKS = [];
	this.pause();
}

Sequencer.prototype.pause = function() {
	clearInterval(this.interval);
}

Sequencer.prototype.onError = function(reason) {
	console.log(reason);
}
