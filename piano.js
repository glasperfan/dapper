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
	
	// gather pitches (i.e. "6G", "5A")
	this.pitches = extract(this.tokens[1], "array").map(reverseNote);
	
	this.grabRhythm();
	
	this.grabAttributes();
	
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