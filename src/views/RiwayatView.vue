<script lang="ts" setup>
import { ref, onMounted } from 'nativescript-vue';
import { LoadingIndicator, Mode } from '@nstudio/nativescript-loading-indicator';
import { SnackBar } from '@nstudio/nativescript-snackbar';
import { confirm } from '@nativescript/core/ui/dialogs';
import * as ls from '../shared/nik_toolkit';
import type { HistoryItem } from '../shared/nik_toolkit';
import RiwayatDetailView from './RiwayatDetailView.vue';

const indicator = new LoadingIndicator();
const snackbar = new SnackBar();

const items = ref<HistoryItem[]>([]);
const isFound = ref(false);
const isNotFound = ref(true);
const showDetail = ref(false);
const selectedItem = ref<HistoryItem | null>(null);

function showLoading(msg = 'Sedang memuat...') {
  indicator.show({
    message: msg,
    margin: 10,
    dimBackground: true,
    color: '#FFFFFF',
    backgroundColor: '#FFFFFF',
    userInteractionEnabled: true,
    hideBezel: true,
    mode: Mode.Indeterminate,
    android: { cancelable: false },
  });
}

function loadData() {
  const db = ls.historyGet();
  items.value = [];

  if (db.success && Array.isArray(db.data) && db.data.length > 0) {
    isFound.value = true;
    isNotFound.value = false;

    for (const item of db.data) {
      if (item.lahir) {
        items.value.push({
          ...item,
          isValid: true,
          status: 'VALID',
          statusColor: '#4CAF50',
        });
      } else {
        items.value.push({
          ...item,
          isValid: false,
          status: 'TIDAK VALID',
          statusColor: '#f44336',
        });
      }
    }
  } else {
    isFound.value = false;
    isNotFound.value = true;
  }
}

function refresh() {
  showLoading();
  setTimeout(() => {
    loadData();
    indicator.hide();
  }, 600);
}

async function clearAll() {
  const result = await confirm({
    title: 'Bersihkan data riwayat',
    message: 'Apa kamu yakin ingin melakukan ini?',
    okButtonText: 'Ya',
    neutralButtonText: 'Tidak',
  });

  if (result) {
    showLoading('Sedang membersihkan...');
    ls.historyDrop();
    setTimeout(() => {
      loadData();
      indicator.hide();
      snackbar.action({
        actionText: 'OKE',
        actionTextColor: '#FFEB3B',
        snackText: 'Data riwayat berhasil dibersihkan :)',
        textColor: '#FFFFFF',
        hideDelay: 4000,
        backgroundColor: '#333',
      });
    }, 800);
  }
}

function onItemTap(item: HistoryItem) {
  selectedItem.value = item;
  showDetail.value = true;
}

function closeDetail() {
  showDetail.value = false;
  selectedItem.value = null;
}

onMounted(() => {
  showLoading();
  setTimeout(() => {
    loadData();
    indicator.hide();
  }, 400);
});
</script>

<template>
  <Page>
    <ActionBar title="Riwayat">
      <ActionItem text="Segarkan" @tap="refresh" android.position="popup" />
      <ActionItem text="Bersihkan data" @tap="clearAll" android.position="popup" />
    </ActionBar>

    <!-- List -->
    <GridLayout v-if="!showDetail" rows="*" height="100%">
      <ListView
        v-show="isFound"
        :items="items"
        separatorColor="#9E9E9E"
        class="list-group"
        @itemTap="(args: any) => onItemTap(args.item)"
      >
        <template #default="{ item }">
          <GridLayout class="list-group-item" columns="*,auto" rows="auto,auto,auto" padding="12">
            <Label
              :text="'KTP ' + item.status"
              fontSize="10"
              marginTop="5"
              :color="item.statusColor"
              fontWeight="bold"
              row="0"
              col="1"
            />
            <Label :text="item.fullname" fontSize="13" class="title" col="0" row="0" />
            <Label :text="item.nik" fontStyle="italic" color="#9E9E9E" col="0" row="1" />
            <Label
              :text="'Dicek pada ' + item.datechecker"
              color="#BDBDBD"
              col="0"
              row="2"
            />
          </GridLayout>
        </template>
      </ListView>

      <StackLayout v-show="isNotFound" verticalAlignment="center" horizontalAlignment="center">
        <Label class="fas" text="&#xf1da;" fontSize="72" color="#9E9E9E" />
        <Label text="Data Riwayat Kosong!" color="#9E9E9E" marginTop="10" />
      </StackLayout>
    </GridLayout>

    <!-- Detail -->
    <RiwayatDetailView
      v-if="showDetail && selectedItem"
      :item="selectedItem"
      @back="closeDetail"
    />
  </Page>
</template>

<style scoped>
.fas {
  font-family: 'Font Awesome 5 Free', 'fa-solid-900';
  font-weight: 900;
}
.list-group-item {
  padding: 10 12;
}
</style>
