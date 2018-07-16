<template>
    <div>
        <h3>Samples</h3>
        <ul>
            <li v-for="(sample, index) in samples" :key="index">
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
        samples: Array
    },
    methods: {
        // Convert to n-digit hexadecimal
        hex: (value, n=2) => {
            return (value).toString(16).toUpperCase().padStart(n, "0");
        }
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