<template>
    <div>

        <SongList :songs="songs" @loadRemote="loadRemote"></SongList>

        <PlayerControls :player="player" @loadLocal="loadLocal"></PlayerControls>

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
</style>