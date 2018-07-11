<template>
    <ul>
        <li v-for="song in songs"
            :key="song.name"
            @click="$emit('loadRemote', song.filename)">

            <span class="song-name">{{ song.name }}</span> by <span class="song-author">{{ song.author }}</span>
        </li>
    </ul>
</template>

<script>
/*eslint-disable*/
export default {
    name: "SongList",
    props: {
        songs: Array
    }
}
</script>

<style lang="scss" scoped>
    li .song-name {
        font-weight: bold;
    }

    li .song-author {
        font-style: italic;
    }

</style>