/*
	http://www.fileformat.info/format/xm/corion.htm
	
	Sample data is stored "Delta compressed like protracker"
		algorithm: http://www.fileformat.info/format/protracker/corion-algorithm.htm
*/
function XMFile(mod) {
	function trimNulls(str) {
		return str.replace(/\x00+$/, '');
	}
	function getWord(str, pos) {
		//little-endian this time
		return (str.charCodeAt(pos)) + (str.charCodeAt(pos+1) << 8)
	}
	function getDword(str, pos) {
		var value =
			(str.charCodeAt(pos+3) << 24) +
			(str.charCodeAt(pos+2) << 16) +
			(str.charCodeAt(pos+1) << 8) +
			str.charCodeAt(pos);
		return value;
	}
	function getBytes(str, pos, len) {
		return (str.substr(pos, len));
	}
	function getString(str, pos, len) {
		return trimNulls(getBytes(str, pos, len));
	}
	function getArray(str, pos, len) {
		var s = getBytes(str, pos, len);
		var arr = Array(s.length);
		for (var i = 0; i < s.length; i++) {
			arr[i] = s.charCodeAt(i);
		}
		return arr;
	}

	//this.data = mod;
	this.samples = [];
	this.positions = [];
	this.patternCount = 0;
	this.patterns = [];
	this.instruments = [];
	this.speed = 6;
	this.bpm = 125;
	
	this.title = getString(mod, 0x11, 20);				//0x11		Song name
	this.positionCount = getWord(mod, 0x40);			//0x40		Song length in patterns
	this.positionLoopPoint = getWord(mod, 0x42);		//0x42		Restart position
	this.channelCount = getWord(mod, 0x44);				//0x44		Number of channels
	this.patternCount = getWord(mod, 0x46);				//0x46		Number of patterns (0 - 255)
	this.instrumentCount = getWord(mod, 0x48);			//0x48		Number of instruments (0 - 127)
	this.speed = getWord(mod, 0x4C);					//0x4C		Default ticks/row
	this.bpm = getWord(mod, 0x4E);						//0x4E		Default bpm
	
	//0x50 - pattern order table
	for (var i = 0; i < 256; i++) {
		this.positions[i] = mod.charCodeAt(0x50+i);
	}
	
	var patternOffset = 0x50 + 256;
	var track, packBit, rowCount, dataSize;
	for (var pat = 0; pat < 1; pat++) {
		var headerLength = getDword(mod, patternOffset);	//Why? Isn't it always 9?
		rowCount = getWord(mod, patternOffset + 5);
		dataSize = getWord(mod, patternOffset + 7);
		this.patterns[pat] = {
			rowCount: rowCount,
		}
		
		//move pointer to first track of row then loop over each one
		patternOffset += 9;
		for (var row = 0; row < this.patterns[pat].rowCount; row++) {
			this.patterns[pat][row] = [];
			for (var chan = 0; chan < this.channelCount; chan++) {
				track = getArray(mod, patternOffset, 5);
				//console.log(track[0].toString(2), track);
				
				//If the most significant bit of a note is NOT set, then read data like normal
				//If it IS set, check the other bits and see what kind of data comes next
				//These are bitflags so 1 to 5 bytes may follow depending on how many are set
				//		bit 0 set: Note byte follows
				//		bit 1 set: Instrument byte follows
				//		bit 2 set: Volume column byte follows
				// 		bit 3 set: Effect byte follows
				//		bit 4 set: Effect data byte follows
				var packBit = track[0] & 0x80;
				var packFlags = track[0] & 0x1F; 	//00011111b
				var noteByte = 0, instrByte = 0, volByte = 0, effByte = 0, effParamByte = 0;
				
				if (packBit) {
					var o = 1; //offset
					//check each bit in order. If set, read byte and increment pointer
					if (packFlags & 0x01) { noteByte = track[o]; o++; }			
					if (packFlags & 0x02) { instrByte = track[o]; o++; }			
					if (packFlags & 0x04) { volByte = track[o]; o++; }
					if (packFlags & 0x08) { effByte = track[o]; o++; }
					if (packFlags & 0x10) { effParamByte = track[o]; o++; }
					patternOffset += o;
				} else {
					//no compression
					noteByte = track[0];
					instrByte = track[1];
					volByte = track[2];
					effByte = track[3];
					effParamByte = track[4];
					patternOffset += 5;
				}
				
				this.patterns[pat][row][chan] = {
					note: noteByte,
					instrument: instrByte,
					volume: volByte,
					effect: effByte,
					effectParameter: effParamByte
				}
			}
		}
	}





	
}