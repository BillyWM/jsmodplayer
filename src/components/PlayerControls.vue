<template>
        <div class="controls">

            <button v-on:click="$emit('play')">
                <icon name="play"></icon>
            </button>

            <button v-on:click="$emit('stop')">
                <icon name="stop"></icon>
            </button>

            <button v-on:click="$emit('pause')">
                <icon name="pause"></icon>
            </button>

            <label class="file-label">
                <input type="file" accept=".mod" v-on:change="$emit('loadLocal', $event)">
                <button class="file-button">
                    <icon name="file-import"></icon>
                </button>
            </label>

            <div class="status">
                <span v-if="player.playing">Playing</span>
                <span v-else-if="player.loading">Loading...</span>
                <span v-else-if="!player.loading && !player.playing">Stopped</span>
            </div>
        </div>
</template>

<script>
/*eslint-disable*/
import "vue-awesome/icons/play";
import "vue-awesome/icons/stop";
import "vue-awesome/icons/pause";
import "vue-awesome/icons/file-import";

import Icon from "vue-awesome/components/Icon";

export default {
    name: "PlayerControls",
    props: {
        player: Object
    },
    components: {
        Icon
    }
}
</script>

<style scoped lang="scss">
    input[type="file"] {
        display: none;
    }

    .file-button {
        pointer-events: none;
    }

    button, .file-button {
        border: none;
        outline: none;
    }
</style>