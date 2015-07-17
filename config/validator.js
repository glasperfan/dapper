/*
 *
 * Ideally, all validation goes in here! Ideally!
 * The idea is to separate validation and functionality,
 * kind of like church and state. Then it's easier to read
 * the code and see which is which.
 * Built by Hugh Zabriskie.
 *
 */

var validator = {
	
	// error message
	error: null,
	
	// report user error
	onError: function (_error) {
		this.error = _error;
		console.log(this.error);
		this.error = null;
		return false; // signal an error
	},
	
	/* SETTINGS VALIDATION */
	settings: {
		validate: function () {
			validator.error = null;
			validator.runCascadingTests([
				this.validateDefaultInstruments,
				this.validateInstrumentMetadata
			], null);
			return validator.error === null;
		},

		validateDefaultInstruments: function () {
		
			// Gives a default
			if (settings.defaultLoadedInstruments === undefined)
				settings.defaultLoadedInstruments = ["drums", "piano"];
		
			// Validate instrument names
			if (!(settings.defaultLoadedInstruments.constructor === Array))
				return validator.onError("settings.defaultLoadedInstruments should be an array containing a list of default instruments that load when the app is launched.");
			for (var i = 0; i < settings.defaultLoadedInstruments.length; i++) {
				if (!_.contains(Object.keys(settings.instruments), settings.defaultLoadedInstruments[i]))
					return validator.onError("settings.defaultLoadedInstruments contains an invalid instrument name: " + settings.defaultLoadedInstruments[i]);
			}
		
			// return null on no error
			return null;
		},

		validateInstrumentMetadata: function () {
	
			/* Validates the instrument data */

			// Instrument metadata must exist in settings.instruments
			var instrumentObjects = Object.keys(settings.instruments);
			for (var i = 0; i < instrumentObjects.length; i++) {
				var settingsObj = settings.instruments[instrumentObjects[i]];
				var errorMessage = "Instrument " + settingsObj.fullName + ": ";
				// melodic --> bool for if the instrument is melodic (uses a system of pitches)
				if (settingsObj.melodic === undefined)
					return validator.onError(errorMessage + "'melodic' atribute must be a bool defining whether the instrument is a melodic one or not (i.e piano vs. drums)");
				if (settingsObj.melodic) {
					if (settingsObj.lowestNote === undefined)
						return validator.onError(errorMessage + "needs lowestNote specificied (as a MIDI note)");
					if (settingsObj.highestNote === undefined)
						return validator.onError(errorMessage + "needs highestNote specified (as a MIDI note)");
				}
	
				// buffers --> string array
				else {
					if (!(settingsObj.buffers.constructor === Array))
						return this.oneError(errorMessage + "'buffers' attribute needs to be an array containing the filenames of each buffer (sans extension).");
					if (settingsObj.buffers.length === 0)
						return validator.onError(errorMessage + "'buffers' attribute cannot be empty.");
				}
	
				// folder --> "instrument/" relative subdirectory
				if (settingsObj.folder === undefined) {
					return validator.onError(errorMessage + "'folder' attribute should be the path to the audio buffers relative to /instruments. So for \"instruments/piano/\", add \"piano/\"");
				}
	
				// extension --> audio buffer file extension
				if (settingsObj.extension === undefined)
					return validator.onError(errorMessage + "'extension' attribute should define the file extension for the audio buffers.");
			}
		}
	},

	midi: {
		validateNotes: function(notes) {
			if (typeof notes === "string")
				notes = notes.trim().split(",");
			if (!(notes instanceof Array))
				return validator.onError("MIDI: note input must be a command-separated list.");
			notes.forEach(function (d) {
				if (!_.contains(settings.MIDInotes, d))
					return validator.onError("MIDI: invalid note --> " + d);
			});
		}
	},
	
	instrument: {
		validate: function (tokens) {
			validator.error = null;
			validator.runCascadingTests([
				this.validateInstrument,
				this.validateBuffers
			], tokens);
			return validator.error === null;
		},
		
		//add/load _____ <-- should be an instrument alias defined in settings.instruments
		validateInstrument: function (tokens) {
			if (tokens[1].indexOf("(") < 0)
				return validator.onError("Instrument: define the instrument and then the buffer. For example: 'drums(snare)'.");
			var instrumentName = tokens[1].substring(0, tokens[1].indexOf("("));
			if (!(_.contains(Object.keys(settings.instruments), instrumentName)))
				return validator.onError("Instrument: no instrument defined as: " + instrumentName);
		},
		
		// add drums(snare)
		// add piano(c4,e4,gs4)
		validateBuffers: function (tokens) {
			var instrumentName = tokens[1].substring(0, tokens[1].indexOf("("));
			var buffers = extract(tokens[1]).split(",");
			var instrSettings = settings.instruments[instrumentName];
			for (var i in buffers) {
				if (instrSettings.melodic) {
					if (!_.contains(settings.MIDInotes, buffers[i]))
						return validator.onError("Instrument: invalid MIDI note '" + buffers[i] + "' in the buffer list. Check settings.MIDInotes.");
				}
				else {
					if (!_.contains(instrSettings.buffers, buffers[i]))
						return validator.onError("Instrument: invalid buffer '" + buffers[i] + "' in the buffer list. Check the settings for valid buffer files."); 
				}
					
			}
		}
	},
	
	
	// run multiple tests, only moving on to the next if the previous did not fail
	// all tests should accept the same input tokens; tokens can be null if no input is needed (i.e. on settings)
	runCascadingTests : function(tests, tokens) {
		for (var testIndex in tests) {
			if (tests[testIndex](tokens) === false)
				break;
		}
	}
	
};