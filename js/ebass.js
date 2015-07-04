/*
 *
 * Electric bass tracks.
 * Built by Hugh Zabriskie.
 *
 */


Ebass = function (_tokens) {
	this.type = "ebass";

	// call the parent constructor
	Base.call(this, _tokens);

	this.init();
};
 
// inheritance details
Ebass.prototype = Object.create(Base.prototype);
Ebass.prototype.constructor = Ebass;

Ebass.prototype.init = function () {
	
	this.pitches = extract(this.tokens[1], "array").map(reverseNote);

	this.grabRhythm();
	
	this.grabAttributes();

};

Ebass.prototype.playBar = function () {
	var measureStartTime = globalContext.currentTime;

	for (var i in this.hits)
		for (var j in this.pitches)
			this.play(measureStartTime + this.hits[i], BUFFERS.ebass[this.pitches[j]]);
};