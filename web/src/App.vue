<template>
<v-app>
  <v-app-bar app>
    <div class="d-flex align-center justify-space-between" style="width: 100%;">
      <div style="flex-basis: 10%;"></div>
      <div class="d-flex align-center">
        <v-img
          alt="LINE MUSIC Logo"
          class="shrink mr-2"
          contain
          src="/assets/images/line-music.jpg"
          transition="scale-transition"
          height="56"
          width="100"
        />
        <v-icon style="color: #000000; font-weight: bold;">mdi-close</v-icon>
        <v-img
          alt="b-monster Logo"
          class="shrink ml-2"
          contain
          src="/assets/images/b-monster.png"
          height="56"
          width="112"
        />
      </div>
      <div style="flex-basis: 10%; text-align: right;">
        <v-icon style="color: #000000; font-weight: bold;" @click="onClickSearch">
          mdi-magnify
        </v-icon>
      </div>
    </div>
  </v-app-bar>
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
    },
    onClickPlaylist(url) {
      window.open(url)
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
