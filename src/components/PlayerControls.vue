<template>
        <div>
            <input type="file" accept=".mod" v-on:change="$emit('loadLocal', $event)">
            <div class="status">
                <span v-if="player.playing">Playing</span>
                <span v-else-if="player.loading">Loading...</span>
                <span v-else-if="!player.loading && !player.playing">Stopped</span>
            </div>
        </div>
</template>

<script>
export default {
    name: "PlayerControls",
    props: {
        player: Object
    }
}
</script>

<style scoped lang="scss">
</style>