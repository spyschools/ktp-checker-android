<script lang="ts" setup>
import { Utils } from '@nativescript/core';

function rateNow() {
  Utils.openUrl('https://github.com/spyschools/ktp-checker-android');
}
</script>

<template>
  <Page>
    <ActionBar title="Informasi" />
    <ScrollView height="100%">
      <StackLayout marginLeft="20" marginRight="20" paddingBottom="50" marginTop="20">
        <Label text="#DUKUNGAN" fontSize="28" color="#E0E0E0" horizontalAlignment="right" />
        <Label text="Berikan 5 Bintang" fontSize="20" color="#212121" />
        <Label
          text="Dukung project open source ini di GitHub."
          textWrap="true"
          fontSize="13"
          color="#616161"
        />
        <Button
          text="Buka GitHub Repository"
          fontWeight="bold"
          @tap="rateNow"
          color="#FFFFFF"
          backgroundColor="#689F38"
          borderWidth="0"
          borderRadius="25"
          marginTop="10"
        />

        <Label text="#TENTANG" fontSize="28" color="#E0E0E0" marginTop="20" horizontalAlignment="right" />
        <Label text="Nama" fontSize="20" color="#212121" />
        <Label text="KTP Checker" fontSize="13" color="#616161" />

        <Label text="Deskripsi" fontSize="20" color="#212121" marginTop="10" />
        <Label
          text="Aplikasi validasi format NIK (KTP) Indonesia. Parsing lokal, tidak terhubung ke database kependudukan resmi."
          textWrap="true"
          fontSize="13"
          color="#616161"
        />

        <Label text="Rilis Pertama" fontSize="20" color="#212121" marginTop="10" />
        <Label text="22 November 2020 (v1.1)" fontSize="13" color="#616161" />

        <Label text="Versi Saat Ini" fontSize="20" color="#212121" marginTop="10" />
        <Label text="v3.0 (NativeScript 9 + Vue 3 + TypeScript)" fontSize="13" color="#616161" />

        <Label text="Pembuat / Maintainer" fontSize="20" color="#212121" marginTop="10" />
        <Label text="Spy Schools (Fariz Azhari)" fontSize="13" color="#616161" />
        <Label text="https://github.com/spyschools" fontSize="13" color="#616161" />

        <Label text="Original Author" fontSize="20" color="#212121" marginTop="10" />
        <Label text="Spy Schools (Fariz Azhari)" fontSize="13" color="#616161" />

        <Label text="#TEKNOLOGI" fontSize="28" color="#E0E0E0" marginTop="20" horizontalAlignment="right" />
        <Label text="NativeScript 9.1 + Vue 3 + TypeScript" fontSize="13" color="#616161" />
        <Label text="NIK Parser: Ican Bachors (nik_parse.js)" fontSize="13" color="#616161" marginTop="6" />
      </StackLayout>
    </ScrollView>
  </Page>
</template>
