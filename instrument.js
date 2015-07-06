/*
 *
 * Generic track container for melodic instruments.
 * Built by Hugh Zabriskie.
 *
 */
 
Instrument = function (_tokens, _specification) {
	this.specification = _specification;
	this.tokens = _tokens;
};
 
 Piano = function (_tokens) {
	this.type = "piano";
	this.pitches = null;
	 
	// call the parent constructor
	Base.call(this, _tokens);

	this.init();
};
 
 // inheritance details
 Piano.prototype = Object.create(Base.prototype);
 Piano.prototype.constructor = Piano;
 
 Piano.prototype.init = function () {
	
	 // piano collection, sets this.pitches and this.hits
	 if (this.tokens[1].indexOf("pianocol") === 0)
		 this.evaluateCollection();
	 else {
		 // gather pitches (i.e. "6G", "5A")
		 this.pitches = extract(this.tokens[1], "array").map(reverseNote);

		 this.grabRhythm();
	 }
	
	 // gain, offset, etc.
	 this.grabAttributes();

 };

Piano.prototype.playBar = function () {
	var measureStartTime = globalContext.currentTime;

	for (var i in this.hits) {
		var time = measureStartTime + this.hits[i];
		if (this.isCollection)
			this.play(time, BUFFERS.piano[this.pitches[i]]);
		else {
			for (var j in this.pitches)
				this.play(time, BUFFERS.piano[this.pitches[j]]);
		}
	}
};