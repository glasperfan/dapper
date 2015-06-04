/*
 *
 * Basic Sequencer.
 * Built by Hugh Zabriskie.
 *
 */
 
 Sequencer = function(_tempo, _phraseLength) {
	tempo = _tempo; 		// global
	TRACKS = []; 			// global (for all tracks)
	loopOn = false; 		// global (is event loop already running?)
	this.phraseLength = _phraseLength;
	measureStart = 0.0; 	// store most recent measure start time
	 
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
		'ekick',
		'dry-kick',
		'boom-kick',
		'zill',
		'gong',
		'ride',
		'ride-2',
		'hihat',
		'hihat-3',
		'ohihat',
		'ohihat-2',
		'cross',
		'snare',
		'crash'
	];
	
	this.PATHS = this.NAMES.map(function(d) { return "/drums/" + d + ".wav"; });
	BUFFERS = {}; // buffer objects


	// custom class for loading multiple sound clips
	// thanks to Boris Smus (http://www.html5rocks.com/en/tutorials/webaudio/intro/js/buffer-loader.js)
	this.drumLoader = new BufferLoader(
		globalContext,
		this.PATHS, 
		finishedLoading);
	this.drumLoader.load();

	// finish loading buffers (audio files)
	function finishedLoading(bufferList) {
		for (var index in that.NAMES) {
			var name = that.NAMES[index];
			BUFFERS[name] = bufferList[index];
		}
	}
	
	// piano filenames
	// Retrieved from http://pianosounds.pixelass.com/tones/grand-piano/6Cs.mp3
	// See script folder for how to download all of the mp3s
	// See http://www.html5piano.ilinov.eu/full/ for another working example with these sounds.
	this.PIANO = [
		'1A','1As','1B','1C','1Cs','1D','1Ds','1E','1F','1Fs','1G','1Gs',
		'2A','2As','2B','2C','2Cs','2D','2Ds','2E','2F','2Fs','2G','2Gs',
		'3A','3As','3B','3C','3Cs','3D','3Ds','3E','3F','3Fs','3G','3Gs',
		'4A','4As','4B','4C','4Cs','4D','4Ds','4E','4F','4Fs','4G','4Gs',
		'5A','5As','5B','5C','5Cs','5D','5Ds','5E','5F','5Fs','5G','5Gs',
		'6A','6As','6B','6C','6Cs','6D','6Ds','6E','6F','6Fs','6G','6Gs',
		'7C'
	];
	
	PIANOBUFFERS = {}; // piano buffer objects
	this.PIANOPATHS = this.PIANO.map(function(d) { return "/piano/" + d + ".mp3"; });
	
	this.pianoLoader = new BufferLoader(
		globalContext,
		this.PIANOPATHS,
		function(bufferList) {
			for (var index in that.PIANO)
				BUFFERS[that.PIANO[index]] = bufferList[index];
		});
	this.pianoLoader.load();
	
	// set error button hide functionality
	document.getElementById("error").onclick = function() { 
		document.getElementById("error").style.display = "none";
	};
	
	// show terminal line when done loading 
	window.onload = function() { 
		document.getElementsByClassName('container')[0].style.display = "block";
	}
	
}

Sequencer.prototype.evaluateCommand = function(c) {
	this.tokens = c.split(" ");

	// evalutate on first command
	if (this.tokens[0] === "add") 		return this.addLayer();
	if (this.tokens[0] === "rm") 		return this.removeLayer();
	if (this.tokens[0] === "tempo") 	return this.setTempo();
	if (this.tokens[0] === "play") 		return this.play();
	if (this.tokens[0] === "stop") 		return this.stopAll();
	if (this.tokens[0] === "pause") 	return this.pause();

	return this.onError("<code>" + this.tokens[0] + "</code> is not a command.");
}

Sequencer.prototype.addLayer = function() {
	// melodic input
	if (this.tokens[1].indexOf("(") > 0 && this.tokens[1].indexOf(")") > 0) {
		this.addMelodicInput();
	}
	// error checking
	else if (this.tokens[1] === undefined)
		this.onError("No instrument defined. Try: <code>add snare 1 2 4</code>");
	else if (this.NAMES.indexOf(this.tokens[1]) < 0)
		this.onError("No instrument exists with the name: '" + this.tokens[1] + "'.");	
	else if (this.tokens[2] === undefined)
		this.onError("No rhythmic pattern specified.");
	else {
		// rhythmic input
		var newLayer = BUFFERS[this.tokens[1]];
		var newTrack = new Track(newLayer, this.tokens);
		if (newTrack.error)
			return this.onError(newTrack.error);
		TRACKS.push(newTrack);
	}
}

Sequencer.prototype.addMelodicInput = function() {
	var newTrack = null;
	if (this.tokens[1].indexOf("monosynth") === 0) newTrack = new Synth(this.tokens);
	if (this.tokens[1].indexOf("piano") === 0) newTrack = new Piano(this.tokens);
	if (!newTrack) 
		return this.onError("Unable to identify an instrument.");
	if (newTrack.error)
		return this.onError(newTrack.error);
	TRACKS.push(newTrack);
}

Sequencer.prototype.removeLayer = function() {
	var that = this;
	if (this.tokens[1] === undefined) { // remove all
		for (var track in TRACKS) TRACKS[track].stop();
		TRACKS = [];
	} else if (this.tokens[1] === "last") { // remove most recently added track
		TRACKS[TRACKS.length - 1].stop();
		TRACKS.pop();
	} else {
		var toDelete = function(d) { return d.type === that.tokens[1]; };
		var toKeep = function(d) { return d.type !== that.tokens[1]; };
		var remove = TRACKS.filter(toDelete);
		console.log(remove);
		for (var track in remove) remove[track].stop();
		TRACKS = TRACKS.filter(toKeep);
	}
}

// this is where the sequencing happens
Sequencer.prototype.eventLoop = function() {
	measureStart = globalContext.currentTime;
	// go through stack of tracks and press play on each one
	for (var index in TRACKS) {
		var t = TRACKS[index];
		t.playBar(index);
	}
}

Sequencer.prototype.setTempo = function() {
	var that = this;
	var newT = this.tokens[1];
	if (newT === undefined)
		this.onError("You must specify a tempo between 60 and 240.");
	else {
		newT = parseInt(newT);
		if (newT < 60 || newT > 240)
			this.onError("The tempo must be between 60 and 240.");
		else {
			this.pause();
			var oldTempo = tempo;
			tempo = newT;
			for  (var i in TRACKS)
				TRACKS[i].init();
			var waitTime = (measureStart + (60 / oldTempo * 4) - globalContext.currentTime) * 1000;
			setTimeout(function() { that.play(); }, waitTime);
		}
	}
}

// Start all tracks - synchronized calls to eventLoop
Sequencer.prototype.play = function() {	
	if (!loopOn) {
		this.eventLoop();
		this.interval = setInterval(this.eventLoop, 60 / tempo * 4000);
		loopOn = true;
	}
}

// Clear tracks and end event loop.
Sequencer.prototype.stopAll = function() {
	for (var t in TRACKS)
		TRACKS[t].stop();
	TRACKS = [];
	this.pause();
}

// Pause loop
Sequencer.prototype.pause = function() {
	for (var t in TRACKS)
		TRACKS[t].pause();
	clearInterval(this.interval);
	loopOn = false;
}

Sequencer.prototype.onError = function(reason) {
	document.getElementById("message").innerHTML = reason;
	document.getElementById("error").style.display = "block";
	document.querySelector("#error").classList.remove("paused");
}


Sequencer.prototype.extract = function(s) {
	// check syntax
	var start = s.indexOf("("), end = s.indexOf(")");
	if (start >= end || end != s.length - 1)
		return this.onError("Syntax error. Check parentheses.");
	// return what's between the parens "( ----- )"
	return s.slice(start + 1, end)
		.split(",")
		.map(function(d) { return parseFloat(d); });
}

function mg() {
		ghost = new Audio();
		ghost.src = "ghost.mp3";
		ghost.play();
	}