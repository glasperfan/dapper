/*
 *
 * Base object for Sequencer. 
 * Applies to piano, synth, and track objects.
 * Built by Hugh Zabriskie.
 *
 */

Base = function (_tokens) {
	// components of the command
	this.tokens = _tokens;

	// rhythmic content
	this.hits = [];

	// other attributes
	this.attributes = {
		offset: 0,		// intra-measure offset (measured in fractions of a beat)
		gain: 1.0,		// gain (volume)
		sections: [] 	// sections that contain it
	};

	// holds error message
	this.error = null;
};

Base.prototype.grabRhythm = function () {
	var beatDuration = (60 / tempo);

	this.hits = [];
	
	// "on 1 2 4"
	if (this.tokens[2] === "on") {
		var i = 3;
		var hit = parseFloat(this.tokens[i]) - 1;
		do {
			this.hits.push(hit * beatDuration);
			i++;
			hit = parseFloat(this.tokens[i] - 1);
		} while (!isNaN(hit));
		this.rhythmTokens = this.tokens.slice(3, i + 1);
	}
	
	// "every 8th"
	else if (this.tokens[2] === "every") {
		var denom = parseInt(this.tokens[3].slice(0, -2)); // slice off the "th"
		var denomDuration = (60 / tempo) / (denom / 4);
		var offset = 0;
		for (var i = 0; i < denom; i++) {
			this.hits.push(offset); // in seconds
			offset += denomDuration;
		}
		this.rhythmTokens = this.tokens.slice(2, 4);
	}
};

Base.prototype.grabAttributes = function (command) {
	var that = this;
	var beatDuration = 60 / tempo;
	var attrSettings = settings.attributes;
	
	// offset
	var offsetMatch = command.match(attrSettings.offset.regex);
	if (offsetMatch !== null) {
		var offsetValue = extract(offsetMatch[0], "value") * beatDuration;
		if (offsetValue !== undefined && offsetValue >= attrSettings.offset.min && offsetValue <= attrSettings.offset.max) {
			this.hits = this.hits.map(function (d) {
				return d + offsetValue - that.attributes.offset;
			});
			this.attributes.offset = offsetValue;
		}
		else
			return this.onError("Invalid offset value.");
	}

	// gain
	var gainMatch = command.match(attrSettings.gain.regex);
	if (gainMatch !== null) {
		var gainValue = extract(gainMatch[0], "value");
		if (gainValue !== undefined && gainValue >= attrSettings.gain.min && gainValue <= attrSettings.gain.max)
			this.attributes.gain = gainValue;
		else
			return this.onError("Invalid gain value.");
	}
	
	// section
	var sectionMatch = command.match(attrSettings.section.regex);
	if (sectionMatch !== null) {
		var sectionValue = extract(sectionMatch[0]);
		if (sectionValue !== undefined)
			this.attributes.sections.push(sectionValue.toUpperCase());
	}
	
	if (buildingSection && this.attributes.sections.length === 0)
		this.attributes.sections.push(buildingSection);
	else if (this.attributes.sections.length === 0)
		this.attributes.sections.push("MASTER");
};

Base.prototype.setDisplayInfo = function () {
	
	// any settings configuration takes precedent
	if (this.metadata.displayInfo === undefined)
		this.metadata.displayInfo = new Object();
	var mdi = this.metadata.displayInfo;
	
	// index: a perpetually increasing track counter
	this.displayInfo = {
		instrument : (mdi.fullName !== undefined) ? mdi.fullName : this.metadata.alias,
		sections : (mdi.sections !== undefined) ? mdi.sections : this.attributes.sections.join(", ").substring(0, settings.displayInfo.maxCharLimit),
		melody : (mdi.melody !== undefined) ? mdi.melody : this.buffers.join(" ").substring(0, settings.displayInfo.maxCharLimit),
		rhythm : (mdi.rhythm !== undefined) ? mdi.rhythm : this.rhythmTokens.join(" ")
	};
};
 
// Convert: add pianocol(as5-1,f5-1.5,d5-2,a5-2.5,f5-2.5)
// to a set of pitches and rhythms
Base.prototype.evaluateCollection = function () {
	var beatDuration = (60 / tempo);
	this.isCollection = true;
	try {
		var collection = extract(this.tokens[1], "string").split(",");
		if (collection.length < 1) throw "Invalid syntax."
		this.pitches = [];
		this.hits = [];
		for (var c in collection) {
			var item = collection[c].split("-");
			if (item.length !== 2) throw "Invalid syntax."
			this.pitches[c] = item[0];
			this.hits[c] = (parseFloat(item[1]) - 1) * beatDuration;
		}
		this.pitches = this.pitches.map(reverseNote);
	}
	catch (err) {
		return sequencer.onError(err);
	}
};

 
// Create a buffer source for each sound occurrence
Base.prototype.play = function (time, buffer) {
	var source = globalContext.createBufferSource();
	var gain = globalContext.createGain();
	source.buffer = buffer;
	gain.gain.value = this.attributes.gain;
	source.connect(gain);
	gain.connect(globalScriptNode);
	globalScriptNode.connect(globalContext.destination);
	source.start(time);
	
	source.onended = function () {
		source.disconnect(scriptNode);
	};
};


Base.prototype.stop = function ()	{ /* should be overridden */ };
Base.prototype.pause = function () { /* should be overridden */ };

// default error logging method
Base.prototype.onError = function (reason) {
	this.error = reason;
};




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
	var rev = note[note.length - 1] + note[0].toUpperCase();
	return (note.length === 3) ? rev + "s" : rev;
}

// extract the inner object: "bar" in foo(bar)
function extract(s, format) {
	// check syntax
	var start = s.indexOf("("), end = s.lastIndexOf(")");
	if (start === -1 || start >= end || end !== s.length - 1)
		return null;
	// return what's between the parens "( ----- )"
	s = s.slice(start + 1, end);
	if (format === "string" || format === undefined) return s;
	if (format === "value") return parseFloat(s);
	if (format === "array") return s.split(",");
	if (format === "numArray") return s.split(",").map(parseFloat);
}

// extract the namespace: "foo"" in foo(bar)
function extractNamespace(s) {
	if (s.indexOf("(") < 0)
		return s;
	return s.substring(0, s.indexOf("("));
}

// converts note names to frequencies
function noteToFrequency(note) {
	var noteName = note.slice(0, note.length - 1);		// cs1 --> cs
	var noteOctave = parseInt(note[note.length - 1]);	// cs1 --> 1
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

	DISPLAYTRACKS = TRACKS;
	if (showSection)
		DISPLAYTRACKS = TRACKS.filter(function (d) { return _.contains(d.attributes.sections, showSection); });
	
	// sort by section
	DISPLAYTRACKS.sort(function (a, b) {
		return a.attributes.sections[0][0].charCodeAt() - b.attributes.sections[0][0].charCodeAt();
	});
	
	
	// delete rows and refresh the table
	while (table.rows.length > 1) {
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
		inst_cell.innerHTML = track.displayInfo.instrument;
		sect_cell.innerHTML = track.displayInfo.sections;
		mel_cell.innerHTML = track.displayInfo.melody;
		rhm_cell.innerHTML = track.displayInfo.rhythm;
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
	TRACKS.forEach(function (d) {
		if (_.contains(d.attributes.sections, section))
			containsThisSection = true;
	});

	return containsThisSection;
}

function instrumentExists(instr) {
	return _.contains(Object.keys(settings.instruments), instr);
}


// Takes a statement like "a+b-c" 
// Uses underscore.js to simplify things.
function evaluateSectionEquation(equation) {
	var sections = equation.toUpperCase().split(/[+/-]/);
	
	// check for valid sections
	if (!_.every(sections, function (d) { return sectionExists(d); }))
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
		var relatedTracks = TRACKS; // section = "ALL"
		if (section !== "ALL")
			relatedTracks = TRACKS.filter(function (d) { return _.contains(d.attributes.sections, section); });

		var mode = component[0];
		if (mode === '+')
			result = _.union(result, relatedTracks);
		if (mode === "-")
			result = _.difference(result, relatedTracks);
	}

	return result;

}

function trimWhiteSpace(str) {
	return str.replace(/\s+/g, '');
}



/*
 *
 * CONSTANTS
 *
 */

TIME_SIGNATURE = "4/4";
BEATS_PER_MEASURE = 4;
OCTAVE_LOW = 1;
OCTAVE_HIGH = 7;
 
// used for calculating frequencies
BASE_PITCHES = {
	"c1": 32.7032,
	"cs1": 34.6478,
	"d1": 36.7081,
	"ds1": 38.8909,
	"e1": 41.2034,
	"f1": 43.6535,
	"fs1": 46.2493,
	"g1": 48.9994,
	"gs1": 51.9131,
	"a1": 55.0000,
	"as1": 58.2705,
	"b1": 61.7354
};


// scales
SCALES = {
	amaj: ["a", "b", "cs", "d", "e", "fs", "gs"],
	asmaj: ["as", "c", "d", "ds", "f", "g", "a"],
	bmaj: ["b", "cs", "ds", "e", "fs", "gs", "as"],
	cmaj: ["c", "d", "e", "f", "g", "a", "b"],
	csmaj: ["cs", "ds", "f", "fs", "gs", "as", "c"],
	dmaj: ["d", "e", "fs", "g", "a", "b", "cs"],
	dsmaj: ["ds", "f", "g", "gs", "as", "c", "d"],
	emaj: ["e", "fs", "gs", "a", "b", "cs", "ds"],
	fmaj: ["f", "g", "a", "as", "c", "d", "e"],
	fsmaj: ["fs", "gs", "as", "b", "cs", "ds", "f"],
	gmaj: ["g", "a", "b", "c", "d", "e", "fs"],
	gsmaj: ["gs", "as", "c", "cs", "ds", "f", "fs"]
};








/* TRACK OBJECT STRUCTURE ---

				Base
				  |
	+=============+===============+================+
 Collection   Instrument	   Monosynth	   Generator
  				  |
				  |
	  +===========+==========+===========+=============+
	Piano		Ebass		Agtr	   Drums       **Custom**		  
	  #			  #			 #							#
  Collection   Collection  Collection				Collection(?)



NOTES
%%%%%
Instrument is "abstract". It gathers information about a series of mp3s from a json file
and creates an instrument track based on that information.

Some Instruments can "implement" the Collection interface.

You can see the need for TypeScript and some object-oriented code...

*/



/* NEW INSTRUMENT SPECIFICATION ---

What do I need to know to generate an object for it?
- name
- melodic?
	-- if so, expected that the filenames are midi notes (i.e. piano(c4))
	-- if not, then the filenames are sounds (i.e. drums(snare))
- buffer names


Format: JSON
Filename: settings.js
*/
