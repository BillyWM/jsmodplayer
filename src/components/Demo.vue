<template>
    <div>
        <input type="file" accept=".mod" v-on:change="loadLocal">
        <ul>
            <li v-for="mod in mods" :key="mod.name" v-on:click="loadRemote('static/mods/' + mod.filename)">
                {{ mod.name }} by {{ mod.author }}
            </li>
        </ul>
    </div>
</template>

<script>

/* eslint-disable */
import ModPlayer from "@/ModPlayer.js";
import ModFile from "@/ModFile.js";

let player = new ModPlayer();


export default {
    name: "Demo",
    methods: {
        loadLocal: function(event) {
            player.loadLocalFile(event.target.files[0]);
            player.play();
        },
        loadRemote: function(filename) {
            player.loadRemoteFile(filename);
            player.play();
        }
    },
    data: function() {
        return {
            mods: [
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

<style scoped>

</style>