# KTP Checker Android

**Spy Schools (Fariz Azhari)** · Rilis: **12 November 2026** · v3.2.0

Aplikasi Android untuk validasi & parse NIK (KTP Indonesia).  
Stack: **NativeScript 9 · Vue 3 · TypeScript**.

- Parse struktural offline (cepat, ~10 KB toolkit)
- Enrichment online opsional via [Nusakit API](https://nusakit.my.id) (struktural, gratis)
- Hook eKYC commercial (Dukcapil registry) — hanya jika Anda punya kredensial provider resmi
- Riwayat pengecekan lokal
- Target Android modern (SDK 34+)

> Validasi struktural **bukan** bukti NIK terdaftar di Dukcapil.  
> Registry check hanya lewat penyedia eKYC berizin.

---

## Repository

```
https://github.com/spyschools/ktp-checker-android
```

Fork / clone dari akun: [github.com/spyschools](https://github.com/spyschools)

---

## Requirement

| Tool | Versi minimal |
|------|----------------|
| Node.js | 18+ (disarankan 20 LTS) |
| npm / yarn | terbaru |
| NativeScript CLI | 9.x (`npm i -g nativescript`) |
| Android Studio | SDK 34, build-tools, platform-tools |
| JDK | 17 |

Pastikan `ANDROID_HOME` / `ANDROID_SDK_ROOT` sudah diset.

---

## Instalasi & Build APK (siap pasang di Android)

### 1. Clone

```bash
git clone https://github.com/spyschools/ktp-checker-android.git
cd ktp-checker-android
```

### 2. Install dependensi

```bash
npm install
```

### 3. Tambah platform Android

```bash
ns platform add android
```

### 4. Jalankan di device / emulator (debug)

```bash
ns run android
# atau
npm run android
```

### 5. Build APK release (siap install)

```bash
# Debug APK (cepat, untuk uji)
ns build android --env.production

# Release (perlu keystore)
ns build android --env.production --release
```

APK biasanya berada di:

```
platforms/android/app/build/outputs/apk/
```

Salin `.apk` ke HP → izinkan install dari sumber tidak dikenal → install.

#### Keystore release (opsional)

```bash
keytool -genkey -v -keystore ktp-checker.keystore -alias ktpchecker \
  -keyalg RSA -keysize 2048 -validity 10000
```

Konfigurasi signing di `App_Resources/Android/app.gradle` sesuai dokumentasi NativeScript.

---

## Upload ke GitHub

```bash
cd ktp-checker-android
git init
git add .
git commit -m "Initial release v3.2.0 — Spy Schools (Fariz Azhari)"
git branch -M main
git remote add origin https://github.com/spyschools/ktp-checker-android.git
git push -u origin main
```

Buat repo kosong dulu di GitHub (nama disarankan: `ktp-checker-android`).

---

## Struktur proyek

```
ktp-checker-android/
├── App_Resources/Android/     # Manifest, icon, splash, styles
├── src/
│   ├── main.ts                # Bootstrap Vue + NS
│   ├── App.vue                # Root + BottomNavigation
│   ├── app.css
│   ├── shared/
│   │   └── nik_toolkit.ts     # SEMUA logika NIK (satu file)
│   └── views/
│       ├── PengecekanView.vue
│       ├── RiwayatView.vue
│       ├── RiwayatDetailView.vue
│       └── InformasiView.vue
├── nativescript.config.ts
├── package.json
├── tsconfig.json
├── webpack.config.js
├── LICENSE
└── README.md
```

Logika inti ada di **`src/shared/nik_toolkit.ts`** (parser lokal + Nusakit + commercial hook + history).

---

## Pemakaian toolkit (standalone)

```ts
import { parseNik, validateNikHybrid } from './src/shared/nik_toolkit';

// Offline
const r = parseNik('3204110609970001');

// Hybrid (lokal + Nusakit jika online)
const h = await validateNikHybrid('3204110609970001', {
  useOnlineStructural: true,
});
```

---

## Fitur UI

| Tab | Fungsi |
|-----|--------|
| Pengecekan | Input nama + NIK, toggle enrichment online, hasil parse |
| Riwayat | Daftar hasil lokal, hapus semua |
| Informasi | Tentang app, pembuat, disclaimer |

---


---

## Cara paling simpel: Build APK lewat GitHub Actions (tanpa SDK di laptop)

1. Push source ke repo GitHub Anda (`spyschools/ktp-checker-android`).
2. File workflow sudah ada di `.github/workflows/build-apk.yml`.
3. Buka tab **Actions** → pilih **Build Android APK** → **Run workflow**.
4. Setelah selesai (hijau), buka run tersebut → **Artifacts** → unduh `ktp-checker-android`.
5. Extract ZIP artifact → dapat file `.apk` → install di HP.

Atau buat tag untuk release otomatis:

```bash
git tag v3.2.0
git push origin v3.2.0
```

APK akan muncul di halaman **Releases**.

Tidak perlu install Android SDK / NativeScript di Kali.


## Disclaimer

- Validasi struktural ≠ terdaftar di Dukcapil.
- Tidak ada endpoint Dukcapil publik; akses registry hanya via eKYC berizin + perjanjian.
- Patuhi UU PDP No. 27/2022. Jangan gunakan untuk impersonation atau penyalahgunaan data pribadi.

---

## Kredit

- Parser & app: **Spy Schools (Fariz Azhari)** — [github.com/spyschools](https://github.com/spyschools)
- Enrichment struktural: [Nusakit API](https://nusakit.my.id) (MIT)
- Basis ide awal: komunitas open-source KTP checker NativeScript

## License

MIT © Spy Schools (Fariz Azhari) — 2026
