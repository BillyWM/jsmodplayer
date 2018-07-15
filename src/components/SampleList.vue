<template>
    <div>
        <h3>Samples</h3>
        <ul>
            <li v-for="(sample, index) in player.sampleNames" :key="index">
                <span class="sample-number">{{ hex(index) }}</span>
                <span class="sample-name">{{ sample }}</span>
            </li>
        </ul>
    </div>
</template>

<script>
/* eslint-disable */
export default {
    name: "SampleList",
    props: {
        player: Object
    },
    methods: {
        hex: (num) => (num).toString(16).toUpperCase().padStart(2, "0")
    }
}
</script>

<style scoped lang="scss">
    .sample-number {
        font-weight: bold;
    }

    .sample-name {
        padding-left: 0.25em;
    }

    h3 {
        width: 100%;
        font-size: small;
        text-align: center;
    }
    ul {
        list-style: none;
        padding-left: 10px;
    }

    li {
        text-align: left;
        overflow: hidden;
        white-space: nowrap;
        font-family: monospace;
    }
</style>