<template>
    <input v-on:click="drift" class="drift-button" type="button" value="D R I F T . . ." />
</template>


<script>
export default {
  name: 'SiteDrift',
  props: {},
  mounted() {},
  methods: {
    async drift() {
      fetch(
        `https://.../getRandomSite`, {
        credentials: 'include',
        method: 'GET'
      }).then((response) => {
        return response.json();
      }).then((data) => {
        console.log(data);
        window.open(data.address, '_blank', 'noopener');
      }).catch((error) => {
        console.log(error);
      });
    }
  }
}
</script>
