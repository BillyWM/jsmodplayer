<template>
        <div class="player-controls">

            <button class="control">
                <icon name="fast-backward"></icon>
            </button>

            <button v-on:click="$emit('stop')" title="stop" class="control">
                <icon name="stop"></icon>
            </button>

            <button v-on:click="$emit('play')" title="play" class="control">
                <icon name="play"></icon>
            </button>

            <button v-on:click="$emit('pause')" title="pause" class="control">
                <icon name="pause"></icon>
            </button>

            <button class="control">
                <icon name="fast-forward"></icon>
            </button>

            <label title="load file" class="control file-label">
                <input type="file" accept=".mod" v-on:change="$emit('loadLocal', $event)">
                <button class="file-button">
                    <icon name="file-import"></icon>
                </button>
            </label>

            <button @click="$emit('playRandom')" class="control" >
                <icon name="dice"></icon>
            </button>

            <button @click="$emit('toggleMute')" :class="[{muted: status.muted}, 'mute-button', 'control']">
                <icon>
                    <icon name="volume-up" class="volume"></icon>
                    <icon name="ban" class="ban"></icon>
                </icon>
            </button>

            <!-- <div class="status">
                <span v-if="player.playing">Playing</span>
                <span v-else-if="player.loading">Loading...</span>
                <span v-else-if="!player.loading && !player.playing">Stopped</span>
            </div> -->
        </div>
</template>

<script>
/*eslint-disable*/
import "vue-awesome/icons/play";
import "vue-awesome/icons/stop";
import "vue-awesome/icons/pause";
import "vue-awesome/icons/file-import";
import "vue-awesome/icons/volume-up";
import "vue-awesome/icons/ban";
import "vue-awesome/icons/fast-forward";
import "vue-awesome/icons/fast-backward";
import "vue-awesome/icons/dice";

import Icon from "vue-awesome/components/Icon";

export default {
    name: "PlayerControls",
    props: {
        status: Object
    },
    components: {
        Icon
    }
}
</script>

<style scoped lang="scss">
    .player-controls {

        display: grid;
        grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr;
        // align-items: flex-start;
        // justify-content: center;

        .control {
            display: block;
            height: 32px;
            flex-grow: 1;
            background-color: lightgrey;
        }
    }

    .mute-button {
        .ban {
            visibility: hidden;
        }

        &.muted .ban {
            visibility: visible;
        }
        
        &.muted .volume {
            opacity: 0.5;
        }
    }

    input[type="file"] {
        display: none;
    }

    .file-button {
        pointer-events: none;
        width: 100%;
        height: 100%;
        background-color: transparent;
    }

    button {
        border: transparent;
        outline: none;
        margin: 0;
    }
</style>