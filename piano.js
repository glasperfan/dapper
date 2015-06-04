/*
 *
 * Piano objects for Sequencer.
 * Built by Hugh Zabriskie.
 *
 */
 
 Piano = function(_tokens) {
	 this.type = "piano";
	 this.pitches = null;
	 
	 // call the parent constructor
	 Base.call(this, _tokens);
	 
	 this.init();
 }
 
 // inheritance details
 Piano.prototype = Object.create(Base.prototype);
 Piano.prototype.constructor = Piano;
 
 Piano.prototype.init = function() {
	
	var that = this;
	
	// gather pitches (i.e. "6G", "5A")
	this.pitches = extract(this.tokens[1], "array").map(reverseNote);
	
	// gather rhythms
	this.hits = [];
	
	var beatDuration = (60 / tempo);
	
	if (this.tokens[2] === "on") {
		var beats = this.tokens.slice(3);
		if (beats.length === 0)
			return this.onError("You forgot to specify beats. i.e. '1 2 4'");
		for (var i = 0; i < beats.length; i++) {
			var beat = parseFloat(beats[i]) - 1;
			if (beat < 0 || beat >= 4)
				this.onError("Beats must be between 1 and 5. 1, as in \"beat 1\", represents the downbeat.");
			this.hits.push(beat * beatDuration);
		}
	}
	
	if (this.tokens[2] === "every") {
		var denom = this.tokens[3];
		denom = parseInt(denom.substr(0, denom.length - 2));
		if (denom & (denom - 1) !== 0 || denom > 32)
			this.onError("The beat divisor must be a power of two no greater than 32.");
		var denomDuration = (60 / tempo) / (denom / 4);
		var pause = 0;
		for (var i = 0; i < denom; i++) {
			this.hits.push(pause); // in seconds
			pause += denomDuration;
		}
	}
	
	// set any offset
	for (var i = 4; i < this.tokens.length; i++) {
		if (this.tokens[i].indexOf("offset") > -1) {
			this.offset = extract(this.tokens[i], "value");
			if (this.offset < 0)
				return this.onError("Invalid offset - must be postive value representing the length of the beat offset.");
			this.offset *= beatDuration;
		}
	}
	this.hits = this.hits.map(function(d) { return d + that.offset; });
	
 }

Piano.prototype.playBar = function() {
	var measureStartTime = globalContext.currentTime;
	for (var i in this.hits) {
		for (var j in this.pitches) {
			var time = measureStartTime + this.hits[i];
			var buffer = BUFFERS[this.pitches[j]];
			this.play(time, buffer);
		}
	}
}