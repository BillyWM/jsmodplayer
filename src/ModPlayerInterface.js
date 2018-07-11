/* eslint-disable */
import ModPlayer from "@/ModPlayer";

// Keep this reference off the object so Vue can't find it and make it reactive
let player = new ModPlayer();

function ModPlayerInterface() {
    this.loading = false;

    this.loadLocal = this.loadLocal.bind(this);
    this.loadRemote = this.loadRemote.bind(this);
    this.onloaded = this.onloaded.bind(this);  
}

ModPlayerInterface.prototype.subscribeCallbacks = function() {
    player.onnewsamples = (samples) => {
        console.log(`Got ${samples.length} samples`);
    }
}

ModPlayerInterface.prototype.onloaded = function() {

    this.loading = false;

    player.play();
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