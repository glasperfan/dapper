import requests

#######
## Download piano files (each ~12kb)
## Many thanks to pianosounds.pixelass.com for the files!!!
#######


KEYS = [
		'1A','1As','1B','1C','1Cs','1D','1Ds','1E','1F','1Fs','1G','1Gs',
		'2A','2As','2B','2C','2Cs','2D','2Ds','2E','2F','2Fs','2G','2Gs',
		'3A','3As','3B','3C','3Cs','3D','3Ds','3E','3F','3Fs','3G','3Gs',
		'4A','4As','4B','4C','4Cs','4D','4Ds','4E','4F','4Fs','4G','4Gs',
		'5A','5As','5B','5C','5Cs','5D','5Ds','5E','5F','5Fs','5G','5Gs',
		'6A','6As','6B','6C','6Cs','6D','6Ds','6E','6F','6Fs','6G','6Gs',
		'7C'
	];

for key in KEYS:
	r = requests.get('http://pianosounds.pixelass.com/tones/grand-piano/6Cs.mp3');
	f = open("%s.mp3" % key, 'w');
	f.write(r.content);
	f.close();

