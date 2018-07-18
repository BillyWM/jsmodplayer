/* eslint-disable */
/**
 * Unfortunately, vue-awesome just calls Icon.register with each individual icon include.
 * 
 * Here we run all includes for the desired icons and then re-export so they're available in the importing scope.
 */

import Icon from "vue-awesome/components/Icon";
import "vue-awesome/icons/play";
import "vue-awesome/icons/stop";
import "vue-awesome/icons/pause";
import "vue-awesome/icons/file-import";
import "vue-awesome/icons/volume-up";
import "vue-awesome/icons/ban";
import "vue-awesome/icons/fast-forward";
import "vue-awesome/icons/fast-backward";
import "vue-awesome/icons/dice";

export default Icon;