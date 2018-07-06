<template>
    <div>
        <input type="file" accept=".mod" v-on:change="loadLocal">
    </div>
</template>

<script>

/* eslint-disable */
import ModPlayer from "@/ModPlayer.js";
import ModFile from "@/ModFile.js";
// import ModPlayerUI from "@/ModPlayerUI.js";

let player = new ModPlayer();
// let ui = new ModPlayerUI();


export default {
    name: "Demo",
    methods: {
        loadLocal: function(event) {
            player.loadLocalFile(event.target.files[0]);
        }
    }
}

</script>

<style scoped>

</style>