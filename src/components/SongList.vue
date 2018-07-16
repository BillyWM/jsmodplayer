<template>
    <div class="song-list-component">
        <input type="search" class="filter-box" placeholder="Filter songs">

        <ul class="song-list">
            <li v-for="(song, index) in songs"
                :class="{active: activeSong === index}"
                :key="song.name"
                @click="$emit('loadRemote', song.filename, index)">

                <span class="song-name">{{ song.name }}</span>
                <span class="by">by</span>
                <span class="song-author">{{ song.author }}</span>
            </li>
        </ul>
    </div>
</template>

<script>
/*eslint-disable*/
export default {
    name: "SongList",
    props: {
        songs: Array,
        activeSong: Number
    }
}
</script>

<style lang="scss" scoped>
    .song-list-component {
        background-color: transparent;
    }

    .filter-box {
        width: 100%;
        text-align: center;
        border: none;
        outline: none;
        background-color: transparent;
        margin: 0;
    }

    .active {
        background-color: rgba(255, 255, 255, 0.5);
    }

    ul {
        list-style: none;
        text-align: left;
        font-family: monospace;
        padding-left: 0;
        margin: 0;
        max-width: 240px;
    }
    li .song-name {
        font-weight: bold;
    }

    li .song-author {
        font-style: italic;
        font-size: x-small;
    }

    .by {
        display: none;
    }

</style>