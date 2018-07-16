<template>
    <div>
        <div class="visualization">
            <div class="bar" v-for="(bar, index) in visualizerBars" :key="index" :style="{height: bar + '%'}">
            </div>

            <svg class="oscilloscope">
                <path v-bind:d="oscilloscopePath" stroke="white" stroke-width="1" fill="none" />
            </svg>
        </div>
    </div>
</template>

<script>
/* eslint-disable */
export default {
    name: "Visualizer",
    props: {
        visualizerBars: Uint8Array,
        oscilloscopePath: String
    }
}
</script>

<style lang="scss" scoped>
    .visualization {
        display: flex;
        flex-direction: row;
        align-items: flex-end;
        position: relative;
        width: 400px;
        height: 100px;
        border: 1px solid black;
        background-color: black;
    }

    .visualization .bar {
        background-color: rgb(0, 120, 220);
        width: 14px;
        border: 1px solid black;
        border-bottom: 0;
        height: 100%;
    }

    .visualization .oscilloscope {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
    }
</style>