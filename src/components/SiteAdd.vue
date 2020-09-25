<template>
    <article class='site-add'>
      <TagFieldEntry
        :tags='data.tags'
        :placeholder='data.tagsPlaceholder'
        v-on:changeTags='setTags'
        v-on:changeTokenfieldPlaceholder='setTokenfieldPlaceholder'
      />
      <input 
        class='site-add-input'
        type='text'
        :placeholder='"enter a URL"'
        v-model='data.address'
      />
      <button
        class='site-add-submit'
        type='button'
        v-on:click='submitSite'
      >submit</button>
    </article>
</template>


<script>
import TagFieldEntry from '@/components/TagFieldEntry.vue';

export default {
  name: 'SiteAdd',
  components: {
    TagFieldEntry
  },
  props: {
    tags: {
      type: Array,
      default: () => []
    },
    address: {
      type: String,
      default: () => ''
    },
    status: {
      type: String,
      default: () => ''
    },
  },
  data() {
    return {
      data: {
        tags: [],
        address: '',
        status: '',
        tagsPlaceholder: 'Enter at least 3 tags that describe the site...'
      }
    }
  },
  mounted() {
    this.setTags(this.tags);
    this.setAddress(this.address);
    this.setStatus(this.status);

    fetch(
      'https://.../getThreeRandomTags', {
      credentials: 'include',
      method: 'GET'
    }).then((response) => {
      return response.json();
    }).then((data) => {
      if (data.error) {
        this.setStatus(data.error);
      } else if (data.tags.length >= 3) {
        this.setTagsPlaceholder(
          `Enter at least 3 tags that describe the site, such as ${data.tags[0]}, ${data.tags[1]} or ${data.tags[2]}.`
        );
      }
    }).catch((error) => {
      console.log(error);
      this.setStatus('Communication error. Please try again later.');
    });
  },
  methods: {
    setTags(tags) {
      this.data.tags = tags;
      this.$emit('changeTags', this.data.tags);
    },
    setAddress(address) {
      this.data.address = address;
      this.$emit('changeAddress', this.data.address);
    },
    setStatus(status) {
      this.data.status = status;
      this.$emit('changeStatus', this.data.status);
    },
    setTagsPlaceholder(tagsPlaceholder) {
      this.data.tagsPlaceholder = tagsPlaceholder;
      this.$emit('changeTagsPlaceholder', this.data.tagsPlaceholder);
    },
    clearForm() {
      this.setAddress('');
      this.setTags([]);
    },
    async submitSite() {
      if (this.data.address === '') {
        this.setStatus('You must specify an address to submit a site.');
        return;
      }

      if (this.data.tags.length < 3) {
        this.setStatus('You must add at least 3 tags to submit a site.');
        return;
      }

      this.setStatus('processing...');

      fetch(
        'https://.../addSite', {
        credentials: 'include',
        headers: {
          'Content-Type': 'text/plain'
        },
        method: 'POST',
        body: JSON.stringify({
          address: this.data.address,
          tags: this.data.tags
        })
      }).then((response) => {
        return response.json();
      }).then((data) => {
        console.log(data);
        if (data.error) {
          this.setStatus(data.error);
        } else {
          this.setStatus(`${data.address} successfully added!`);
          this.clearForm();
        }
      }).catch((error) => {
        console.log(error);
        this.setStatus('Communication error. Please try again later.');
      });
    }
  }
}
</script>


<style lang="scss" scoped>
  @use '@/assets/styles/components/_SiteAdd.scss';
</style>
