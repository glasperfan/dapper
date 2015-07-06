var InstrumentLoader = function () {
	var that = this;
	
	this.instruments = _.map(settings.instruments, function (sf) { return sf.alias; });
	this.isLoaded = {};
	this.instruments.forEach(function (d) {
		that.isLoaded[d] = false;
	});
};

InstrumentLoader.prototype.load = function (instr) {
	
	var instrumentSettings = settings.instruments[instr];

	// validate the config/settings.js specification
	if (!settings.validate())
		return this.onError(settings.error);
		
	var bufferFolder = (instrumentSettings.folder === undefined) ? instrumentSettings.name : instrumentSettings.folder;
	var bufferNames = instrumentSettings.buffers;
	if (instrumentSettings.melodic)
		bufferNames = settings.MIDInotes.slice(settings.MIDInotes.indexOf(instrumentSettings.lowestNote), settings.MIDInotes.indexOf(instrumentSettings.highestNote));
	var bufferPaths = bufferNames.map(function (d) {
		return "instruments/" + bufferFolder + d + "." + instrumentSettings.extension;
	});
	
	// custom class for loading multiple sound clips
	// many thanks to Boris Smus (http://www.html5rocks.com/en/tutorials/webaudio/intro/js/buffer-loader.js)
	var newLoader = new BufferLoader(
		globalContext,
		bufferPaths,
		function (bufferList) {
			BUFFERS[instrumentSettings.name] = new Object();
			for (var index in bufferNames)
				BUFFERS[instrumentSettings.name][bufferNames[index]] = bufferList[index];
		});
	newLoader.load();

	this.isLoaded[instr] = true;
};


InstrumentLoader.prototype.unload = function (instr) {
	// clear memory
	BUFFERS[instrumentSettings.name] = null; // set for garbage collection
	this.isLoaded[instr] = false;
};
                                                                                                         

InstrumentLoader.prototype.onError = function (message) {
	console.log(message);
};