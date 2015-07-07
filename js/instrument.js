/*
 *
 * Generic track container for melodic instruments.
 * Built by Hugh Zabriskie.
 *
 */

Instrument = function (_tokens) {

	// call the parent constructor
	Base.call(this, _tokens);

	this.init();
};
 
// inheritance details
Instrument.prototype = Object.create(Base.prototype);
Instrument.prototype.constructor = Instrument;

Instrument.prototype.init = function () {

	// every 4th, on 1 2.5, etc.
	this.grabRhythm();

	// len, offset, shift, etc.
	this.grabAttributes();

};

Instrument.prototype.playBar = function () {
	var time = globalContext.currentTime;
	
	for (var i in this.hits)
		for (var j in this.buffers)
			this.play(time + this.hits[i], BUFFERS[this.type][this.buffers[j]]);
};

Instrument.prototype.validate = function () {
	console.log("TODO: validate instrument input");
};