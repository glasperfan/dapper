import requests

#######
## Download piano files (each ~12kb)
## Many thanks to pianosounds.pixelass.com for the files!!!
#######


KEYS = [
		'0A','0As','0B','0C','0Cs','0D','0Ds','0E','0F','0Fs','0G','0Gs',
	];

for key in KEYS:
	r = requests.get('http://pianosounds.pixelass.com/tones/grand-piano/' + key + '.mp3');
	f = open("%s.mp3" % key, 'w');
	f.write(r.content);
	f.close();

