<template>
    <div>
        <!-- Old demo page: TODO this will be reworked completely as a Vue app -->
            <h1>JSModPlayer</h1>
            <h2>The imaginatively named Javascript .mod player by Gasman</h2>
            <p>This is a work in progress - not all effects are implemented yet.</p>
            <ul>
                <li><a href="javascript:loadRemote('mods/ambpower.mod')">Ambient Power (Vogue / Triton)</a></li>
                <li><a href="javascript:loadRemote('mods/dope.mod')">Dope / Onward Ride (Jugi / Complex)</a></li>
                <li><a href="javascript:loadRemote('mods/frust.mod')">Mental Frustration (Nugget / Rebels)</a></li>
                <li><a href="javascript:loadRemote('mods/mindkick.mod')">Mindkick (Mindfuck / Mentasm)</a></li>
                <li><a href="javascript:loadRemote('mods/sundance.mod')">Sundance (Purple Motion / Future Crew)</a></li>
                <!-- These are benchmark modules. Not for public consumption....yet :) -->
                <!--<li><a href="javascript:loadRemote('mods/ode_to_protracker.mod')">Ode to Protracker (Asle / Sylvain Chipaux)</a></li>-->
                <li><a href="javascript:loadRemote('mods/RandomVoice-Monday.mod')">Monday (Edvin Fladen a.k.a "Random Voice")</a></li>
                <li>From harddrive: <input type="file" id="input" multiple="true" onchange="loadLocal(this.files[0])"></li>
            </ul>
            <div id="status">Not started</div>
            <h3>Credits</h3>
            <p>Original by Gasman.
                <a href="http://twitter.com/westdotcodottt">@westdotcodottt</a> -
                <a href="http://matt.west.co.tt/">matt.west.co.tt</a> -
                <a href="mailto:gasman@raww.org">gasman@raww.org</a> - 22 May 2010
            </p>
            <p>Forked and improved by
                <a href="http://billy.wenge-murphy.com/">Billy Wenge-Murphy</a> -
                <a href="http://twitter.com/billywm">@BillyWM</a> -
                <a href="mailto:iamthebilly@gmail.com">iamthebilly@gmail.com</a> - April 2011.<br>
                Added local file loading (HTML5 File API), implemented more effects, fixes to playback
            </p>
            <p>Source code on Github:
                <a href="http://github.com/gasman/jsmodplayer">Gasman</a> (original)
                <a href="https://github.com/BillyWM/jsmodplayer">BillyWM</a> (fork)
            </p>
    </div>
</template>

<script>
/* eslint-disable */
export default {
    name: "OldDemo"
}
</script>