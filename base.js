/*
 *
 * Base object for Sequencer. 
 * Applies to piano, synth, and track objects.
 * Built by Hugh Zabriskie.
 *
 */
 
 Base = function(_tokens) {
	this.tokens = _tokens;  // i.e ['add', 'snare', 'on', '1', '2', '4']
	this.hits = null; // timing (in seconds) of sound occurrences
	this.offset = 0; // default beat offset (measured in fractions of a beat)
	this.error = null;
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
function show(el) { el.style.display = "block"; }


// update track table display
function updateDisplay() {
	var table = document.getElementById("tracks-table");
	
	// delete the rows
	while(table.rows.length > 1) {
  		table.deleteRow(1); // delete second row, avoid header
	}
	for (var i = 0; i < TRACKS.length; i++) {
		var track = TRACKS[i];
		var row = table.insertRow(i + 1);

		var inst_cell = row.insertCell(0);
		var mel_cell = row.insertCell(1);
		var rhm_cell = row.insertCell(2);

		inst_cell.innerHTML = TRACKS[i].type;
		mel_cell.innerHTML = (TRACKS[i].pitches === undefined) ? '' : TRACKS[i].pitches;
		rhm_cell.innerHTML = TRACKS[i].tokens.slice(2).join(' ');
	}
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