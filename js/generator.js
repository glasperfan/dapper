/*
 *
 * Generate a random track, lazily evaluated each bar.
 * Built by Hugh Zabriskie.
 *
 */
 
Generator = function (_tokens) {
	this.type = "generator";
	this.buffers = [];
	this.scale = null;
	this.range = null;
	this.noteLength = null;
	this.occurrencePr = null;
	 
	// call the parent constructor
	Base.call(this, _tokens);

	this.init();
	
	// then update the display information
	this.setDisplayInfo();
};
 
// inheritance details
Generator.prototype = Object.create(Base.prototype);
Generator.prototype.constructor = Generator;

Generator.prototype.init = function () {
	var that = this;
	 
	// command: add generator(piano,Amaj,5+6,0.5,0.6)
	this.buffers = [];
	
	// either 3 or 5 parameters
	this.params = extract(this.tokens[1], "string").split(",");
	if (this.params.length === 3)
		this.params.splice(1, 0, null, null);
	
	// instrument alias
	this.alias = this.params[0];
	this.metadata = settings.instruments[this.alias];

	// instrument and buffers
	this.settings = settings.instruments[this.alias];
	if (this.settings.melodic) {
		this.scale = SCALES[this.params[1]]; // ["a", "b", "c"]
		this.range = this.params[2].split("+").map(function (d) { return parseInt(d, 10); });
		this.scale.forEach(function (d) {
			for (var rangeIndex in that.range) {
				var note = d + that.range[rangeIndex]; // "a4"
				if (_.contains(settings.MIDInotes, note))
					that.buffers.push(note);
			}
		});
	}
	else
		this.buffers = this.settings.buffers;
	
	// note length
	this.noteLength = parseFloat(this.params[3]);
	
	// occurrence probability
	this.occurrencePr = parseFloat(this.params[4]);

	// offset, gain, etc.
	this.grabAttributes(this.tokens.join(" "));

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
		if (this.occurrencePr >= getRandom()) { // 1.0 should always pass
			
			// choose a random note/sound
			var sound = this.buffers[getRandomInt(0, this.buffers.length)];
			
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
		this.play(time + this.hits[i], BUFFERS[this.alias][this.pitches[i]]);
	
	// update the display with the current content
	this.setDisplayInfo();
	updateDisplay();
	
	// then re-evaluate
	this.evaluate();
};

Generator.prototype.setDisplayInfo = function () {
	this.rhythmTokens = this.beats;
	Base.prototype.setDisplayInfo.call(this);
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



function getRandom() {
	return Math.random();
};

function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min)) + min;
};
