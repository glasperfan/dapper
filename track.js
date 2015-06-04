/*
 *
 * Track objects for Sequencer.
 * Built by Hugh Zabriskie.
 *
 */
 
 Track = function(_buffer, _tokens) {
	 this.buffer = _buffer; // audioBuffer object
	 this.type = _tokens[1];
	 this.hits = [];
	 this.error = null;
	 this.offset = 0;
	 this.once = false;
	 
	 // call the parent constructor
	 Base.call(this, _tokens);
	 
	 this.init();
 }
 
 // inheritance details
 Track.prototype = Object.create(Base.prototype);
 Track.prototype.constructor = Track;
 
 Track.prototype.init = function() {
	
	var that = this;
	
	this.hits = [];
	
	var beatDuration = (60 / tempo); // length of one beat
	
	// "on" or "every"?
	if (this.tokens.indexOf("every") === 2) {
		var denominator = parseInt(this.tokens[3].substr(0, this.tokens[3].length - 2));
		if (denominator & (denominator - 1) !== 0 || denominator > 32)
			this.onError("The beat divisor must be a power of two no greater than 32.");
		var denomDuration = (60 / tempo) / (denominator / 4);
		var pause = 0;
		for (var i = 0; i < denominator; i++) {
			this.hits.push(pause);
			pause += denomDuration;
		}
	}
	
	if (this.tokens.indexOf("on") === 2) {
		var beats = this.tokens.slice(3);
		if (beats.length === 0)
			this.onError("You forgot to specify beats. i.e. '1 2 4'.");
		for (var i = 0; i < beats.length; i++) {
			var beat = parseFloat(beats[i]) - 1;
			if (beat < 0 || beat >= 4)
				this.onError("Beats must be between 1 and 5. 1, as in \"beat 1\", represents the downbeat.");
			this.hits.push(beat * beatDuration);
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

Track.prototype.playBar = function(index) {
	var time = globalContext.currentTime;
	for (var i in this.hits)
		this.play(time + this.hits[i]);
}