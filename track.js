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
	
	this.grabRhythm();
	
	this.grabAttributes();
	
 }

Track.prototype.playBar = function() {
	var time = globalContext.currentTime;
	for (var i in this.hits)
		this.play(time + this.hits[i]);
}