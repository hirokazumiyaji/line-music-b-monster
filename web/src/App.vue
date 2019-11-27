<template>
<v-app>
  <v-app-bar app>
    <div class="d-flex align-center" style="margin: 0 auto;">
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
  </v-app-bar>
  <v-content>
    <div class="d-flex align-center flex-wrap">
      <v-col cols="6" sm="3" md="3" lg="2" v-for="(playlist, i) in playlists" :key="i">
        <v-card @click="onClickPlaylist(playlist.link)">
          <div style="display: flex; flex-wrap: wrap;">
            <div
              style="width: 50%;"
              v-for="(thumbnail, j) in playlist.thumbnails" :key="j"
            >
              <v-img v-show="thumbnail !== ''" :src="thumbnail"></v-img>
            </div>
          </div>
          <v-card-text style="font-weight: bold; font-size: 0.7rem;">
            {{ playlist.title }}
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
      playlists: []
    }
  },
  methods: {
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
