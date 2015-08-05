/*
 *
 * Generic track container for melodic instruments.
 * Built by Hugh Zabriskie.
 *
 */

Instrument = function (_tokens) {
	this.type = "instrument";
	
	// call the parent constructor
	Base.call(this, _tokens);
	
	// instrument alias
	this.alias = extractNamespace(this.tokens[1]);

	// settings metadata
	this.metadata = settings.instruments[this.alias];

	// melodic content
	this.buffers = extract(this.tokens[1]).split(",");

	// melodic and rhythmic features
	this.init();
};
 
// inheritance details
Instrument.prototype = Object.create(Base.prototype);
Instrument.prototype.constructor = Instrument;

Instrument.prototype.init = function () {

	// every 4th, on 1 2.5, etc.
	this.grabRhythm();

	// len, offset, shift, sections, etc.
	this.grabAttributes(this.tokens.join(" "));
	
	// track table information
	this.setDisplayInfo();
};

Instrument.prototype.playBar = function () {
	var time = globalContext.currentTime;

	for (var i in this.hits)
		for (var j in this.buffers)
			this.play(time + this.hits[i], BUFFERS[this.alias][this.buffers[j]]);
};