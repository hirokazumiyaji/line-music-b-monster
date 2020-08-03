<template>
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
        <v-icon style="color: #000000; font-weight: bold;" @click="$emit('click-search')">
          mdi-magnify
        </v-icon>
      </div>
    </div>
  </v-app-bar>
</template>
