<template>
        <div class="player-controls">

            <button class="control" @click="$emit('playPrevious')">
                <icon name="fast-backward"></icon>
            </button>

            <button v-on:click="$emit('stop')" title="stop" :class="[{active: status.stopped}, 'control']">
                <icon name="stop"></icon>
            </button>

            <button v-on:click="$emit('play')" title="play" :class="[{active: status.playing}, 'control']">
                <icon name="play"></icon>
            </button>

            <button v-on:click="$emit('pause')" title="pause" :class="[{active: status.paused}, 'control']">
                <icon name="pause"></icon>
            </button>

            <button class="control" @click="$emit('playNext')">
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

            <button @click="$emit('toggleMute')" :class="[{active: status.muted}, 'mute-button', 'control']">
                <icon>
                    <icon name="volume-up" class="volume"></icon>
                    <icon name="ban" class="ban"></icon>
                </icon>
            </button>

        </div>
</template>

<script>
/*eslint-disable*/
import Icon from "@/icons.js";

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
    $active-control-color: white;

    .player-controls {

        display: grid;
        grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr;
        // align-items: flex-start;
        // justify-content: center;

        .control {
            display: block;
            height: 32px;
            flex-grow: 1;
            background-color: transparent;

            &.active {
                color: $active-control-color;
            }
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