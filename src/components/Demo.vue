<template>
    <div class="main">
        <PlayerControls
            class="controls"
            :status="status"
            @loadLocal="loadLocal"
            @play="play"
            @stop="stop"
            @pause="pause"
            @playRandom="playRandom"
            @playPrevious="playPrevious"
            @playNext="playNext"
            @toggleMute="toggleMute">
        </PlayerControls>

        <SongList
            class="song-list"
            :songs="songs"
            :activeSong="activeSong"
            @loadRemote="loadRemote">
        </SongList>

        <PatternView
            class="patterns">
        </PatternView>

        <Visualizer
            class="visualizer"
            :visualizerBars="visualizerBars" :oscilloscopePath="oscilloscopePath">
        </Visualizer>

        <SampleList
            class="samples"
            :samples="samples">
        </SampleList>

        <footer class="credits">
            <p>
                Original JSModPlayer © 2010 by <a href="http://twitter.com/gasmanic">Matt Westcott</a>
            </p>
            <p>
                This fork © 2011-2018 by <a href="http://billy.wenge-murphy.com/">William Wenge-Murphy</a>
            </p>
        </footer>
    </div>
</template>

<script>
/* eslint-disable */
import ModPlayerInterface from "@/ModPlayerInterface.js";
import SongList from "./SongList.vue";
import PlayerControls from "./PlayerControls.vue";
import Visualizer from "./Visualizer.vue";
import PatternView from "./PatternView.vue"
import SampleList from "./SampleList.vue";

let player = new ModPlayerInterface();

export default {
    name: "Demo",
    components: {
        SongList,
        PlayerControls,
        Visualizer,
        PatternView,
        SampleList
    },
    computed: {
        samples: () => player.sampleNames,
        visualizerBars: () => player.visualizerBars,
        oscilloscopePath: () => player.oscilloscopePath,
        stopped: () => !player.playing && !player.paused,
        status: function() {
            return {
                playing: player.playing,
                loading: player.loading,
                muted: player.muted,
                paused: player.paused,
                stopped: this.stopped
            }
        }
    },
    methods: {
        play: () => player.play(),
        stop: () => player.stop(),
        pause: () => player.pause(),
        toggleMute: () => player.toggleMute(),
        playRandom: function() {
            let randomID = Math.floor(Math.random() * (this.songs.length));

            this.playByIndex(randomID);
        },
        playPrevious: function() {
            let choice = this.activeSong || 0;
            choice = Math.max(0, choice - 1);

            this.playByIndex(choice);
        },
        playNext: function() {
            let choice = this.activeSong || 0;
            choice = Math.min(this.songs.length - 1, choice + 1);

            this.playByIndex(choice);
        },
        playByIndex: function(index) {
            this.activeSong = index;
            this.loadRemote(this.songs[index].filename)
                .then(this.play);
        },
        shuffle: function() {

        },
        loadLocal: function(event) {
            this.activeSong = null;
            return player.loadLocal(event.target.files[0]);
        },
        loadRemote: function(filename) {
            let index = this.songs.findIndex(x => x.filename === filename);
            if (index !== -1) this.activeSong = index;

            return player.loadRemote(`static/mods/${filename}`);
        }
    },
    data: function() {
        return {

            // Exposes file-loading methods and player status like loading, playing, etc,
            //      but isolates the core player (ModPlayer.js) so that each and every property
            //      doesn't become reactive.
            player: player,
            activeSong: null,
            paused: false,
            shuffled: [],
            songs: [
                {
                    filename: "RandomVoice-Monday.mod",
                    name: "Monday",
                    author: `Edvin Fladen a.k.a "Random Voice"`
                },
                {
                    filename: "dope.mod",
                    name: "Dope / Onward Ride",
                    author: "Jugi / Complex"
                },
                {
                    filename: "ambpower.mod",
                    name: "Ambient Power",
                    author: "Vogue / Triton"
                },
                {
                    filename: "frust.mod",
                    name: "Mental Frustration",
                    author: "Nugget / Rebels"
                },
                {
                    filename: "mindkick.mod",
                    name: "Mindkick",
                    author: "Mindfuck / Mentasm"
                },
                {
                    filename: "sundance.mod",
                    name: "Sundance",
                    author: "Purple Motion / Future Crew"
                }
            ]
        }
    }
}

</script>

<style lang="scss" scoped>

    .main {
        display: grid;
        grid-template-columns: 250px 500px 250px;
        grid-template-rows: 40px 400px 200px 75px;
        grid-template-areas:
            "controls ........   samples"
            "songlist patterns   samples"
            "songlist visualizer samples"
            "footer   footer     footer";
        justify-content: center;
        height: 80vh;

        background: none;
    }

    .song-list {
        grid-area: songlist;
        padding-left: 5px;
    }

    .patterns {
        grid-area: patterns;
    }

    .controls {
        grid-area: controls;
        align-self: end;
    }

    .visualizer {
        grid-area: visualizer;
        justify-self: center;
        align-self: center;
    }

    .samples {
        grid-area: samples;
    }

    footer {
        grid-area: footer;
        align-self: end;
        font-family: monospace;
    }
</style>