<template>
    <div>
        <input type="search" class="filter-box" placeholder="Filter songs">

        <ul class="song-list">
            <li v-for="song in songs"
                :key="song.name"
                @click="$emit('loadRemote', song.filename)">

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
        songs: Array
    }
}
</script>

<style lang="scss" scoped>
    .filter-box {
        width: 100%;
        text-align: center;
        border: none;
        outline: none;
    }

    ul {
        list-style: none;
        text-align: left;
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