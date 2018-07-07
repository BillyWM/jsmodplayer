/* eslint-disable */


/**
 * 
 * @param {ArrayBuffer} mod Data to populate this mod with. If not supplied, create an empty mod.
 */
function ModFile(mod) {

	this.mod = mod || null;
	this.data = null;
	this.samples = [];
	this.sampleData = [];
	this.positions = [];
	this.patternCount = 0;
	this.patterns = [];
	this.title = null;
	this.sampleCount = 31;

	// Load in the data if supplied
	if (this.mod instanceof ArrayBuffer) this.loadFromData(this.mod);
}

/**
 * Populate the mod from a supplied ArrayBuffer
 * 
 * @param {*} data 
 */
ModFile.prototype.loadFromData = function(mod) {

	if (!(mod instanceof ArrayBuffer)) throw new TypeError("Supplied mod data must be ArrayBuffer");

	this.mod = mod;
	let modView = new DataView(this.mod);
	let titleView = new DataView(this.mod, 0, 20);
	let decoder = new TextDecoder();

	this.title = decoder.decode(titleView);

	for (let i = 0; i < this.sampleCount; i++) {
		
		//Sample headers start 20 bytes in (after the title) and each take 30 bytes
		let offset = 20 + (i * 30);

		let sampleInfoView = new DataView(this.mod, offset, 30);

		//let sampleName = trimNulls(sampleInfo.substr(0, 22));

		this.samples[i] = {
			length: sampleInfoView.getUint16(22) * 2,
			finetune: sampleInfoView.getUint8(24),
			volume: sampleInfoView.getUint8(25),
			repeatOffset: sampleInfoView.getUint16(26) * 2,
			repeatLength: sampleInfoView.getUint16(28) * 2,
		}
	}
	
	this.positionCount = modView.getUint8(950);
	this.positionLoopPoint = modView.getUint8(951);

	for (var i = 0; i < 128; i++) {

		this.positions[i] = modView.getUint8(952 + i);

		if (this.positions[i] >= this.patternCount) {
			this.patternCount = this.positions[i] + 1;
		}
	}
	
	// TODO: identifier needs TextDecoder
	let identifierView = new DataView(this.mod, 1080, 4);
	let identifier = decoder.decode(identifierView);
	
	this.channelCount = ModFile.channelCountByIdentifier[identifier] || 4;
	
	var patternOffset = 1084;

	for (var pat = 0; pat < this.patternCount; pat++) {

		this.patterns.push([]);

		for (var row = 0; row < 64; row++) {

			this.patterns[pat].push([]);

			for (var chan = 0; chan < this.channelCount; chan++) {

				let b0 = modView.getUint8(patternOffset);
				let b1 = modView.getUint8(patternOffset + 1);
				let b2 = modView.getUint8(patternOffset + 2);
				let b3 = modView.getUint8(patternOffset + 3);
				let eff = b2 & 0x0f;

				this.patterns[pat][row][chan] = {
					sample: (b0 & 0xf0) | (b2 >> 4),
					period: ((b0 & 0x0f) << 8) | b1,
					effect: eff,
					effectParameter: b3
				};

				if (eff == 0x0E) {
					this.patterns[pat][row][chan].extEffect = (b3 & 0xF0) >> 4;
					this.patterns[pat][row][chan].extEffectParameter = (b3 & 0x0F);
				}

				patternOffset += 4;
			}
		}
	}
	
	let sampleOffset = patternOffset;
	for (let s = 0; s < this.sampleCount; s++) {

		this.samples[s].startOffset = sampleOffset;
		this.sampleData[s] = new Uint8Array(this.samples[s].length);

		let i = 0;
		for (var o = sampleOffset, e = sampleOffset + this.samples[s].length; o < e; o++) {
			this.sampleData[s][i] = modView.getUint8(o);
			i++;
		}

		sampleOffset += this.samples[s].length;
	}
}

ModFile.channelCountByIdentifier = {
	'TDZ1': 1, '1CHN': 1, 'TDZ2': 2, '2CHN': 2, 'TDZ3': 3, '3CHN': 3,
	'M.K.': 4, 'FLT4': 4, 'M!K!': 4, '4CHN': 4, 'TDZ4': 4, '5CHN': 5, 'TDZ5': 5,
	'6CHN': 6, 'TDZ6': 6, '7CHN': 7, 'TDZ7': 7, '8CHN': 8, 'TDZ8': 8, 'OCTA': 8, 'CD81': 8,
	'9CHN': 9, 'TDZ9': 9,
	'10CH': 10, '11CH': 11, '12CH': 12, '13CH': 13, '14CH': 14, '15CH': 15, '16CH': 16, '17CH': 17,
	'18CH': 18, '19CH': 19, '20CH': 20, '21CH': 21, '22CH': 22, '23CH': 23, '24CH': 24, '25CH': 25,
	'26CH': 26, '27CH': 27, '28CH': 28, '29CH': 29, '30CH': 30, '31CH': 31, '32CH': 32
}

export default ModFile;