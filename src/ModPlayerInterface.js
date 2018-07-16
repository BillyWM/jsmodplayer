/* eslint-disable */
import ModPlayer from "@/ModPlayer";

// Keep this reference off the object so Vue can't find it and make it reactive
let player = new ModPlayer();

function ModPlayerInterface() {
    this.loading = false;

    this.loadLocal = this.loadLocal.bind(this);
    this.loadRemote = this.loadRemote.bind(this);
    this.onloaded = this.onloaded.bind(this);
    this.visualize = this.visualize.bind(this);

    // Subscribe-able callbacks
    this.onvisualizerframe = null;

    this.sampleNames = [];

    this.muted = player.muted;

    this.vizTimeDomainData = new Uint8Array(player.analyzer.frequencyBinCount);
    this.vizFreqDomainData = new Uint8Array(player.analyzer.frequencyBinCount);

    this.visualizerBars = null;
    this.oscilloscopePath = null;

    this.frames = 0;

    this._animationHandle = null;
}

ModPlayerInterface.prototype.subscribeCallbacks = function() {
    // player.onnewsamples = (samples) => {
    //     console.log(`Got ${samples.length} samples`);
    // }
}

ModPlayerInterface.prototype.toggleMute = function() {
    player.toggleMute();
    this.muted = player.muted;
}

ModPlayerInterface.prototype.play = function() {

    player.play();

    console.log(player);

    this._animationalHandle = requestAnimationFrame(this.visualize);
}

ModPlayerInterface.prototype.resetVisualizer = function() {
    let empty = new Array(1024).fill(0);
    this.setVisualizerBars(empty);

    this.oscilloscopePath = "";

}

ModPlayerInterface.prototype.stop = function() {

    player.stop();

    cancelAnimationFrame(this._animationalHandle);

    this.resetVisualizer();
}

ModPlayerInterface.prototype.pause = function() {

    player.pause();
}

ModPlayerInterface.prototype.setSampleNames = function() {
    
    this.sampleNames = [];

    for (let sample of player.mod.samples) {
        this.sampleNames.push(sample.name);
    }
}

ModPlayerInterface.prototype.setVisualizerBars = function(freqData) {
    let skip = 0;
    freqData = freqData.map(x => Math.floor(x / 255 * 100));
    freqData = freqData.filter(x => skip++ % 16 == 0);

    this.visualizerBars = freqData;
}

ModPlayerInterface.prototype.setOscilloscopePath = function(timeData) {

    // if (this.frames % 3 == 0) return;

    let path = "M 0 50";

    let skip = 0;
    timeData = timeData.filter(x => skip++ % 8 == 0);

    let x = 1;
    for (let point of timeData) {
        point = Math.floor(point / 255 * 50);
        path += `L ${x} ${75 - point}`;
        x += 4;
    }

    this.oscilloscopePath = path;
}

ModPlayerInterface.prototype.visualize = function(timestamp) {

    this.frames++;

    if (!this.playing) return;

    // Recursively call itself for next frame
    requestAnimationFrame(this.visualize);

    // if (this.frames % 2 == 0) return;

    player.analyzer.getByteTimeDomainData(this.vizTimeDomainData);
    player.analyzer.getByteFrequencyData(this.vizFreqDomainData);

    this.setVisualizerBars(this.vizFreqDomainData);
    this.setOscilloscopePath(this.vizTimeDomainData);

    if (this.onvisualizerframe) this.onvisualizerframe(timestamp, this.vizTimeDomainData, this.vizFreqDomainData);

}

ModPlayerInterface.prototype.onloaded = function() {

    this.loading = false;

    this.setSampleNames();

}

ModPlayerInterface.prototype.loadLocal = function(event) {

    this.loading = true;

    player.loadLocalFile(event.target.files[0])
               .then(this.onloaded);

}

ModPlayerInterface.prototype.loadRemote = function(filePath) {

    this.loading = true;

    player.loadRemoteFile(filePath)
               .then(this.onloaded);
}

Object.defineProperty(ModPlayerInterface.prototype, "playing", {
    get: function() { return player.playing }
})


export default ModPlayerInterface;