<template>
    <article class='tag-field-entry'>
      <input class='tag-field-entry-input' type='text' />
    </article>
</template>


<script>
import Tokenfield from 'tokenfield';
export default {
  name: 'TagFieldEntry',
  props: {
    tags: {
      type: Array,
      default: () => []
    },
    placeholder: {
      type: String,
      default: () => ''
    }
  },
  data() {
    return {
      data: {
        tags: [],
        tokenfield: null
      }
    }
  },
  watch: {
    tags(tags) {
      this.setTokenfieldTags(tags);
    },
    placeholder(placeholder) {
      this.setTokenfieldPlaceholder(placeholder);
    }
  },
  mounted() {
    this.data.tokenfield = new Tokenfield({
      el: this.$el.querySelector('.tag-field-entry-input'),
      placeholder: this.placeholder
    });
    this.setTokenfieldTags(this.tags);

    this.data.tokenfield.addItems(
      this.data.tags.map((tag, id) => {
        return {
          id: id,
          name: tag
        }
      })
    );

    this.data.tokenfield.on('change', () => {
      this.setTags(
        this.data.tokenfield.getItems().map((tag) => tag.name),
      );
    });
  },
  methods: {
    setTags(tags) {
      this.data.tags = tags;
      this.$emit('changeTags', this.data.tags);
    },
    setTokenfieldTags(tags) {
      this.data.tokenfield.setItems(
        tags.map((tag, id) => {
          return {
            id: id,
            name: tag
          }
        })
      );
      this.$emit('changeTokenfieldTags', tags);
      this.setTags(tags);
    },
    setTokenfieldPlaceholder(placeholder) {
      this.$el.querySelector('.tokenfield-input').placeholder = placeholder;
      this.$emit('changeTokenfieldPlaceholder', placeholder);
    }
  }
}
</script>


<style lang="scss" scoped>
  @use '@/assets/styles/components/_TagFieldEntry.scss';
</style>