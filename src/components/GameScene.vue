<template>
  <div host class="game">
  </div>
</template>
<script lang="ts">
/* eslint class-methods-use-this: ["error", { "exceptMethods": ["mounted"] }] */
import { Component, Prop, Vue } from 'vue-property-decorator';
import 'vue-class-component/hooks'; // import hooks type to enable auto-complete

import { Game } from '../game/app';

@Component
export default class GameScene extends Vue {
  @Prop() private msg = 'holy guacamoly';

  mounted() {
    const game = new Game();
    game.init();
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
[host] {
  position: absolute;
}
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
