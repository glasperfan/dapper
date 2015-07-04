/*
 *
 * Generate a random track, lazily evaluated each bar.
 * Built by Hugh Zabriskie.
 *
 */
 
Generator = function (_tokens) {
	this.type = null;
	this.instrument = null;
	this.buffers = null;
	this.scale = null;
	this.range = null;
	this.noteLength = null;
	this.occurrencePr = null;
	 
	// call the parent constructor
	Base.call(this, _tokens);

	this.init();
};
 
// inheritance details
Generator.prototype = Object.create(Base.prototype);
Generator.prototype.constructor = Generator;

Generator.prototype.init = function () {
	 
	// command: add generator(piano,Amaj,5+6,0.5,0.6)
	
	// either 3 or 5 parameters
	this.params = extract(this.tokens[1], "string").split(",");
	if (this.params.length === 3)
		this.params.splice(1, 0, null, null);
	
	// type
	this.type = this.params[0];

	// instrument and buffers
	if (_.contains(sequencer.DRUMS, this.type))
		this.instrument = "drums";
	else
		this.instrument = this.type;
	this.buffers = BUFFERS[this.instrument];

	// scales and ranges
	if (this.instrument !== "drums") {
		this.scale = SCALES[this.params[1]];
		this.range = this.params[2].split("+").map(function (d) { return parseInt(d, 10); });
	}
	
	// note length
	this.noteLength = parseFloat(this.params[3]);
	
	// occurrence probability
	this.occurrencePr = parseFloat(this.params[4]);
	 
	// validate
	if (!this.errorChecking())
		return;

	this.grabAttributes();

	// eagerly evaluate the first measure
	this.evaluate();
};

Generator.prototype.evaluate = function () { 
	
	// reset
	this.pitches = [];
	this.hits = [];
	this.beats = [];

	var beatDuration = 60 / tempo;
	var noteDuration = beatDuration * this.noteLength;
	var numIntervals = BEATS_PER_MEASURE / this.noteLength;
	for (var i = 0; i < numIntervals; i++) {
		var randPr = this.getRandom();
		if (this.occurrencePr >= randPr) { // 1.0 should always pass
			
			// determine the sound
			var sound = this.type;
			if (this.instrument !== "drums") {
				var randPitch = this.scale[this.getRandomInt(0, this.scale.length)];
				var randOctave = this.range[this.getRandomInt(0, this.range.length)];
				sound = reverseNote(randPitch + randOctave);
			}
			this.pitches.push(sound);
			this.beats.push(i * this.noteLength);
			
			// and the rhythm
			this.hits.push(i * noteDuration);
		}
	}
};

Generator.prototype.playBar = function () {
	var time = globalContext.currentTime;
	for (var i in this.pitches)
		this.play(time + this.hits[i], this.buffers[this.pitches[i]]);
	
	// update the display with the current content
	updateDisplay();
	
	// then re-evaluate
	this.evaluate();
};



Generator.prototype.errorChecking = function () {

	try {
		if (this.params.length !== 5)
			throw "Invalid generator syntax."

		if (!_.contains(TYPES, this.type))
			throw "Invalid track type."

		if (this.scale === undefined && this.type === "piano")
			throw "Invalid scale. Try 'Amaj' or 'Bbmaj'."

		if (_.some(this.range, function (d) { return d < 0 || d > 6; }))
			throw "Invalid range. Specify like this: '3+5'.";

		if (this.occurrencePr > 1.0 || this.occurrencePr < 0.0)
			throw "Invalid probability. Must be between 0 and 1, inclusive."

		return true;
	}

	catch (error) {
		this.onError(error);
		return false;
	};
};



Generator.prototype.getRandom = function () {
	return Math.random();
};

Generator.prototype.getRandomInt = function (min, max) {
	return Math.floor(Math.random() * (max - min)) + min;
};
