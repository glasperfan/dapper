/*
 *
 * Synthesizer (melodic) objects for Sequencer.
 * Built by Hugh Zabriskie.
 *
 */
 
 Synth = function(_tokens) {
	 this.tokens = _tokens; // i.e ['add', 'snare', 'on', '1', '2', '4']
	 this.type = "monosynth";
	 this.pitches = null;
	 this.hits = null;
	 this.beatsPerNote = 1; // default is 1 beat / note (quarter notes)
	 this.noteDuration = null; // duration per note
	 this.interval = null;
	 this.loopOn = false;
	 
	 // additional properties
	 this.waveType = "sine"; // default
	 this.waveOptions = ["sine", "square", "saw", "triangle"]; //
	 this.gain = 0.5; // default (0.0 - 1.0)
	 this.gainNode = null;
	 this.oscillator = null;
	 
	 this.error = null;
	 
	 this.init();
 }
 
 Synth.prototype.init = function() {
	
	this.pitches = extract(this.tokens[1], "array")
					.map(noteToFrequency);
	
	this.hits = null;
	
	// evaluate other tokens
	// TODO: error checking
	for (var i = 2; i < this.tokens.length; i++) {
		var token = this.tokens[i];
		if (token.indexOf("len") === 0)
			this.beatsPerNote = extract(token, "value");
		else if (token.indexOf("type") === 0)
			this.waveType = extract(token, "string");
		else if (token.indexOf("gain") === 0)
			this.gain = extract(token, "value");
	}

	// determine length of each note (in ms)
	var bps = tempo / 60; // beats per second
	this.noteDuration = this.beatsPerNote / bps * 1000;
	
	// build oscillator and gain node
	this.oscillator = globalContext.createOscillator();
	this.gainNode = globalContext.createGain();
	this.oscillator.type = this.waveType;
	this.oscillator.frequency.value = 0;
	this.oscillator.connect(this.gainNode);
	this.gainNode.gain.value = this.gain;
	this.gainNode.connect(globalContext.destination);
	
	// start oscillator
	this.oscillator.start();
	
 }

Synth.prototype.playBar = function() {
	// if the synth loop isn't already running, start it
	if (!this.loopOn) {
		var that = this;
		var counter = 0;
		var num_pitches = this.pitches.length;
		this.loopOn = true;
		this.interval = setInterval(function() {
			that.oscillator.frequency.value = that.pitches[counter];
			counter = (counter + 1) % num_pitches;
		}, this.noteDuration);
	}
}
 
Synth.prototype.stop = function() {
	var that = this;
	setTimeout(function() { 
		clearInterval(that.interval);
		that.loopOn = false;
		that.oscillator.stop();
	}, timeUntilMeasureEnd());
}

Synth.prototype.pause = function() {
	var that = this;
	setTimeout(function() { 
		that.gainNode.gain.value = 0;
	}, timeUntilMeasureEnd());
}

Synth.prototype.onError = function(reason) {
	this.error = reason;
}



// HELPER FUNCTION: extract what's inside the parentheses
function extract(s, format) {
	// check syntax
	var start = s.indexOf("("), end = s.indexOf(")");
	if (start >= end || end != s.length - 1)
		return this.onError("Syntax error. Check parentheses.");
	// return what's between the parens "( ----- )"
	s = s.slice(start + 1, end);
	if (format === "string") return s;
	if (format === "value") return parseFloat(s);
	if (format === "array") return s.split(",");
	if (format === "numArray") return s.split(",").map(parseFloat);
}

// Constants
BASE_PITCHES = {"c1" : 32.7032,
				"cs1" : 34.6478, 
				"d1" : 36.7081,
				"ds1" : 38.8909,
				"e1" : 41.2034,
				"f1" : 43.6535,
				"fs1" : 46.2493,
				"g1" : 48.9994,
				"gs1" : 51.9131,
				"a1" : 55.0000,
				"as1" : 58.2705,
				"b1" : 61.7354
				}

// HELPER FUNCTION: converts note names to frequencies
function noteToFrequency(note) {
	var noteName = note.slice(0, note.length - 1);		// cs1 --> cs
	var noteOctave = parseInt(note[note.length -1]);	// cs1 --> 1
	var baseFreq = BASE_PITCHES[noteName + "1"];
	var octaveDiff = noteOctave - 1;
	return baseFreq * Math.pow(2, octaveDiff);
}

// TODO: helper function to validate notes
// function validateNotes(note) {}

// HELPER FUNCTION: get the time until the end of the measure
// Used for coordinating loops.
function timeUntilMeasureEnd() {
	return (measureStart + (60 / tempo * 4) - globalContext.currentTime) * 1000;
}