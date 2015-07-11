var settings = {

	/* INSTRUMENT METADATA */
	instruments: {
		agtr: {
			alias: "agtr",
			fullName: "Acoustic Guitar",
			source: "Logic Pro",
			folder: "agtr/",
			extension: "mp3",
			melodic: true,
			lowestNote: 'c3',
			highestNote: 'c6'
		},
		ebass: {
			alias: "ebass",
			fullName: "Electric Bass",
			source: "Logic Pro",
			folder: "ebass/",
			extension: "mp3",
			melodic: true,
			lowestNote: 'c0',
			highestNote: 'c4'
		},
		piano: {
			alias: "piano",
			fullName: "Grand Piano",
			// See http://www.html5piano.ilinov.eu/full/ for an example.
			source: "http://pianosounds.pixelass.com/tones/grand-piano/6Cs.mp3",
			folder: "piano/",
			extension: "mp3",
			melodic: true,
			lowestNote: 'c0',
			highestNote: 'c7'
		},
		drums: {
			alias: "drums",
			fullName: "Drum Kit",
			source: "http://freewavesamples.com/",
			folder: "drums/",
			extension: "mp3",
			melodic: false,
			buffers: ['kick', 'ekick', 'dry-kick', 'boom-kick',
				'zill', 'gong', 'ride', 'ride-2', 'hihat',
				'hihat-2', 'ohihat', 'ohihat-2', 'cross',
				'snare', 'crash', 'crash-2', 'crash-3'
			]
		}
	},

	attributes: {
		offset: {
			min: 0.0,
			max: 1.0, // TODO: fix this once more time signatures are added in
			regex: /offset\([0-9.]+\)/
		},
		gain: {
			min: 0.0,
			max: 1.0,
			regex: /gain\([0-9.]+\)/
		},
		section: {
			regex: /sect\([a-zA-Z0-9_.]+\)/
		}
	},
	
	displayInfo: {
		maxCharLimit: 25 	// character limit of each cell
	},

	// specify the instruments downloaded by default
	defaultLoadedInstruments : [
		"piano",
		"drums",
		"agtr",
		"ebass"
	],
	
	
	/* ------- NO NEED TO ALTER BELOW THIS LINE ------ */
	/* MIDI NOTATION */
	MIDInotes: [
		'c0', 'cs0', 'd0', 'ds0', 'e0', 'f0', 'fs0', 'g0', 'gs0', 'a0', 'as0', 'b0',
		'c1', 'cs1', 'd1', 'ds1', 'e1', 'f1', 'fs1', 'g1', 'gs1', 'a1', 'as1', 'b1',
		'c2', 'cs2', 'd2', 'ds2', 'e2', 'f2', 'fs2', 'g2', 'gs2', 'a2', 'as2', 'b2',
		'c3', 'cs3', 'd3', 'ds3', 'e3', 'f3', 'fs3', 'g3', 'gs3', 'a3', 'as3', 'b3',
		'c4', 'cs4', 'd4', 'ds4', 'e4', 'f4', 'fs4', 'g4', 'gs4', 'a4', 'as4', 'b4',
		'c5', 'cs5', 'd5', 'ds5', 'e5', 'f5', 'fs5', 'g5', 'gs5', 'a5', 'as5', 'b5',
		'c6', 'cs6', 'd6', 'ds6', 'e6', 'f6', 'fs6', 'g6', 'gs6', 'a6', 'as6', 'b6',
		'c7', 'cs7', 'd7', 'ds7', 'e7', 'f7', 'fs7', 'g7', 'gs7', 'a7', 'as7', 'b7',
		'c8', 'cs8', 'd8', 'ds8', 'e8', 'f8', 'fs8', 'g8', 'gs8', 'a8', 'as8', 'b8',
		'c9', 'cs9', 'd9', 'ds9', 'e9', 'f9', 'fs9', 'g9', 'gs9', 'a9', 'as9', 'b9'
	],
	
	MIDInotes_oldstyle : [
		'0C', '0Cs', '0D', '0Ds', '0E', '0F', '0Fs', '0G', '0Gs', '0A', '0As', '0B', 
		'1C', '1Cs', '1D', '1Ds', '1E', '1F', '1Fs', '1G', '1Gs', '1A', '1As', '1B', 
		'2C', '2Cs', '2D', '2Ds', '2E', '2F', '2Fs', '2G', '2Gs', '2A', '2As', '2B', 
		'3C', '3Cs', '3D', '3Ds', '3E', '3F', '3Fs', '3G', '3Gs', '3A', '3As', '3B', 
		'4C', '4Cs', '4D', '4Ds', '4E', '4F', '4Fs', '4G', '4Gs', '4A', '4As', '4B', 
		'5C', '5Cs', '5D', '5Ds', '5E', '5F', '5Fs', '5G', '5Gs', '5A', '5As', '5B', 
		'6C', '6Cs', '6D', '6Ds', '6E', '6F', '6Fs', '6G', '6Gs', '6A', '6As', '6B', 
		'7C', '7Cs', '7D', '7Ds', '7E', '7F', '7Fs', '7G', '7Gs', '7A', '7As', '7B', 
		'8C', '8Cs', '8D', '8Ds', '8E', '8F', '8Fs', '8G', '8Gs', '8A', '8As', '8B', 
		'9C', '9Cs', '9D', '9Ds', '9E', '9F', '9Fs', '9G', '9Gs', '9A', '9As', '9B'
	]

};