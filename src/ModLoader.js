// var modPlayer;

// var playing = false;
// var channels = 2;				//stereo
// var sampleRate = 44100;
// var bufferSize = 8192;			// buffer size is no longer multiplied by channels
//                                 //		because buffers are per-channel



/* load from harddrive using HTML5 File API */
function loadLocal(file) {
    var reader = new FileReader();
    reader.onload = (function(theFile) {
        return function(e) {
            /* actually load mod once we're passed the file data */
            theFile = e.target.result; /* get the data string out of the blob object */
            var modFile = new ModFile(theFile);
            modPlayer = new ModPlayer(modFile, 44100);
            console.log(modFile);
            play();
            document.getElementById('status').innerText = '';
        };
    })(file);

    reader.readAsBinaryString(file);
    document.getElementById('status').innerText = '';
}

function loadRemote(path) {
    var fetch = new XMLHttpRequest();
    fetch.open('GET', path);
    fetch.overrideMimeType("text/plain; charset=x-user-defined");
    fetch.onreadystatechange = function() {
        if(this.readyState == 4 && this.status == 200) {
            /* munge response into a binary string */
            let t = this.responseText || "" ;
            let ff = [];
            let mx = t.length;
            let scc= String.fromCharCode;
            for (let z = 0; z < mx; z++) {
                ff[z] = scc(t.charCodeAt(z) & 255);
            }
            let binString = ff.join("");
            
            let modFile = new ModFile(binString);
            modPlayer = new ModPlayer(modFile, 44100);
        }
    }
    fetch.send();
}
