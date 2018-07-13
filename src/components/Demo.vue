<template>
    <div>

        <SongList :songs="songs" @loadRemote="loadRemote"></SongList>

        <PlayerControls :player="player" @loadLocal="loadLocal"></PlayerControls>


        <div class="visualizer">
            <div class="bar" v-for="(bar, index) in player.visualizerBars" :key="index" :style="{height: bar + '%'}">
            </div>

            <svg class="oscilloscope">
                <path v-bind:d="player.oscilloscopePath" stroke="white" stroke-width="1" fill="none" />
            </svg>
        </div>

        <div class="credits">
            <p>
                Original JSModPlayer © 2010 by <a href="http://twitter.com/gasmanic">Matt Westcott</a>
            </p>
            <p>
                This fork © 2011-2018 by <a href="http://billy.wenge-murphy.com/">William Wenge-Murphy</a>
            </p>

        </div>
    </div>
</template>

<script>
/* eslint-disable */
import ModPlayerInterface from "@/ModPlayerInterface.js";
import SongList from "./SongList.vue";
import PlayerControls from "./PlayerControls.vue";

let player = new ModPlayerInterface();

export default {
    name: "Demo",
    components: {
        SongList,
        PlayerControls
    },
    methods: {
        loadLocal: player.loadLocal,
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
    .visualizer {
        display: flex;
        flex-direction: row;
        align-items: flex-end;
        position: relative;
        width: 400px;
        height: 100px;
        border: 1px solid black;
        background-color: black;
    }

    .visualizer .bar {
        background-color: rgb(0, 120, 220);
        width: 14px;
        border: 1px solid black;
        border-bottom: 0;
        height: 100%;
    }

    .visualizer .oscilloscope {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
    }

</style>