<script lang="ts" setup>
import { ref } from 'nativescript-vue';
import PengecekanView from './views/PengecekanView.vue';
import RiwayatView from './views/RiwayatView.vue';
import InformasiView from './views/InformasiView.vue';

const selectedIndex = ref(0);

function onTabChange(args: any) {
  // optional
}
</script>

<template>
  <Frame>
    <Page actionBarHidden="true" background="#17b4ff">
      <BottomNavigation :selectedIndex="selectedIndex" @selectedIndexChange="onTabChange">
        <TabStrip>
          <TabStripItem>
            <Label text="Pengecekan" />
            <Image src="font://&#xf002;" class="fas t-36" />
          </TabStripItem>
          <TabStripItem>
            <Label text="Riwayat" />
            <Image src="font://&#xf1da;" class="fas t-36" />
          </TabStripItem>
          <TabStripItem>
            <Label text="Informasi" />
            <Image src="font://&#xf059;" class="far t-36" />
          </TabStripItem>
        </TabStrip>

        <TabContentItem>
          <PengecekanView />
        </TabContentItem>
        <TabContentItem>
          <RiwayatView />
        </TabContentItem>
        <TabContentItem>
          <InformasiView />
        </TabContentItem>
      </BottomNavigation>
    </Page>
  </Frame>
</template>

<style>
.fas {
  font-family: 'Font Awesome 5 Free', 'fa-solid-900';
  font-weight: 900;
}
.far {
  font-family: 'Font Awesome 5 Free', 'fa-regular-400';
  font-weight: 400;
}
</style>
