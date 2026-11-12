<script lang="ts" setup>
import type { HistoryItem } from '../shared/nik_toolkit';

defineProps<{
  item: HistoryItem;
}>();

const emit = defineEmits<{
  (e: 'back'): void;
}>();
</script>

<template>
  <ScrollView height="100%">
    <StackLayout marginLeft="20" marginRight="20" marginBottom="70" marginTop="20">
      <Label text="Status KTP" fontSize="13" color="#BDBDBD" marginTop="10" />
      <GridLayout columns="auto,auto">
        <Image
          :src="item.isValid ? 'font://&#xf058;' : 'font://&#xf057;'"
          class="fas"
          width="15"
          :color="item.isValid ? '#4CAF50' : '#f44336'"
          col="0"
        />
        <Label
          :text="' ' + (item.status || '')"
          fontSize="15"
          :color="item.statusColor"
          fontWeight="bold"
          col="1"
        />
      </GridLayout>

      <Label text="No. KTP" fontSize="13" color="#BDBDBD" marginTop="10" />
      <Label :text="item.nik" fontSize="15" color="#9E9E9E" fontWeight="bold" />

      <Label text="Nama Lengkap" fontSize="13" color="#BDBDBD" marginTop="10" />
      <Label :text="item.fullname" fontSize="15" color="#9E9E9E" fontWeight="bold" />

      <Label text="Dicek pada" fontSize="13" color="#BDBDBD" marginTop="10" />
      <Label :text="item.datechecker" fontSize="15" color="#9E9E9E" fontWeight="bold" />

      <StackLayout v-if="item.isValid && item.lahir">
        <Label text="DATA KTP" fontSize="24" color="#8130ff" marginTop="15" />
        <Label text="DALAM FORMAT TERBATAS" fontSize="13" color="#8130ff" />

        <Label text="Kelamin" fontSize="13" color="#BDBDBD" marginTop="10" />
        <Label :text="item.kelamin" fontSize="15" color="#9E9E9E" fontWeight="bold" />

        <Label text="Lahir" fontSize="13" color="#BDBDBD" marginTop="10" />
        <Label :text="item.lahir" fontSize="15" color="#9E9E9E" fontWeight="bold" />

        <Label text="Provinsi" fontSize="13" color="#BDBDBD" marginTop="10" />
        <Label :text="item.provinsi" fontSize="15" color="#9E9E9E" fontWeight="bold" />

        <Label text="Kota/Kab" fontSize="13" color="#BDBDBD" marginTop="10" />
        <Label :text="item.kotakab" fontSize="15" color="#9E9E9E" fontWeight="bold" />

        <Label text="Kecamatan" fontSize="13" color="#BDBDBD" marginTop="10" />
        <Label :text="item.kecamatan" fontSize="15" color="#9E9E9E" fontWeight="bold" />

        <Label text="Uniqcode" fontSize="13" color="#BDBDBD" marginTop="10" />
        <Label :text="item.uniqcode" fontSize="15" color="#9E9E9E" fontWeight="bold" />

        <Label text="INFO TAMBAHAN" fontSize="24" color="#8130ff" marginTop="15" />

        <Label text="Kode Pos" fontSize="13" color="#BDBDBD" marginTop="10" />
        <Label :text="item.tambahan?.kodepos" fontSize="15" color="#9E9E9E" fontWeight="bold" />

        <Label text="Pasaran" fontSize="13" color="#BDBDBD" marginTop="10" />
        <Label :text="item.tambahan?.pasaran" fontSize="15" color="#9E9E9E" fontWeight="bold" />

        <Label text="Usia" fontSize="13" color="#BDBDBD" marginTop="10" />
        <Label :text="item.tambahan?.usia" fontSize="15" color="#9E9E9E" fontWeight="bold" />

        <Label text="Ulang Tahun" fontSize="13" color="#BDBDBD" marginTop="10" />
        <Label :text="item.tambahan?.ultah" fontSize="15" color="#9E9E9E" fontWeight="bold" />

        <Label text="Zodiak" fontSize="13" color="#BDBDBD" marginTop="10" />
        <Label :text="item.tambahan?.zodiak" fontSize="15" color="#9E9E9E" fontWeight="bold" />
      </StackLayout>

      <Button
        text="KEMBALI"
        @tap="emit('back')"
        color="#FFF"
        backgroundColor="#8130ff"
        borderWidth="0"
        borderRadius="25"
        marginTop="35"
      />
    </StackLayout>
  </ScrollView>
</template>

<style scoped>
.fas {
  font-family: 'Font Awesome 5 Free', 'fa-solid-900';
  font-weight: 900;
}
</style>
