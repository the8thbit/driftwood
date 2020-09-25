<template>
  <article class='submit-view'>
    <div class='status'>{{data.status}}</div>
    <SiteAdd
      :tags='[]'
      :address='""'
      :status='data.status'
      v-on:changeStatus='setStatus'
    />
  </article>
</template>

<script>
import SiteAdd from '@/components/SiteAdd.vue';

export default {
  name: 'SubmitView',
  components: {
    SiteAdd
  },
  props: {
    status: {
      type: String,
      default: () => 'Add a new site...'
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
  },
  methods: {
    setStatus(status) {
      this.data.status = status;
      this.$emit('changeStatus', this.data.status);
    }
  }
}
</script>
