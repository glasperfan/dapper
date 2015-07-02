/*
 *
 * Track objects for Sequencer.
 * Built by Hugh Zabriskie.
 *
 */
 
Drum = function (_tokens) {
	this.type = _tokens[1];
	this.buffer = BUFFERS.drums[this.type];
	this.hits = [];
	this.error = null;
	this.offset = 0;
	this.once = false;
	 
	// call the parent constructor
	Base.call(this, _tokens);

	this.init();
};
 
 // inheritance details
 Drum.prototype = Object.create(Base.prototype);
 Drum.prototype.constructor = Drum;
 
 Drum.prototype.init = function () {

	 this.grabRhythm();

	 this.grabAttributes();

 };

Drum.prototype.playBar = function () {
	var time = globalContext.currentTime;
	for (var i in this.hits)
		this.play(time + this.hits[i], this.buffer);
};