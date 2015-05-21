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
		'ohihat-3',
		'cross',
		'snare',
		'snare-2'
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
	
	// set error button hide functionality
	document.getElementById("error").onclick = function() { 
		document.getElementById("error").style.display = "none";
	};
	
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
	// error checking
	if (this.tokens[1] === undefined)
		this.onError("No instrument defined. Try: <code>add snare 1 2 4</code>");
	else if (this.NAMES.indexOf(this.tokens[1]) < 0)
		this.onError("No instrument exists with the name: '" + this.tokens[1] + "'.");	
	else if (this.tokens[2] === undefined)
		this.onError("No rhythmic pattern specified.");
	else {
		var newLayer = this.BUFFERS[this.tokens[1]];
		var newTrack = new Track(newLayer, this.tokens);
		if (newTrack.error)
			this.onError(newTrack.error);
		else
			TRACKS.push(newTrack);
	}
}

Sequencer.prototype.removeLayer = function() {
	var that = this;
	if (this.tokens[1] === undefined) // remove all
		TRACKS = [];
	else if (this.tokens[1] === "last") // remove most recently added track
		TRACKS.pop();
	else if (this.NAMES.indexOf(this.tokens[1]) > -1) {
		var f = function(d) { return d.type !== that.tokens[1]; };
		TRACKS = TRACKS.filter(f);
	}
}

// this is where the sequencing happens
Sequencer.prototype.eventLoop = function() {
	measureStart = globalContext.currentTime;
	// go through stack of tracks and press play on each one
	for (var index in TRACKS) {
		var t = TRACKS[index];
		t.playBar();
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
	TRACKS = [];
	this.pause();
}

// Pause loop
Sequencer.prototype.pause = function() {
	clearInterval(this.interval);
	loopOn = false;
}

Sequencer.prototype.onError = function(reason) {
	document.getElementById("message").innerHTML = reason;
	document.getElementById("error").style.display = "block";
	document.querySelector("#error").classList.remove("paused");
}
