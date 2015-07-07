import requests

#######
## Download piano files (each ~12kb)
## Many thanks to pianosounds.pixelass.com for the files!!!
#######


KEYS = [
	"0C", "0Cs", "0D", "0Ds", "0E", "0F", "0Fs", "0G", "0Gs", "0A", "0As", "0B", 
	"1C", "1Cs", "1D", "1Ds", "1E", "1F", "1Fs", "1G", "1Gs", "1A", "1As", "1B", 
	"2C", "2Cs", "2D", "2Ds", "2E", "2F", "2Fs", "2G", "2Gs", "2A", "2As", "2B", 
	"3C", "3Cs", "3D", "3Ds", "3E", "3F", "3Fs", "3G", "3Gs", "3A", "3As", "3B", 
	"4C", "4Cs", "4D", "4Ds", "4E", "4F", "4Fs", "4G", "4Gs", "4A", "4As", "4B", 
	"5C", "5Cs", "5D", "5Ds", "5E", "5F", "5Fs", "5G", "5Gs", "5A", "5As", "5B", 
	"6C", "6Cs", "6D", "6Ds", "6E", "6F", "6Fs", "6G", "6Gs", "6A", "6As", "6B", 
	"7C", "7Cs", "7D", "7Ds", "7E", "7F", "7Fs", "7G", "7Gs", "7A", "7As", "7B", 
	"8C", "8Cs", "8D", "8Ds", "8E", "8F", "8Fs", "8G", "8Gs", "8A", "8As", "8B", 
	"9C", "9Cs", "9D", "9Ds", "9E", "9F", "9Fs", "9G", "9Gs", "9A", "9As", "9B"	
];

for key in KEYS:
	r = requests.get('http://pianosounds.pixelass.com/tones/grand-piano/' + key + '.mp3');
	f = open("../instruments/piano/%s.mp3" % key, 'w');
	f.write(r.content);
	f.close();

