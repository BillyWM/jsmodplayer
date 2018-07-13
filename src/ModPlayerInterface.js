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

    this.vizTimeDomainData = new Uint8Array(player.analyzer.frequencyBinCount);
    this.vizFreqDomainData = new Uint8Array(player.analyzer.frequencyBinCount);

    this.visualizerBars = null;
    this.oscilloscopePath = null;

    this.frames = 0;
}

ModPlayerInterface.prototype.subscribeCallbacks = function() {
    // player.onnewsamples = (samples) => {
    //     console.log(`Got ${samples.length} samples`);
    // }
}

ModPlayerInterface.prototype.play = function() {

}

ModPlayerInterface.prototype.setVisualizerBars = function(freqData) {
    let skip = 0;
    freqData = freqData.map(x => Math.floor(x / 255 * 100));
    freqData = freqData.filter(x => skip++ % 16 == 0);

    this.visualizerBars = freqData;
    // visualizerData.fps = Math.floor(1000/(timestamp - lastTimestamp));
}

ModPlayerInterface.prototype.setOscilloscopePath = function(timeData) {

    // if (this.frames % 3 == 0) return;

    let path = "M 0 50 ";

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

    player.play();

    requestAnimationFrame(this.visualize);
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