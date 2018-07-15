<template>
    <div class="main">
        <SongList
            class="song-list"
            :songs="songs"
            @loadRemote="loadRemote">
        </SongList>

        <PlayerControls
            class="controls"
            :player="player"
            @loadLocal="loadLocal"
            @play="play"
            @stop="stop"
            @pause="pause">
        </PlayerControls>

        <PatternView
            class="patterns">
        </PatternView>

        <Visualizer
            class="visualizer"
            :player="player">
        </Visualizer>

        <SampleList
            class="samples"
            :player="player">
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
    methods: {
        loadLocal: player.loadLocal,
        play: () => player.play(),
        stop: () => player.stop(),
        pause: () => player.pause(),
        loadRemote: (filename) => player.loadRemote(`static/mods/${filename}`)
    },
    data: function() {
        return {

            // Exposes file-loading methods and player status like loading, playing, etc.
            player: player,

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
        grid-template-rows: 100px 400px 200px 75px;
        grid-template-areas:
            "songlist controls   samples"
            "songlist patterns   samples"
            "songlist visualizer samples"
            "footer   footer     footer";
        justify-content: center;
        height: 80vh;
    }

    .song-list {
        grid-area: songlist;
    }

    .patterns {
        grid-area: patterns;
    }

    .controls {
        grid-area: controls;
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
    }
</style>