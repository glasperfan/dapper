/*
 *
 * Dynamically updates documentation based on the 
 * current settings. 
 *
 */
var documentation = {
	
	update: function () {
		var instrDocEl = document.getElementsByClassName("doc-section section-instruments")[0];

		// <h2>Instruments</h2>
		var header = document.createElement("h2");
		header.innerHTML = "Instruments";
		instrDocEl.appendChild(header);
		
		for (var index in settings.instruments) {
			var instrument = settings.instruments[index];

			// <h4>Instrument Name</h4>
			var nameEl = this.createElement(
				"h4",
				"doc-instrument-name",
				instrument.fullName
			);
			instrDocEl.appendChild(nameEl);
			
			// alias: this is what is used to reference the instrument
			var aliasEl = this.createElement(
				"p",
				"doc-instrument-alias",
				"Alias: " + instrument.alias
			);
			instrDocEl.appendChild(aliasEl);
			
			var melodicEl = this.createElement(
				"p",
				"doc-instrument-melodic",
				"Melodic: " + (instrument.melodic ? "yes" : "no")
			);
			instrDocEl.appendChild(melodicEl);
			
			// if it's not melodic, state the available buffers
			if (!instrument.melodic) {
				var bufferEl = this.createElement(
					"p",
					"doc-instrument-buffers",
					"Buffers: " + instrument.buffers.join(", ")
				);
				instrDocEl.appendChild(bufferEl);
			}
			
			// otherwise, state the available pitch range
			else {
				var lowestNoteEl = this.createElement(
					"p",
					"doc-instrument-lowestNote",
					"Lowest note: " + instrument.lowestNote
				);
				instrDocEl.appendChild(lowestNoteEl);

				var highestNoteEl = this.createElement(
					"p",
					"doc-instrument-highestNote",
					"Highest note: " + instrument.highestNote
				);
				instrDocEl.appendChild(highestNoteEl);
			}
		}
	},
	
	createElement : function (tag, className, innerHTML) {
		var el = document.createElement(tag);
		el.classList.add(className);
		el.innerHTML = innerHTML;
		return el;	
	}
	

};
