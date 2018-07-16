<template>
    <div class="pattern-view-component">
        <div class="pattern-list">
        </div>
    </div>
</template>

<script>
/* eslint-disable */
export default {
    name: "PatternView",
    props: {
        patternRows: Array
    }
}
</script>

<style scoped lang="scss">
    .pattern-view-component {
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .pattern-list {
        font-family: monospace;
        width: 400px;
        height: 80%;
        background-color: black;
    }
</style>