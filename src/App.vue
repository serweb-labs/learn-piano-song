<template>
  <div id="app">
    <div id="nav">
      <router-link to="/">Game</router-link> |
      <router-link to="/songs">Songs</router-link>  |
      <router-link to="/about">About</router-link>
    </div>
    <router-view/>
  </div>
</template>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: white;
  background: black;
}

#nav {
  padding: 10px;
  a {
    font-weight: bold;
    color: white;

    &.router-link-exact-active {
      color: #a4d3e9;
    }
  }
}
</style>
