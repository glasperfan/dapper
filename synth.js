/*
 *
 * Synthesizer (melodic) objects for Sequencer.
 * Built by Hugh Zabriskie.
 *
 */
 
 Synth = function(_tokens) {
	 this.type = "monosynth";
	 this.pitches = null;
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
	 
	 // call parent constructor
	 Base.call(this, _tokens);
	 
	 this.init();
 }
 
 // inheritance details
 Synth.prototype = Object.create(Base.prototype);
 Synth.prototype.constructor = Synth;
 
 Synth.prototype.init = function() {
	
	this.pitches = extract(this.tokens[1], "array")
					.map(noteToFrequency);
	
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
		this.gainNode.gain.value = this.gain;
		this.interval = setInterval(function() {
			that.oscillator.frequency.value = that.pitches[counter];
			counter = (counter + 1) % num_pitches;
		}, this.noteDuration);
	}
}
 
Synth.prototype.stop = function() {
	Base.prototype.stop.call(this);
	var that = this;
	setTimeout(function() { 
		clearInterval(that.interval);
		that.loopOn = false;
		that.oscillator.stop();
	}, timeUntilMeasureEnd());
}

Synth.prototype.pause = function() {
	Base.prototype.pause.call(this);
	var that = this;
	setTimeout(function() {
		that.gainNode.gain.value = 0;
		clearInterval(that.interval);
	}, timeUntilMeasureEnd());
	this.loopOn = false;
}

// TODO: helper function to validate notes
// function validateNotes(note) {}