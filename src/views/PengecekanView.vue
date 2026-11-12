<script lang="ts" setup>
import { ref, reactive } from 'nativescript-vue';
import { connectivity } from '@nativescript/core';
import { LoadingIndicator, Mode } from '@nstudio/nativescript-loading-indicator';
import { SnackBar } from '@nstudio/nativescript-snackbar';
import * as ls from '../shared/nik_toolkit';
import { validateNikHybrid, type ApiValidationResult } from '../shared/nik_toolkit';
import type { NikParseData } from '../shared/nik_toolkit';

type CheckResult = {
  isValid: boolean;
  status: string;
  statusColor: string;
  nik: string;
  fullname: string;
  datechecker: string;
  kelamin?: string;
  lahir?: string;
  provinsi?: string;
  kotakab?: string;
  kecamatan?: string;
  uniqcode?: string;
  kodepos?: string;
  pasaran?: string;
  usia?: string;
  ultah?: string;
  zodiak?: string;
  sourceLabel?: string;
  registryVerified?: boolean;
  onlineMessage?: string;
};

const indicator = new LoadingIndicator();
const snackbar = new SnackBar();

const isSearchForm = ref(true);
const isResult = ref(false);
const connected = ref(true);
const connectedText = ref('');
const isParsing = ref(false);
const useOnline = ref(true); // toggle structural online enrichment

const form = reactive({
  fullname: '',
  nik: '',
});

const result = reactive<CheckResult & {
  sourceLabel?: string;
  registryVerified?: boolean;
  onlineMessage?: string;
}>({
  isValid: false,
  status: '',
  statusColor: '',
  nik: '',
  fullname: '',
  datechecker: '',
});

function showLoading(msg = 'Sedang memproses...') {
  indicator.show({
    message: msg,
    margin: 10,
    dimBackground: true,
    color: '#FFFFFF',
    backgroundColor: '#FFFFFF',
    userInteractionEnabled: false,
    hideBezel: true,
    mode: Mode.Indeterminate,
    android: { cancelable: false },
  });
}

function checkConnection(notify = false) {
  const type = connectivity.getConnectionType();
  let message = '';
  let isConnected = false;

  switch (type) {
    case connectivity.connectionType.none:
      message = 'Offline — validasi lokal saja';
      isConnected = false;
      break;
    case connectivity.connectionType.wifi:
      message = 'Online (WIFI)';
      isConnected = true;
      break;
    case connectivity.connectionType.mobile:
      message = 'Online (Mobile Data)';
      isConnected = true;
      break;
    default:
      message = 'Offline — validasi lokal saja';
      isConnected = false;
  }

  connected.value = isConnected;
  connectedText.value = message;
  indicator.hide();

  if (notify) {
    snackbar.action({
      actionText: 'OKE',
      actionTextColor: '#FFEB3B',
      snackText: message,
      textColor: '#FFFFFF',
      hideDelay: 3500,
      backgroundColor: '#333',
    });
  }
}

function sourceLabel(r: ApiValidationResult): string {
  if (r.registryVerified) return 'Registry verified (eKYC provider)';
  if (r.source === 'nusakit' && r.online?.ok) return 'Struktural online (Nusakit)';
  if (r.source === 'local') return 'Struktural lokal (offline)';
  return `Struktural (${r.source})`;
}

async function cekNoktp() {
  if (isParsing.value) return;

  if (!form.fullname.trim() || !form.nik.trim()) {
    snackbar.action({
      actionText: 'OKE',
      actionTextColor: '#FFEB3B',
      snackText: 'Nama Lengkap & No. KTP tidak boleh kosong!',
      textColor: '#FFFFFF',
      hideDelay: 4000,
      backgroundColor: '#333',
    });
    return;
  }

  const nikClean = form.nik.trim();
  if (!/^\d{16}$/.test(nikClean)) {
    snackbar.action({
      actionText: 'OKE',
      actionTextColor: '#FFEB3B',
      snackText: 'NIK harus 16 digit angka',
      textColor: '#FFFFFF',
      hideDelay: 4000,
      backgroundColor: '#333',
    });
    return;
  }

  isParsing.value = true;
  showLoading(useOnline.value && connected.value ? 'Validasi online...' : 'Validasi lokal...');

  try {
    const apiResult = await validateNikHybrid(nikClean, {
      useOnlineStructural: useOnline.value && connected.value,
      // Commercial Dukcapil check: enable only when user configures credentials
      // commercial: {
      //   enabled: true,
      //   name: form.fullname.trim(),
      //   dateOfBirth: '1990-01-01',
      //   apiBaseUrl: 'https://your-provider.example/verify',
      //   apiKey: 'YOUR_KEY',
      // },
    });

    const s = apiResult.structural;

    if (s.status === 'success' && s.data) {
      const d = s.data;
      Object.assign(result, {
        isValid: true,
        status: apiResult.registryVerified ? 'VERIFIED (REGISTRY)' : 'VALID (STRUKTURAL)',
        statusColor: apiResult.registryVerified ? '#1565C0' : '#4CAF50',
        nik: nikClean,
        fullname: form.fullname.trim(),
        datechecker: ls.getCurrentTime(),
        kelamin: d.kelamin,
        lahir: d.lahir,
        provinsi: d.provinsi,
        kotakab: d.kotakab,
        kecamatan: d.kecamatan,
        uniqcode: d.uniqcode,
        kodepos: d.tambahan.kodepos,
        pasaran: d.tambahan.pasaran,
        usia: d.tambahan.usia,
        ultah: d.tambahan.ultah,
        zodiak: d.tambahan.zodiak,
        sourceLabel: sourceLabel(apiResult),
        registryVerified: !!apiResult.registryVerified,
        onlineMessage: apiResult.online?.message || '',
      });

      ls.historyInsert({
        ...d,
        fullname: form.fullname.trim(),
        datechecker: ls.getCurrentTime(),
        source: apiResult.source,
        registryVerified: apiResult.registryVerified,
      });
    } else {
      Object.assign(result, {
        isValid: false,
        status: 'TIDAK VALID',
        statusColor: '#f44336',
        nik: nikClean,
        fullname: form.fullname.trim(),
        datechecker: ls.getCurrentTime(),
        sourceLabel: sourceLabel(apiResult),
        registryVerified: false,
        onlineMessage: apiResult.online?.message || s.pesan,
      });
      ls.historyInsert({
        fullname: form.fullname.trim(),
        nik: nikClean,
        datechecker: ls.getCurrentTime(),
      });
    }

    isSearchForm.value = false;
    isResult.value = true;
  } catch (e) {
    snackbar.action({
      actionText: 'OKE',
      actionTextColor: '#FFEB3B',
      snackText: 'Gagal memproses NIK',
      textColor: '#FFFFFF',
      hideDelay: 4000,
      backgroundColor: '#333',
    });
  } finally {
    indicator.hide();
    isParsing.value = false;
  }
}

function cekLagi() {
  isSearchForm.value = true;
  isResult.value = false;
  form.fullname = '';
  form.nik = '';
}

function recheckConnection() {
  showLoading('Mengecek jaringan...');
  setTimeout(() => checkConnection(true), 500);
}

checkConnection();
</script>

<template>
  <GridLayout rows="*,auto,auto,*">
    <GridLayout
      v-show="isSearchForm"
      rows="*,auto,auto,auto,auto,auto,auto,auto,auto,*"
      columns="30,*,30"
      row="1"
    >
      <Image
        src="font://&#xf2c2;"
        color="#8130ff"
        width="75"
        class="fas t-36"
        row="1"
        col="1"
      />

      <TextField
        v-model="form.fullname"
        hint="Nama Lengkap"
        color="#616161"
        backgroundColor="#F5F5F5"
        paddingLeft="25"
        borderWidth="0"
        borderRadius="25"
        marginTop="24"
        height="50"
        row="2"
        col="1"
      />

      <Label
        text="* Nama tidak harus sama dengan KTP (untuk privasi)."
        textWrap="true"
        fontSize="11"
        paddingLeft="25"
        paddingRight="25"
        color="#c62828"
        row="3"
        col="1"
      />

      <TextField
        v-model="form.nik"
        hint="No. KTP (16 digit)"
        color="#616161"
        backgroundColor="#F5F5F5"
        paddingLeft="25"
        borderWidth="0"
        borderRadius="25"
        keyboardType="number"
        maxlength="16"
        height="50"
        row="4"
        col="1"
      />

      <GridLayout columns="*,auto" row="5" col="1" marginTop="12" marginLeft="25" marginRight="25">
        <Label text="Enrichment online (Nusakit)" fontSize="12" color="#616161" col="0" verticalAlignment="center" />
        <Switch :checked="useOnline" @checkedChange="(a: any) => useOnline = a.value" col="1" />
      </GridLayout>

      <Button
        text="CEK NO KTP"
        :isEnabled="!isParsing"
        @tap="cekNoktp"
        color="#FFF"
        backgroundColor="#8130ff"
        borderWidth="0"
        borderRadius="25"
        marginTop="20"
        marginLeft="35"
        marginRight="35"
        row="6"
        col="1"
      />

      <Label
        :text="connectedText"
        textWrap="true"
        fontSize="11"
        color="#9E9E9E"
        row="7"
        col="1"
        marginTop="12"
        horizontalAlignment="center"
      />

      <Button
        v-show="!connected"
        text="CEK KONEKSI"
        @tap="recheckConnection"
        color="#FFF"
        backgroundColor="#f44336"
        borderWidth="0"
        borderRadius="25"
        marginLeft="35"
        marginRight="35"
        row="8"
        col="1"
      />
    </GridLayout>

    <ScrollView v-show="isResult" height="100%" row="2" marginTop="50">
      <StackLayout marginLeft="20" marginRight="20" marginBottom="70">
        <Label text="Status" fontSize="13" color="#BDBDBD" marginTop="10" />
        <GridLayout columns="auto,auto">
          <Image
            :src="result.isValid ? 'font://&#xf058;' : 'font://&#xf057;'"
            class="fas"
            width="15"
            :color="result.statusColor"
            col="0"
          />
          <Label
            :text="' ' + result.status"
            fontSize="15"
            :color="result.statusColor"
            fontWeight="bold"
            col="1"
          />
        </GridLayout>

        <Label
          v-if="result.sourceLabel"
          :text="'Sumber: ' + result.sourceLabel"
          fontSize="12"
          color="#757575"
          marginTop="4"
        />
        <Label
          v-if="result.onlineMessage"
          :text="result.onlineMessage"
          fontSize="11"
          color="#9E9E9E"
          textWrap="true"
        />

        <Label
          text="Catatan: Valid struktural ≠ terdaftar di Dukcapil. Registry check butuh penyedia eKYC berizin."
          textWrap="true"
          fontSize="11"
          color="#E65100"
          marginTop="8"
        />

        <Label text="No. KTP" fontSize="13" color="#BDBDBD" marginTop="14" />
        <Label :text="result.nik" fontSize="15" color="#9E9E9E" fontWeight="bold" />

        <Label text="Nama Lengkap" fontSize="13" color="#BDBDBD" marginTop="10" />
        <Label :text="result.fullname" fontSize="15" color="#9E9E9E" fontWeight="bold" />

        <Label text="Dicek pada" fontSize="13" color="#BDBDBD" marginTop="10" />
        <Label :text="result.datechecker" fontSize="15" color="#9E9E9E" fontWeight="bold" />

        <StackLayout v-if="result.isValid">
          <Label text="DATA HASIL PARSE" fontSize="22" color="#8130ff" marginTop="16" />

          <Label text="Kelamin" fontSize="13" color="#BDBDBD" marginTop="10" />
          <Label :text="result.kelamin" fontSize="15" color="#9E9E9E" fontWeight="bold" />

          <Label text="Lahir" fontSize="13" color="#BDBDBD" marginTop="10" />
          <Label :text="result.lahir" fontSize="15" color="#9E9E9E" fontWeight="bold" />

          <Label text="Provinsi" fontSize="13" color="#BDBDBD" marginTop="10" />
          <Label :text="result.provinsi" fontSize="15" color="#9E9E9E" fontWeight="bold" />

          <Label text="Kota/Kab" fontSize="13" color="#BDBDBD" marginTop="10" />
          <Label :text="result.kotakab" fontSize="15" color="#9E9E9E" fontWeight="bold" />

          <Label text="Kecamatan" fontSize="13" color="#BDBDBD" marginTop="10" />
          <Label :text="result.kecamatan" fontSize="15" color="#9E9E9E" fontWeight="bold" />

          <Label text="Uniqcode" fontSize="13" color="#BDBDBD" marginTop="10" />
          <Label :text="result.uniqcode" fontSize="15" color="#9E9E9E" fontWeight="bold" />

          <Label text="INFO TAMBAHAN" fontSize="22" color="#8130ff" marginTop="16" />

          <Label text="Kode Pos" fontSize="13" color="#BDBDBD" marginTop="10" />
          <Label :text="result.kodepos" fontSize="15" color="#9E9E9E" fontWeight="bold" />

          <Label text="Pasaran" fontSize="13" color="#BDBDBD" marginTop="10" />
          <Label :text="result.pasaran" fontSize="15" color="#9E9E9E" fontWeight="bold" />

          <Label text="Usia" fontSize="13" color="#BDBDBD" marginTop="10" />
          <Label :text="result.usia" fontSize="15" color="#9E9E9E" fontWeight="bold" />

          <Label text="Ulang Tahun" fontSize="13" color="#BDBDBD" marginTop="10" />
          <Label :text="result.ultah" fontSize="15" color="#9E9E9E" fontWeight="bold" />

          <Label text="Zodiak" fontSize="13" color="#BDBDBD" marginTop="10" />
          <Label :text="result.zodiak" fontSize="15" color="#9E9E9E" fontWeight="bold" />
        </StackLayout>

        <Button
          text="CEK LAGI"
          @tap="cekLagi"
          color="#FFF"
          backgroundColor="#8130ff"
          borderWidth="0"
          borderRadius="25"
          marginTop="30"
        />
      </StackLayout>
    </ScrollView>
  </GridLayout>
</template>

<style scoped>
.fas {
  font-family: 'Font Awesome 5 Free', 'fa-solid-900';
  font-weight: 900;
}
</style>
