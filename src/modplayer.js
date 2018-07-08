/* eslint-disable */

/*
	Useful docs
		Explains effect calculations: http://www.mediatel.lu/workshop/audio/fileformat/h_mod.html

	Player lifecycle:

		

*/

import ModFile from "@/ModFile.js";

function ModPlayer() {

	this.mod = null;
	this.rate = 44100;

	this.setInitialState();
	this.initializeAudio();
}

/**
 * Create a connection to the Web Audio system
 */
ModPlayer.prototype.initializeAudio = function() {
	
	let processor;

	this.audioContext = new AudioContext();
	processor = this.audioContext.createScriptProcessor(this.bufferSize, 0, 2);
	processor.onaudioprocess = this.onaudioprocess.bind(this);
    processor.connect(this.audioContext.destination);

}

/**
 * Callback triggered continously during playback
 * 
 * @param {*} event 
 */
ModPlayer.prototype.onaudioprocess = function(event) {

	if (!this.playing) return;

	let output = {}
	let samples = this.getSamples(this.bufferSize);

	// getChannelData returns a reference we'll access through output.left / output.right
	output.left = event.outputBuffer.getChannelData(0);
	output.right = event.outputBuffer.getChannelData(1);

	for (let i=0; i < this.bufferSize; i++) {
		output.left[i] = samples[0][i];
		output.right[i] = samples[1][i];
	}
}

ModPlayer.prototype.reset = function() {
	this.stop();
	this.initializeChannels();
	this.setInitialState();
	this.setBpm();
}

/**
 * Load a file from server using XHR
 */
ModPlayer.prototype.loadRemoteFile = function(path) {
    var request = new XMLHttpRequest();
    request.open('GET', path);
	request.responseType = "arraybuffer";
	
	// Wrap XHR onload callback with a Promise
	let promise = new Promise((resolve, reject) => {
		request.onload = () => {
			this.loadMod(request.response);
			resolve();
		}
	});

	request.send();	
	return promise;
}

/**
 * Load a .mod file from harddrive using HTML5 File API
 * 
 * @param {*} file 
 */
ModPlayer.prototype.loadLocalFile = function(file) {

	let reader = new FileReader();
	
	// Wrap FileReader onload callback with a Promise
	let promise = new Promise((resolve, reject) => {
		reader.onload = (event) => {
			this.loadMod(event.target.result);
			resolve();
		}
	});

	reader.readAsArrayBuffer(file);	
	return promise;
}

ModPlayer.prototype.loadMod = function(fileContents) {
	this.mod = new ModFile(fileContents);
	this.initializeChannels();
	this.setBpm(125);
	this.loadPosition(0);
	this.playing = true;
}


ModPlayer.prototype.play = function() {
	this.playing = true;
}

ModPlayer.prototype.stop = function() {

}

ModPlayer.prototype.initializeChannels = function() {

	this.channels = [];

	for (let chan = 0; chan < this.mod.channelCount; chan++) {
		this.channels[chan] = {
			playing: false,
			sample: this.mod.samples[0],
			finetune: 0,
			volume: 0,
			pan: 0x7F,				//unimplemented
			volumeDelta: 0,
			periodDelta: 0,
			fineVolumeDelta: 0,
			finePeriodDelta: 0,
			tonePortaTarget: 0, 	//target for 3xx, 5xy as period value
			tonePortaDelta: 0,
			tonePortaVolStep: 0, 	//remember pitch slide step for when 5xx is used
			effects: {
				arpeggioActive: false,
				cutActive: false,		
				delayActive: false,
				retriggerActive: false,
				tonePortaActive: false,

				// Tick to cut at (if effect is active)
				cutPosition: null,
				// Note to delay until (if effect is active)
				delayPosition: null,
				retriggerPoint: null
			}
		};
	}
}

ModPlayer.prototype.setInitialState = function() {

	this.playing = false;

	// Playback properties for browser, not properties of the .mod
	this.playbackChannels = 2;
	this.sampleRate = 44100;
	this.bufferSize = 8192;	

	this.ticksPerFrame = null;				// calculated by setBpm
	this.currentPattern = null;
	this.currentPosition = null;
	this.currentRow = null;

	this.ticksPerSecond = 7093789.2;		// PAL frequency
	this.ticksPerOutputSample = Math.round(this.ticksPerSecond / this.rate);
	this.ticksSinceStartOfFrame = 0;

	/* initial player state */
	this.framesPerRow = 6;
	this.currentFrame = 0;
	this.exLoop = false;		//whether E6x looping is currently set
	this.exLoopStart = 0;		//loop point set up by E60
	this.exLoopEnd = 0;			//end of loop (where we hit a E6x cmd) for accurate counting
	this.exLoopCount = 0;		//loops remaining
	this.doBreak = false;		//Bxx, Dxx - jump to order and pattern break
	this.breakPos = 0;
	this.breakRow = 0;
	this.delayRows = false;		//EEx pattern delay.

}

ModPlayer.prototype.setBpm = function(bpm) {
	// x beats per minute => x*4 rows per minute
	this.ticksPerFrame = Math.round(this.ticksPerSecond * 2.5/bpm);
}

ModPlayer.prototype.getNextRow = function() {
	/*
		Determine where we're gonna go based on active effect.
		Either:
			break (jump to new pattern),
			do extended loop,
			advance normally
	*/
	if (this.doBreak) {
		//Dxx commands at the end of modules are fairly common for some reason
		//so make sure jumping past the end loops back to the start
		this.breakPos = this.breakPos >= this.mod.positionCount
						? this.mod.positionLoopPoint
						: this.breakPos;

		this.loadPosition(this.breakPos);

	} else if (this.exLoop && this.currentRow == this.exLoopEnd && this.exLoopCount > 0) {

		//count down the loop and jump back
		this.loadRow(this.exLoopStart);
		this.exLoopCount--;

	} else {

		if (this.currentRow == 63) {
			this.getNextPosition();
		} else {
			this.loadRow(this.currentRow + 1);
		}
	}
	
	if (this.exLoopCount < 0) this.exLoop = false;
}

ModPlayer.prototype.getNextPosition = function() {
	if (this.currentPosition + 1 >= this.mod.positionCount) {
		this.loadPosition(this.mod.positionLoopPoint);
	} else {
		this.loadPosition(this.currentPosition + 1);
	}
}

ModPlayer.prototype.doFrame = function() {
	/*
		apply volume/pitch slide before fetching row,
		because the first frame of a row does NOT have the slide applied
	*/

	for (let chan = 0; chan < this.mod.channelCount; chan++) {
		let channel = this.channels[chan];
		let finetune = channel.finetune;

		// apply fine slides only once
		if (this.currentFrame == 0) {
			channel.ticksPerSample += channel.finePeriodDelta * 2;
			channel.volume += channel.fineVolumeDelta;
		}

		channel.volume += channel.volumeDelta;

		channel.volume = this._clamp(channel.volume, 0, 64);

		if (channel.effects.cutActive && this.currentFrame >= channel.effects.cutPosition) channel.volume = 0;
		if (channel.effects.delayActive && this.currentFrame <= channel.effects.delayPosition) channel.volume = 0;

		if (channel.effects.retriggerActive) {
			//short-circuit prevents x mod 0
			if (channel.effects.retriggerPoint === 0 || this.currentFrame % channel.retrigger === 0) channel.samplePosition = 0;
		}

		channel.ticksPerSample += channel.periodDelta * 2;

		if (channel.effects.tonePortaActive) {
			channel.ticksPerSample += channel.tonePortaDelta * 2;
			//don't slide below or above allowed note, depending on slide direction
			if (channel.tonePortaDir == 1 && channel.ticksPerSample > channel.tonePortaTarget * 2) {
				channel.ticksPerSample = channel.tonePortaTarget * 2;
			} else if (channel.tonePortaDir == -1 && channel.ticksPerSample < channel.tonePortaTarget * 2)  {
				channel.ticksPerSample = channel.tonePortaTarget * 2;
			}
		}
		
		/* 96 is equivalent to period 48, a bit higher than the highest note */
		channel.ticksPerSample = this._clamp(channel.ticksPerSample, 96, 4096);

		if (channel.effects.arpeggioActive) {
			channel.arpeggioCounter++;
			let noteNumber = channel.arpeggioNotes[channel.arpeggioCounter % 3];
			channel.ticksPerSample = ModPlayer.ModPeriodTable[finetune][noteNumber] * 2;
		}
	}

	this.currentFrame++;
	if (this.currentFrame === this.framesPerRow) {

		this.currentFrame = 0;

		//Don't advance to reading more rows if pattern delay effect is active
		if (this.delayRows !== false) {
			this.delayRows--;
			if (this.delayRows < 0) this.delayRows = false;
		} else {
			this.getNextRow();
		}
	}
}

ModPlayer.prototype._clamp = function(value, min, max) {
	return Math.max(min, Math.min(max, value));
}

ModPlayer.prototype.getSamples = function(sampleCount) {
	let samplesLeft = [];
	let samplesRight = [];
	let i = 0;
	while (i < sampleCount) {
		this.ticksSinceStartOfFrame += this.ticksPerOutputSample;
		while (this.ticksSinceStartOfFrame >= this.ticksPerFrame) {
			this.doFrame();
			this.ticksSinceStartOfFrame -= this.ticksPerFrame;
		}
		
		this.leftOutputLevel = 0;
		this.rightOutputLevel = 0;
		for (let chan = 0; chan < this.mod.channelCount; chan++) {
			let channel = this.channels[chan];
			if (channel.playing) {
				channel.ticksSinceStartOfSample += this.ticksPerOutputSample;
				while (channel.ticksSinceStartOfSample >= channel.ticksPerSample) {
					channel.samplePosition++;
					if (channel.sample.repeatLength > 2 && channel.samplePosition >= channel.sample.repeatOffset + channel.sample.repeatLength) {
						channel.samplePosition = channel.sample.repeatOffset;
					} else if (channel.samplePosition >= channel.sample.length) {
						channel.playing = false;
						break;
					} else 
					channel.ticksSinceStartOfSample -= channel.ticksPerSample;
				}

				/* range of outputlevels is 128*64*2*channelCount
					(well, it could be more for odd channel counts) */
				if (channel.playing) {
					
					let rawVol = this.mod.sampleData[channel.sampleNum][channel.samplePosition];

					// range (-128*64)..(127*64)
					let vol = (((rawVol + 128) & 0xff) - 128) * channel.volume;

					// hard panning(?): left, right, right, left
					if (chan & 3 == 0 || chan & 3 == 3) { 
						this.leftOutputLevel += (vol + channel.pan) * 3;
						this.rightOutputLevel += (vol + 0xFF - channel.pan);
					} else {
						this.leftOutputLevel += (vol + 0xFF - channel.pan)
						this.rightOutputLevel += (vol + channel.pan) * 3;
					}
				}
			}
		}
		
		samplesLeft[i] = this.leftOutputLevel / (128 * 128 * this.mod.channelCount);
		samplesRight[i] = this.rightOutputLevel / (128 * 128 * this.mod.channelCount);
		i += 1;
	}
	
	return [samplesLeft, samplesRight];
}

ModPlayer.prototype.loadRow = function(rowNumber) {

	this.currentRow = rowNumber;
	this.currentFrame = 0;
	this.doBreak = false;
	this.breakPos = 0;
	this.breakRow = 0;

	for (let chan = 0; chan < this.mod.channelCount; chan++) {

		let channel = this.channels[chan];
		let prevNote = channel.prevNote;
		let note = this.currentPattern[this.currentRow][chan];

		if (typeof channel.sampleNum === "undefined") channel.sampleNum = 0;

		if (note.period !== 0 || note.sample !== 0) {

			channel.playing = true;
			channel.samplePosition = 0;
			channel.ticksSinceStartOfSample = 0; /* that's 'sample' as in 'individual volume reading' */

			if (note.sample !== 0) {
				channel.sample = this.mod.samples[note.sample - 1];
				channel.sampleNum = note.sample - 1;
				channel.volume = channel.sample.volume;
				channel.finetune = channel.sample.finetune;
			}

			if (note.period !== 0) { // && note.effect != 0x03

				//the note specified in a tone porta command is not actually played
				if (note.effect != 0x03) {
					channel.noteNumber = this.modPeriodToNoteNumber(note.period);
					channel.ticksPerSample = ModPlayer.ModPeriodTable[channel.finetune][channel.noteNumber] * 2;
				} else {
					channel.noteNumber = this.modPeriodToNoteNumber(prevNote.period);
					channel.ticksPerSample = ModPlayer.ModPeriodTable[channel.finetune][channel.noteNumber] * 2;
				}
			}
		}

		channel.finePeriodDelta = 0;
		channel.fineVolumeDelta = 0;
		channel.effects.cutActive = false;
		channel.effects.delayActive = false;
		channel.effects.retriggerAcive = false;
		channel.effects.tonePortaActive = false;

		if (note.effect != 0 || note.effectParameter != 0) {

			channel.effects.arpeggioActive = false;

			// New effects cancel these deltas
			channel.volumeDelta = 0;
			channel.periodDelta = 0;
			
			switch (note.effect) {

				/* arpeggio: 0xy */
				case 0x00: 
					channel.effects.arpeggioActive = true;
					channel.arpeggioNotes = [
						channel.noteNumber,
						channel.noteNumber + (note.effectParameter >> 4),
						channel.noteNumber + (note.effectParameter & 0x0f)
					]
					channel.arpeggioCounter = 0;
					break;

				/* pitch slide up - 1xx */
				case 0x01: 
					channel.periodDelta = -note.effectParameter;
					break;

				/* pitch slide down - 2xx */
				case 0x02: 
					channel.periodDelta = note.effectParameter;
					break;

				/* slide to note 3xy - */
				case 0x03: 
					channel.effects.tonePortaActive = true;
					channel.tonePortaTarget = (note.period != 0) ? note.period : channel.tonePortaTarget;
					let dir = (channel.tonePortaTarget < prevNote.period) ? -1 : 1;
					channel.tonePortaDelta = (note.effectParameter * dir);
					channel.tonePortaVolStep = (note.effectParameter * dir);
					channel.tonePortaDir = dir;
					break;

				/* portamento to note with volume slide 5xy */
				case 0x05: 
					channel.effects.tonePortaActive = true;
					if (note.effectParameter & 0xf0) {
						channel.volumeDelta = note.effectParameter >> 4;
					} else {
						channel.volumeDelta = -note.effectParameter;
					}
					channel.tonePortaDelta = channel.tonePortaVolStep;
					break;

				/* sample offset - 9xx */
				case 0x09: 
					channel.samplePosition = 256 * note.effectParameter;
					break;

				/* volume slide - Axy */
				case 0x0A: 
					if (note.effectParameter & 0xf0) {
						/* volume increase by x */
						channel.volumeDelta = note.effectParameter >> 4;
					} else {
						/* volume decrease by y */
						channel.volumeDelta = -note.effectParameter;
					}
					break;

				/* jump to order */
				case 0x0B:
					this.doBreak = true;
					this.breakPos = note.effectParameter;
					this.breakRow = 0;
					break;
				
				// 0x0C: Volume
				case 0x0C:
					if (note.effectParameter > 64) {
						channel.volume = 64;
					} else {
						channel.volume = note.effectParameter;
					}
					break;

				// 0x0D: pattern break; jump to next pattern at specified row
				case 0x0D: 
					this.doBreak = true;
					this.breakPos = this.currentPosition + 1;
					//Row is written as DECIMAL so grab the high part as a single digit and do some math
					this.breakRow = ((note.effectParameter & 0xF0) >> 4) * 10 + (note.effectParameter & 0x0F);
					break;
					
				case 0x0E:
					// Yes we're doing nested switch. Effect "E" (extended) encompasses multiple effects.
					switch (note.extEffect) {	
						case 0x01: /* fine pitch slide up - E1x */
							channel.finePeriodDelta = -note.extEffectParameter;
							break;
						case 0x02: /* fine pitch slide down - E2x */
							channel.finePeriodDelta = note.extEffectParameter;
							break;
						case 0x05: /* set finetune - E5x */
							channel.finetune = note.extEffectParameter;
							break;
						case 0x09: /* retrigger sample - E9x */
							channel.effects.retriggerPoint = note.extEffectParameter;
							channel.effects.retriggerActive = true;
							break;
						case 0x0A: /* fine volume slide up - EAx */
							channel.fineVolumeDelta = note.extEffectParameter;
							break;
						case 0x0B: /* fine volume slide down - EBx */
							channel.fineVolumeDelta = -note.extEffectParameter;
							break;
						case 0x0C: /* note cut - ECx */
							channel.effects.cutPosition = note.extEffectParameter;
							channel.effects.cutActive = true;
							break;
						case 0x0D: /* note delay - EDx */
							channel.effects.delayPosition = note.extEffectParameter;
							channel.effects.delayActive = true;
							break;
						case 0x0E: /* pattern delay EEx */
							this.delayRows = note.extEffectParameter;
							break;
						
						// Effect E6x can either set loop start or loop end
						case 0x06:
							//set loop start with E60
							if (note.extEffectParameter === 0) {
								this.exLoopStart = this.currentRow;
							} else {
								//set loop end with E6x
								this.exLoopEnd = this.currentRow;

								//activate the loop only if it's new
								if (!this.exLoop) {
									this.exLoop = true;
									this.exLoopCount = note.extEffectParameter;
								}
							}
							break;
					}
					
					break;
					
				/* tempo change. <=32 sets ticks/row, greater sets beats/min instead */
				case 0x0F: 
					let newSpeed = (note.effectParameter == 0) ? 1 : note.effectParameter; /* 0 is treated as 1 */
					if (newSpeed <= 32) { 
						this.framesPerRow = newSpeed;
					} else {
						this.setBpm(newSpeed);
					}
					break;
			}
		}
		
		// for figuring out tone portamento effect
		if (note.period != 0) channel.prevNote = note;
		
		if (!channel.effects.tonePortaActive) {
			channel.tonePortaDelta = 0;
			channel.tonePortaTarget = 0;
			channel.tonePortaVolStep = 0;
		}
	}
	
}

ModPlayer.prototype.loadPattern = function(patternNumber) {
	let row = this.doBreak ? this.breakRow : 0;
	this.currentPattern = this.mod.patterns[patternNumber];
	this.loadRow(row);
}

// loadPosition -> loadPattern -> loadRow
ModPlayer.prototype.loadPosition = function(positionNumber) {
	//Handle invalid position numbers that may be passed by invalid loop points
	positionNumber = (positionNumber > this.mod.positionCount - 1) ? 0 : positionNumber;	
	this.currentPosition = positionNumber;
	this.loadPattern(this.mod.positions[this.currentPosition]);
}

ModPlayer.prototype.modPeriodToNoteNumber = function(period) {

	return ModPlayer.ModPeriodToNoteNumber[period];
}

/*
ModPeriodTable[ft][n] = the period to use for note number n at finetune value ft.
Finetune values are in twos-complement, i.e. [0,1,2,3,4,5,6,7,-8,-7,-6,-5,-4,-3,-2,-1]
The first table is used to generate a reverse lookup table, to find out the note number
for a period given in the MOD file.
*/
ModPlayer.ModPeriodTable = [
	[1712, 1616, 1524, 1440, 1356, 1280, 1208, 1140, 1076, 1016, 960 , 906,
	 856 , 808 , 762 , 720 , 678 , 640 , 604 , 570 , 538 , 508 , 480 , 453,
	 428 , 404 , 381 , 360 , 339 , 320 , 302 , 285 , 269 , 254 , 240 , 226,
	 214 , 202 , 190 , 180 , 170 , 160 , 151 , 143 , 135 , 127 , 120 , 113,
	 107 , 101 , 95  , 90  , 85  , 80  , 75  , 71  , 67  , 63  , 60  , 56 ],
	[1700, 1604, 1514, 1430, 1348, 1274, 1202, 1134, 1070, 1010, 954 , 900,
	 850 , 802 , 757 , 715 , 674 , 637 , 601 , 567 , 535 , 505 , 477 , 450,
	 425 , 401 , 379 , 357 , 337 , 318 , 300 , 284 , 268 , 253 , 239 , 225,
	 213 , 201 , 189 , 179 , 169 , 159 , 150 , 142 , 134 , 126 , 119 , 113,
	 106 , 100 , 94  , 89  , 84  , 79  , 75  , 71  , 67  , 63  , 59  , 56 ],
	[1688, 1592, 1504, 1418, 1340, 1264, 1194, 1126, 1064, 1004, 948 , 894,
	 844 , 796 , 752 , 709 , 670 , 632 , 597 , 563 , 532 , 502 , 474 , 447,
	 422 , 398 , 376 , 355 , 335 , 316 , 298 , 282 , 266 , 251 , 237 , 224,
	 211 , 199 , 188 , 177 , 167 , 158 , 149 , 141 , 133 , 125 , 118 , 112,
	 105 , 99  , 94  , 88  , 83  , 79  , 74  , 70  , 66  , 62  , 59  , 56 ],
	[1676, 1582, 1492, 1408, 1330, 1256, 1184, 1118, 1056, 996 , 940 , 888,
	 838 , 791 , 746 , 704 , 665 , 628 , 592 , 559 , 528 , 498 , 470 , 444,
	 419 , 395 , 373 , 352 , 332 , 314 , 296 , 280 , 264 , 249 , 235 , 222,
	 209 , 198 , 187 , 176 , 166 , 157 , 148 , 140 , 132 , 125 , 118 , 111,
	 104 , 99  , 93  , 88  , 83  , 78  , 74  , 70  , 66  , 62  , 59  , 55 ],
	[1664, 1570, 1482, 1398, 1320, 1246, 1176, 1110, 1048, 990 , 934 , 882,
	 832 , 785 , 741 , 699 , 660 , 623 , 588 , 555 , 524 , 495 , 467 , 441,
	 416 , 392 , 370 , 350 , 330 , 312 , 294 , 278 , 262 , 247 , 233 , 220,
	 208 , 196 , 185 , 175 , 165 , 156 , 147 , 139 , 131 , 124 , 117 , 110,
	 104 , 98  , 92  , 87  , 82  , 78  , 73  , 69  , 65  , 62  , 58  , 55 ],
	[1652, 1558, 1472, 1388, 1310, 1238, 1168, 1102, 1040, 982 , 926 , 874,
	 826 , 779 , 736 , 694 , 655 , 619 , 584 , 551 , 520 , 491 , 463 , 437,
	 413 , 390 , 368 , 347 , 328 , 309 , 292 , 276 , 260 , 245 , 232 , 219,
	 206 , 195 , 184 , 174 , 164 , 155 , 146 , 138 , 130 , 123 , 116 , 109,
	 103 , 97  , 92  , 87  , 82  , 77  , 73  , 69  , 65  , 61  , 58  , 54 ],
	[1640, 1548, 1460, 1378, 1302, 1228, 1160, 1094, 1032, 974 , 920 , 868,
	 820 , 774 , 730 , 689 , 651 , 614 , 580 , 547 , 516 , 487 , 460 , 434,
	 410 , 387 , 365 , 345 , 325 , 307 , 290 , 274 , 258 , 244 , 230 , 217,
	 205 , 193 , 183 , 172 , 163 , 154 , 145 , 137 , 129 , 122 , 115 , 109,
	 102 , 96  , 91  , 86  , 81  , 77  , 72  , 68  , 64  , 61  , 57  , 54 ],
	[1628, 1536, 1450, 1368, 1292, 1220, 1150, 1086, 1026, 968 , 914 , 862,
	 814 , 768 , 725 , 684 , 646 , 610 , 575 , 543 , 513 , 484 , 457 , 431,
	 407 , 384 , 363 , 342 , 323 , 305 , 288 , 272 , 256 , 242 , 228 , 216,
	 204 , 192 , 181 , 171 , 161 , 152 , 144 , 136 , 128 , 121 , 114 , 108,
	 102 , 96  , 90  , 85  , 80  , 76  , 72  , 68  , 64  , 60  , 57  , 54 ],
	[1814, 1712, 1616, 1524, 1440, 1356, 1280, 1208, 1140, 1076, 1016, 960,
	 907 , 856 , 808 , 762 , 720 , 678 , 640 , 604 , 570 , 538 , 508 , 480,
	 453 , 428 , 404 , 381 , 360 , 339 , 320 , 302 , 285 , 269 , 254 , 240,
	 226 , 214 , 202 , 190 , 180 , 170 , 160 , 151 , 143 , 135 , 127 , 120,
	 113 , 107 , 101 , 95  , 90  , 85  , 80  , 75  , 71  , 67  , 63  , 60 ],
	[1800, 1700, 1604, 1514, 1430, 1350, 1272, 1202, 1134, 1070, 1010, 954,
	 900 , 850 , 802 , 757 , 715 , 675 , 636 , 601 , 567 , 535 , 505 , 477,
	 450 , 425 , 401 , 379 , 357 , 337 , 318 , 300 , 284 , 268 , 253 , 238,
	 225 , 212 , 200 , 189 , 179 , 169 , 159 , 150 , 142 , 134 , 126 , 119,
	 112 , 106 , 100 , 94  , 89  , 84  , 79  , 75  , 71  , 67  , 63  , 59 ],
	[1788, 1688, 1592, 1504, 1418, 1340, 1264, 1194, 1126, 1064, 1004, 948,
	 894 , 844 , 796 , 752 , 709 , 670 , 632 , 597 , 563 , 532 , 502 , 474,
	 447 , 422 , 398 , 376 , 355 , 335 , 316 , 298 , 282 , 266 , 251 , 237,
	 223 , 211 , 199 , 188 , 177 , 167 , 158 , 149 , 141 , 133 , 125 , 118,
	 111 , 105 , 99  , 94  , 88  , 83  , 79  , 74  , 70  , 66  , 62  , 59 ],
	[1774, 1676, 1582, 1492, 1408, 1330, 1256, 1184, 1118, 1056, 996 , 940,
	 887 , 838 , 791 , 746 , 704 , 665 , 628 , 592 , 559 , 528 , 498 , 470,
	 444 , 419 , 395 , 373 , 352 , 332 , 314 , 296 , 280 , 264 , 249 , 235,
	 222 , 209 , 198 , 187 , 176 , 166 , 157 , 148 , 140 , 132 , 125 , 118,
	 111 , 104 , 99  , 93  , 88  , 83  , 78  , 74  , 70  , 66  , 62  , 59 ],
	[1762, 1664, 1570, 1482, 1398, 1320, 1246, 1176, 1110, 1048, 988 , 934,
	 881 , 832 , 785 , 741 , 699 , 660 , 623 , 588 , 555 , 524 , 494 , 467,
	 441 , 416 , 392 , 370 , 350 , 330 , 312 , 294 , 278 , 262 , 247 , 233,
	 220 , 208 , 196 , 185 , 175 , 165 , 156 , 147 , 139 , 131 , 123 , 117,
	 110 , 104 , 98  , 92  , 87  , 82  , 78  , 73  , 69  , 65  , 61  , 58 ],
	[1750, 1652, 1558, 1472, 1388, 1310, 1238, 1168, 1102, 1040, 982 , 926,
	 875 , 826 , 779 , 736 , 694 , 655 , 619 , 584 , 551 , 520 , 491 , 463,
	 437 , 413 , 390 , 368 , 347 , 328 , 309 , 292 , 276 , 260 , 245 , 232,
	 219 , 206 , 195 , 184 , 174 , 164 , 155 , 146 , 138 , 130 , 123 , 116,
	 109 , 103 , 97  , 92  , 87  , 82  , 77  , 73  , 69  , 65  , 61  , 58 ],
	[1736, 1640, 1548, 1460, 1378, 1302, 1228, 1160, 1094, 1032, 974 , 920,
	 868 , 820 , 774 , 730 , 689 , 651 , 614 , 580 , 547 , 516 , 487 , 460,
	 434 , 410 , 387 , 365 , 345 , 325 , 307 , 290 , 274 , 258 , 244 , 230,
	 217 , 205 , 193 , 183 , 172 , 163 , 154 , 145 , 137 , 129 , 122 , 115,
	 108 , 102 , 96  , 91  , 86  , 81  , 77  , 72  , 68  , 64  , 61  , 57 ],
	[1724, 1628, 1536, 1450, 1368, 1292, 1220, 1150, 1086, 1026, 968 , 914,
	 862 , 814 , 768 , 725 , 684 , 646 , 610 , 575 , 543 , 513 , 484 , 457,
	 431 , 407 , 384 , 363 , 342 , 323 , 305 , 288 , 272 , 256 , 242 , 228,
	 216 , 203 , 192 , 181 , 171 , 161 , 152 , 144 , 136 , 128 , 121 , 114,
	 108 , 101 , 96  , 90  , 85  , 80  , 76  , 72  , 68  , 64  , 60  , 57 ]
];

ModPlayer.ModPeriodToNoteNumber = {};

for (let i = 0; i < ModPlayer.ModPeriodTable[0].length; i++) {
	ModPlayer.ModPeriodToNoteNumber[ModPlayer.ModPeriodTable[0][i]] = i;
}

export default ModPlayer;