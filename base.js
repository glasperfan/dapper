/*
 *
 * Base object for Sequencer. 
 * Applies to piano, synth, and track objects.
 * Built by Hugh Zabriskie.
 *
 */
 
 Base = function(_tokens) {
	this.tokens = _tokens;  // i.e ['add', 'snare', 'on', '1', '2', '4']
	this.hits = []; 		// timing (in seconds) of sound occurrences
	this.offset = 0; 		// default beat offset (measured in fractions of a beat)
	this.sections = []; 		// if the tracks belongs to a section
	this.error = null;		// errors
 }

Base.prototype.grabRhythm = function() {
	var that = this;
	var beatDuration = (60 / tempo);
	
	this.hits = [];
	
	// "on 1 2 4"
	if (this.tokens[2] === "on") {
		var beats = this.tokens.slice(3);
		// remove sect() and offset(), etc.
		beats = beats.map(parseFloat).filter(function(d) { return d === d; });
		if (beats.length === 0)
			return this.onError("You forgot to specify beats. i.e. '1 2 4'");
		for (var i = 0; i < beats.length; i++) {
			var beat = beats[i] - 1;
			if (beat < 0 || beat >= 4)
				this.onError("Beats must be between 1 and 5. 1, as in \"beat 1\", represents the downbeat.");
			this.hits.push(beat * beatDuration);
		}
	}
	
	// "every 8th"
	if (this.tokens[2] === "every") {
		var denom = this.tokens[3];
		denom = parseInt(denom.substr(0, denom.length - 2));
		if (denom & (denom - 1) !== 0 || denom > 32)
			this.onError("The beat divisor must be a power of two no greater than 32.");
		var denomDuration = (60 / tempo) / (denom / 4);
		var pause = 0;
		for (var i = 0; i < denom; i++) {
			this.hits.push(pause); // in seconds
			pause += denomDuration;
		}
	}
}
 
Base.prototype.grabAttributes = function() {
	var that = this;
	var beatDuration = 60 / tempo;
	
	for (var i = 4; i < this.tokens.length; i++) {
		// set any offset
		if (this.tokens[i].indexOf("offset") > -1) {
			this.offset = extract(this.tokens[i], "value");
			if (this.offset < 0)
				return this.onError("Invalid offset - must be postive value representing the length of the beat offset.");
			this.offset *= beatDuration;
		}
		
		// add offset
		this.hits = this.hits.map(function(d) { return d + that.offset; });
		
		// set any section
		if (this.tokens[i].indexOf("sect") > -1) {
			this.sections = [extract(this.tokens[i], "string").toUpperCase()];
		}
	}
	
	// if no explicit section, check for a defining section
	if (buildingSection && this.sections.length === 0)
		this.sections = [buildingSection];
 }

 
// Create a buffer source for each sound occurrence
Base.prototype.play = function(time, buffer) {
	var source = globalContext.createBufferSource();
	source.buffer = (buffer !== undefined) ? buffer : this.buffer;
  	source.connect(globalContext.destination);
  	source.start(time);
}


Base.prototype.stop = function() {}
Base.prototype.pause = function() {}
 
// default error logging method
Base.prototype.onError = function(reason) {
	this.error = reason;
}




/*
 *
 * HELPER FUNCTIONS 
 *
 */
 
// Get the time until the end of the measure.
// Used for coordinating loops.
function timeUntilMeasureEnd() {
	return (measureStart + (60 / tempo * 4) - globalContext.currentTime) * 1000;
}
 
// convert 'g6' or '6G', or 'fs6' to '6Fs'
function reverseNote(note) {
	var rev = note[note.length -1] + note[0].toUpperCase();
	return (note.length === 3) ? rev + "s" : rev;
}

// extract what's inside the parentheses
function extract(s, format) {
	// check syntax
	var start = s.indexOf("("), end = s.indexOf(")");
	if (start >= end || end != s.length - 1)
		return this.onError("Syntax error. Check parentheses.");
	// return what's between the parens "( ----- )"
	s = s.slice(start + 1, end);
	if (format === "string") return s;
	if (format === "value") return parseFloat(s);
	if (format === "array") return s.split(",");
	if (format === "numArray") return s.split(",").map(parseFloat);
}

// converts note names to frequencies
function noteToFrequency(note) {
	var noteName = note.slice(0, note.length - 1);		// cs1 --> cs
	var noteOctave = parseInt(note[note.length -1]);	// cs1 --> 1
	var baseFreq = BASE_PITCHES[noteName + "1"];
	var octaveDiff = noteOctave - 1;
	return baseFreq * Math.pow(2, octaveDiff);
}

// hide an HTML element
function hide(el) { el.style.display = "none"; }
function show(el, val) { el.style.display = (val === undefined) ? "block" : val; }


// update track table display (based on DISPLAYTRACKS)
function updateDisplay() {
	var table = document.getElementById("tracks-table");
	
	// filter tracks to be shown
	if (showSection)
		DISPLAYTRACKS = TRACKS.filter(function(d) { return _.contains(d.sections, showSection); });
	else
		DISPLAYTRACKS = TRACKS;
	
	// delete rows and refresh the table
	while(table.rows.length > 1) {
  		table.deleteRow(1); // delete second row, avoid header
	}
	for (var i = 0; i < DISPLAYTRACKS.length; i++) {
		var track = DISPLAYTRACKS[i];
		var row = table.insertRow(i + 1);

		var ind_cell = row.insertCell(0);
		var inst_cell = row.insertCell(1);
		var sect_cell = row.insertCell(2);
		var mel_cell = row.insertCell(3);
		var rhm_cell = row.insertCell(4);

		ind_cell.innerHTML = i;
		inst_cell.innerHTML = track.type;
		sect_cell.innerHTML = track.sections.join(", ");
		mel_cell.innerHTML = (track.pitches === undefined) ? '' : TRACKS[i].pitches;
		rhm_cell.innerHTML = track.tokens.slice(2).join(' ');
	}
}


// TODO: make a better implementation of this
// A section "exists" if a tracks exists in that section.
// In other words, an empty section doesn't exist.
function sectionExists(section) {
	section = section.toUpperCase();
	
	if (section === "ALL") // a reserved keyword for all tracks
		return true;
	
	var containsThisSection = false;
	section = section.toUpperCase();
	TRACKS.forEach(function(d) {
		if (_.contains(d.sections, section))
			containsThisSection = true;
	});
	
	return containsThisSection;
}

// Takes a statement like "a+b-c" 
// Uses underscore.js to simplify things.
function evaluateSectionEquation(equation) {
	var sections = equation.toUpperCase().split(/[+/-]/);
	
	// check for valid sections
	if (!_.every(sections, function(d) { return sectionExists(d); }))	
		return null;
	
	// process equation
	equation = "+" + equation.toUpperCase();
	var components = []; // ["+a", "-b", "+c"]
	var piece = null;
	for (var i = 0; i < equation.length; i++) {
		if (equation[i] === '+' || equation[i] === '-') {
			if (piece)
				components.push(piece);
			piece = equation[i];
		}
		else
			piece += equation[i];
		if (i === equation.length - 1)
			components.push(piece);
	}
	
	var result = [];
	for (var j in components) {
		var component = components[j];
		
		var section = component.substring(1);
		var relatedTracks = TRACKS;
		if (section !== "ALL")
			relatedTracks = TRACKS.filter(function(d) { return _.contains(d.sections, section); });
		
		var mode = component[0];
		if (mode === '+')
			result = _.union(result, relatedTracks);
		if (mode === "-")
			result = _.difference(result, relatedTracks);
	}
	
	return result;
	
}



/*
 *
 * CONSTANTS
 *
 */
 
 // used for calculating frequencies
 BASE_PITCHES = {"c1" : 32.7032,
				"cs1" : 34.6478, 
				"d1" : 36.7081,
				"ds1" : 38.8909,
				"e1" : 41.2034,
				"f1" : 43.6535,
				"fs1" : 46.2493,
				"g1" : 48.9994,
				"gs1" : 51.9131,
				"a1" : 55.0000,
				"as1" : 58.2705,
				"b1" : 61.7354
				}