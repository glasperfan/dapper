/*
 *
 * Collection object for more efficient note input.
 * Built by Hugh Zabriskie.
 *
 */
 
Collection = function (_tokens) {
	this.type = "collection";
	this.alias = null; // drums or piano
	this.sound = null; // for non-melodic instruments, the requested sound
	this.buffers = []; // for melodic instruments, the midi notes
	this.beats = []; // this.hits stores the actual values in seconds, this.beats stores the text representations
	this.metadata = null;
	
	// call the parent constructor
	Base.call(this, _tokens);
	
	this.init();
	
	// then update the display information
	this.setDisplayInfo();
};
 
// inheritance details
Collection.prototype = Object.create(Base.prototype);
Collection.prototype.constructor = Collection;

Collection.prototype.init = function () {
	// command: add collection(piano,a5-1,b5-2.5,c3-3,d5-1,...)
	// command: add collection(drums(hihat),a5-1,b5-2,c3-3,d5-1,...)
	var params = extract(this.tokens[1]).split(",");
	this.alias = extractNamespace(params[0]);
	this.metadata = settings.instruments[this.alias];
	this.sound = this.metadata.melodic ? null : extract(params[0]);
	
	// Melodic information
	this.buffers = [];
	this.hits = [];
	var beatDuration = (60 / tempo);
	for (var i = 1; i < params.length; i++) {
		var param = params[i];
		var note = this.metadata.melodic ? param.split("-")[0] : this.sound;
		var beat = this.metadata.melodic ? param.split("-")[1] : param; // beats are 1-indexed
		this.buffers.push(note);
		this.beats.push(parseFloat(beat));
		this.hits.push((beat - 1) * beatDuration);
	}

	// Offset, gain, sections, etc.
	this.grabAttributes(this.tokens.join(" "));
};

Collection.prototype.playBar = function () {
	var time = globalContext.currentTime;
	for (var i in this.hits)
		this.play(time + this.hits[i], BUFFERS[this.alias][this.buffers[i]]);
};

Collection.prototype.setDisplayInfo = function () {
	this.rhythmTokens = this.beats;
	Base.prototype.setDisplayInfo.call(this);
	if (!this.metadata.melodic)
		this.displayInfo.melody = this.sound;
};