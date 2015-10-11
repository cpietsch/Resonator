function sound_manager() {
	var self = {};

	var context;

	if (typeof webkitAudioContext !== "undefined") {
	    context = new webkitAudioContext();
	} else if (typeof AudioContext !== "undefined") {
	    context = new AudioContext();
	} else {
	    throw new Error('AudioContext not supported. :(');
	}

	var leftSine = context.createOscillator();
	var rightSine = context.createOscillator();

	var volumeNode = context.createGain();
	var merger = context.createChannelMerger(2);


	volumeNode.gain.value = 0.8;
	volumeNode.connect(context.destination);

	merger.connect(volumeNode);

	leftSine.connect(merger, 0, 0);
	leftSine.type = 0;
	leftSine.frequency.value = 0;
	leftSine.start(0);

	rightSine.connect(merger, 0, 1 );
	rightSine.type = 0;
	rightSine.frequency.value = 0;
	rightSine.start(0);

	self.base = 200;
	self.binaural = 14.4;
	var muted = true;
	var volume = 0.8;


	self.setFreq = function(base,binaural) {
		//console.log(self.base)
		if(base) self.base = base;
		if(binaural) self.binaural = binaural;

		//console.log("setting freq to", self.base, self.binaural)

    	rightSine.frequency.value = self.base - self.binaural/2;
    	leftSine.frequency.value = self.base + self.binaural/2;
	}

	self.stop = function  () {
		rightSine.frequency.value = 0;
		leftSine.frequency.value = 0;
	}

	self.setBinaural = function (binaural) {
		self.binaural = binaural;
		self.setFreq();
	}

	self.setBase = function (base) {
		self.base = base;
		self.setFreq();
	}

	self.setVolume = function (vol) {
		console.log("setting sound", vol)
		volumeNode.gain.value = vol;
	}

	self.mute = function(){
		if(!muted){
			console.log("mute");
			//self.setVolume(0);
			muted = true;
		}
	}

	self.play = function(){
		if(muted){
			console.log("play");
			//self.setVolume(self.volume);
			muted = false;
		}
	}

	return self;

}