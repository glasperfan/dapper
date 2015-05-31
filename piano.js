/*
 *
 * Piano objects for Sequencer.
 * Built by Hugh Zabriskie.
 *
 */
 
 Piano = function(_tokens) {
	 this.tokens = _tokens; // i.e ['add', 'snare', 'on', '1', '2', '4']
	 this.type = "piano";
	 this.pitches = null;
	 this.hits = null;
	 this.error = null;
	 
	 this.init();
 }
 
 Piano.prototype.init = function() {
	
	// gather pitches (i.e. "6G", "5A")
	this.pitches = extract(this.tokens[1], "array").map(reverseNote);
	
	// gather rhythms
	this.hits = [];
	
	if (this.tokens[2] === "on") {
		var beatDuration = (60 / tempo);
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
	
	else if (this.tokens[2] === "every") {
		var denom = this.tokens[3];
		denom = parseInt(denom.substr(0, denom.length - 2));
		if (denom & (denom - 1) !== 0 || denom > 32)
			this.onError("The beat divisor must be a power of two no greater than 32.");
		var denomDuration = (60 / tempo) / (denom / 4);
		var pause = 0;
		for (var i = 0; i < denom; i++) {
			this.hits.push(pause * 1000); // in ms
			pause += denomDuration;
		}
	}
 }

Piano.prototype.playBar = function() {
	for (var i in this.hits) {
		for (var j in this.pitches) {
			var h = this.hits[i];
			var p = this.pitches[j];
			var f = function() {
				PIANOBUFFERS[p].play(); 
			};
			setTimeout(f, h);
		}
	}
}
 
Piano.prototype.stop = function() {}

Piano.prototype.pause = function() {}

Piano.prototype.onError = function(reason) {
	this.error = reason;
}

function reverseNote(note) {
	return (note[note.length - 1] + note.slice(0, note.length - 1)).toUpperCase();
}