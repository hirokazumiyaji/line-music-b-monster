<template>
<v-app>
  <app-bar @click-search="onClickSearch"></app-bar>
  <v-content>
    <v-container v-show="showSearch">
      <v-text-field
        v-model="text"
        prepend-inner-icon="mdi-magnify"
        outlined
        color="00C300"
        hide-details
      >
      </v-text-field>
    </v-container>
    <div class="d-flex align-center flex-wrap">
      <v-col cols="6" sm="3" md="3" lg="2" v-for="(item, i) in items" :key="i">
        <app-playlist-card :item="item"></app-playlist-card>
      </v-col>
    </div>
  </v-content>
</v-app>
</template>

<script>
export default {
  data() {
    return {
      showSearch: false,
      text: '',
      playlists: []
    }
  },
  computed: {
    items() {
      if (this.text === '') {
        return this.playlists
      }
      return this.playlists.filter(it => it.title.includes(this.text))
    }
  },
  methods: {
    onClickSearch() {
      this.showSearch = !this.showSearch
    }
  },
  async created() {
    try {
      const playlists = await fetch('/assets/json/playlists.json')
        .then(response => {
          return response.json()
        })
        .then(response => {
          return response.map(it => {
            const thumbnails = []
            for (let i = 0; i < 4; i++) {
              if (it.thumbnails.length > i) {
                thumbnails.push(it.thumbnails[i])
              } else {
                thumbnails.push('')
              }
            }
            return {
              title: it.title,
              url: it.url,
              link: it.link,
              thumbnails: thumbnails
            }
          })
        })

      playlists.sort((a, b) => {
        const titleA = a.title.toUpperCase()
        const titleB = b.title.toUpperCase()
        if (titleA < titleB) {
          return -1
        }
        if (titleA > titleB) {
          return 1
        }
        return 0
      })
      this.playlists = playlists
    } catch (e) {
      /* eslint no-console: 0 */
      console.error(e)
    }
  }
}
</script>
