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
	
	onError: function (_error) {
		this.error = _error;
		console.log(this.error);
	},
	
	/* SETTINGS VALIDATION */
	settings: {
		validate: function () {
			this.validateDefaultInstruments();
			this.validateInstrumentMetadata();
			return (validator.error === null);
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
		},
	}
};