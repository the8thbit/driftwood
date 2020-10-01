<template>
  <article class='home-view'>
    <span class='status'>{{data.status}}</span>
    <SiteDrift />
  </article>
</template>

<script>
import SiteDrift from '@/components/SiteDrift.vue';

export default {
  name: 'HomeView',
  components: {
    SiteDrift
  },
  props: {
    status: {
      type: String,
      default: () => 'Drift to a random site...'
    }
  },
  data() {
    return {
      data: {
        status: ''
      }
    }
  },
  mounted() {
    this.setStatus(this.status);

    fetch(`${this.$ENV.string('VUE_APP_API_URL')}/`, {
      method: 'GET'
    }).then((response) => {
      return response.json();
    }).then((data) => {
      console.log(data);
      this.data.status = data;
    }).catch((error) => {
      console.log(error);
    });
  },
  methods: {
    setStatus(status) {
      this.data.status = status;
      this.$emit('changeStatus', this.data.status);
    }
  }
}
</script>
