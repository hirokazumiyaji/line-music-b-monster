<template>
  <v-card @click="onClickPlaylist(item.link)">
    <div style="display: flex; flex-wrap: wrap;">
      <div
        style="width: 50%;"
        v-for="(thumbnail, j) in item.thumbnails" :key="j"
      >
        <v-img v-show="thumbnail !== ''" :src="thumbnail"></v-img>
      </div>
    </div>
    <v-card-text style="font-weight: bold; font-size: 0.7rem;">
      {{ item.title }}
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  props: ['item'],
  methods: {
    onClickPlaylist(url) {
      window.open(url)
    }
  }
}
</script>
