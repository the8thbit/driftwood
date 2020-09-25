<template>
  <div id="app">
    <div id="nav">
      <router-link to="/">Home</router-link> |
      <router-link to="/submit">Submit</router-link> |
      <router-link to="/about">About</router-link>
    </div>
    <h1>D R I F T W O O D</h1>
    <router-view />
  </div>
</template>

<script>

export default {
  name: 'App'
}
</script>