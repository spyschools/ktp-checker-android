/**
 * nik_toolkit.ts — Single-file NIK toolkit
 * Local structural parse + Nusakit online enrichment + optional commercial hook
 * Zero external deps besides @nativescript/core Http (optional; falls back to fetch)
 *
 * Spy Schools (Fariz Azhari) — 2026
 * License: MIT
 */

// ─── Types ───────────────────────────────────────────────────────────

export type Gender = 'LAKI-LAKI' | 'PEREMPUAN';
export type ValidationSource = 'local' | 'nusakit' | 'commercial';

export interface NikTambahan {
  kodepos: string;
  pasaran: string;
  usia: string;
  ultah: string;
  zodiak: string;
}

export interface NikParseData {
  nik: string;
  kelamin: Gender;
  lahir: string; // DD/MM/YYYY
  provinsi: string;
  kotakab: string;
  kecamatan: string;
  uniqcode: string;
  tambahan: NikTambahan;
  // extra from online when available
  provinceCode?: string;
  regencyCode?: string;
  districtCode?: string;
  birthDateISO?: string;
  age?: number;
}

export interface NikParseResult {
  status: 'success' | 'error';
  pesan: string;
  data?: NikParseData;
}

export interface ApiValidationResult {
  source: ValidationSource;
  structural: NikParseResult;
  online?: { ok: boolean; message: string; raw?: unknown };
  registryVerified?: boolean;
}

export interface HistoryItem {
  nik: string;
  fullname: string;
  kelamin?: string;
  lahir?: string;
  provinsi?: string;
  kotakab?: string;
  kecamatan?: string;
  uniqcode?: string;
  tambahan?: NikTambahan;
  datechecker: string;
  isValid?: boolean;
  status?: string;
  statusColor?: string;
  source?: string;
  registryVerified?: boolean;
}

// ─── Constants ───────────────────────────────────────────────────────

const PROVINSI: Record<string, string> = {
  '11': 'ACEH', '12': 'SUMATERA UTARA', '13': 'SUMATERA BARAT', '14': 'RIAU',
  '15': 'JAMBI', '16': 'SUMATERA SELATAN', '17': 'BENGKULU', '18': 'LAMPUNG',
  '19': 'KEPULAUAN BANGKA BELITUNG', '21': 'KEPULAUAN RIAU',
  '31': 'DKI JAKARTA', '32': 'JAWA BARAT', '33': 'JAWA TENGAH', '34': 'DI YOGYAKARTA',
  '35': 'JAWA TIMUR', '36': 'BANTEN',
  '51': 'BALI', '52': 'NUSA TENGGARA BARAT', '53': 'NUSA TENGGARA TIMUR',
  '61': 'KALIMANTAN BARAT', '62': 'KALIMANTAN TENGAH', '63': 'KALIMANTAN SELATAN',
  '64': 'KALIMANTAN TIMUR', '65': 'KALIMANTAN UTARA',
  '71': 'SULAWESI UTARA', '72': 'SULAWESI TENGAH', '73': 'SULAWESI SELATAN',
  '74': 'SULAWESI TENGGARA', '75': 'GORONTALO', '76': 'SULAWESI BARAT',
  '81': 'MALUKU', '82': 'MALUKU UTARA',
  '91': 'PAPUA', '92': 'PAPUA BARAT', '93': 'PAPUA SELATAN', '94': 'PAPUA TENGAH',
  '95': 'PAPUA PEGUNUNGAN', '96': 'PAPUA BARAT DAYA',
};

const KOTAKAB: Record<string, string> = {
  '3171': 'KOTA JAKARTA PUSAT', '3172': 'KOTA JAKARTA UTARA', '3173': 'KOTA JAKARTA BARAT',
  '3174': 'KOTA JAKARTA SELATAN', '3175': 'KOTA JAKARTA TIMUR', '3101': 'KAB. KEPULAUAN SERIBU',
  '3201': 'KAB. BOGOR', '3202': 'KAB. SUKABUMI', '3203': 'KAB. CIANJUR', '3204': 'KAB. BANDUNG',
  '3205': 'KAB. GARUT', '3206': 'KAB. TASIKMALAYA', '3207': 'KAB. CIAMIS', '3208': 'KAB. KUNINGAN',
  '3209': 'KAB. CIREBON', '3210': 'KAB. MAJALENGKA', '3211': 'KAB. SUMEDANG', '3212': 'KAB. INDRAMAYU',
  '3213': 'KAB. SUBANG', '3214': 'KAB. PURWAKARTA', '3215': 'KAB. KARAWANG', '3216': 'KAB. BEKASI',
  '3217': 'KAB. BANDUNG BARAT', '3218': 'KAB. PANGANDARAN',
  '3271': 'KOTA BOGOR', '3272': 'KOTA SUKABUMI', '3273': 'KOTA BANDUNG', '3274': 'KOTA CIREBON',
  '3275': 'KOTA BEKASI', '3276': 'KOTA DEPOK', '3277': 'KOTA CIMAHI', '3278': 'KOTA TASIKMALAYA',
  '3279': 'KOTA BANJAR',
  '3301': 'KAB. CILACAP', '3302': 'KAB. BANYUMAS', '3310': 'KAB. KLATEN', '3311': 'KAB. SUKOHARJO',
  '3312': 'KAB. WONOGIRI', '3313': 'KAB. KARANGANYAR', '3314': 'KAB. SRAGEN', '3315': 'KAB. GROBOGAN',
  '3316': 'KAB. BLORA', '3317': 'KAB. REMBANG', '3318': 'KAB. PATI', '3319': 'KAB. KUDUS',
  '3320': 'KAB. JEPARA', '3321': 'KAB. DEMAK', '3322': 'KAB. SEMARANG', '3371': 'KOTA MAGELANG',
  '3372': 'KOTA SURAKARTA', '3373': 'KOTA SALATIGA', '3374': 'KOTA SEMARANG', '3375': 'KOTA PEKALONGAN',
  '3376': 'KOTA TEGAL',
  '3401': 'KAB. KULON PROGO', '3402': 'KAB. BANTUL', '3403': 'KAB. GUNUNG KIDUL', '3404': 'KAB. SLEMAN',
  '3471': 'KOTA YOGYAKARTA',
  '3509': 'KAB. JEMBER', '3510': 'KAB. BANYUWANGI', '3515': 'KAB. SIDOARJO', '3516': 'KAB. MOJOKERTO',
  '3525': 'KAB. GRESIK', '3571': 'KOTA KEDIRI', '3573': 'KOTA MALANG', '3578': 'KOTA SURABAYA', '3579': 'KOTA BATU',
  '3601': 'KAB. PANDEGLANG', '3602': 'KAB. LEBAK', '3603': 'KAB. TANGERANG', '3604': 'KAB. SERANG',
  '3671': 'KOTA TANGERANG', '3672': 'KOTA CILEGON', '3673': 'KOTA SERANG', '3674': 'KOTA TANGERANG SELATAN',
  '5103': 'KAB. BADUNG', '5104': 'KAB. GIANYAR', '5108': 'KAB. BULELENG', '5171': 'KOTA DENPASAR',
  '7371': 'KOTA MAKASSAR', '1271': 'KOTA MEDAN', '1471': 'KOTA PEKANBARU', '1671': 'KOTA PALEMBANG',
  '1871': 'KOTA BANDAR LAMPUNG',
};

const PASARAN = ['Pon', 'Wage', 'Kliwon', 'Legi', 'Pahing'] as const;
const HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'] as const;
const BULAN = [
  '', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
] as const;

const ZODIAK: [number, number, string][] = [
  [1, 20, 'Capricorn'], [2, 19, 'Aquarius'], [3, 20, 'Pisces'],
  [4, 20, 'Aries'], [5, 21, 'Taurus'], [6, 21, 'Gemini'],
  [7, 23, 'Cancer'], [8, 23, 'Leo'], [9, 23, 'Virgo'],
  [10, 23, 'Libra'], [11, 22, 'Scorpio'], [12, 22, 'Sagitarius'],
  [12, 32, 'Capricorn'],
];

const NUSAKIT_BASE = 'https://nusakit.my.id/v1';
const CACHE_MAX = 64;
const parseCache = new Map<string, NikParseResult>();

// ─── Helpers ─────────────────────────────────────────────────────────

function getZodiak(day: number, month: number): string {
  for (const [m, d, name] of ZODIAK) {
    if (month === m && day <= d) return name;
    if (month < m) return name;
  }
  return 'Capricorn';
}

function getPasaran(date: Date): string {
  const ref = new Date(1900, 0, 1).getTime();
  const diff = Math.floor((date.getTime() - ref) / 86400000);
  return PASARAN[((diff % 5) + 5) % 5];
}

function formatUsia(birth: Date, now = new Date()): string {
  let y = now.getFullYear() - birth.getFullYear();
  let m = now.getMonth() - birth.getMonth();
  let d = now.getDate() - birth.getDate();
  if (d < 0) {
    m--;
    d += new Date(now.getFullYear(), now.getMonth(), 0).getDate();
  }
  if (m < 0) {
    y--;
    m += 12;
  }
  return `${y} Tahun ${m} Bulan ${d} Hari`;
}

function formatUltah(birth: Date, now = new Date()): string {
  const next = new Date(now.getFullYear(), birth.getMonth(), birth.getDate());
  if (next < now) next.setFullYear(now.getFullYear() + 1);
  const days = Math.ceil((next.getTime() - now.getTime()) / 86400000);
  if (days === 0) return 'Hari ini';
  if (days === 1) return '1 Hari Lagi';
  const months = Math.floor(days / 30);
  const rem = days % 30;
  return months === 0 ? `${days} Hari Lagi` : `${months} Bulan ${rem} Hari Lagi`;
}

export function getCurrentTime(): string {
  const d = new Date();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', "Jum'at", 'Sabtu'];
  return `${days[d.getDay()]}, ${d.getDate()}/${months[d.getMonth()]}/${d.getFullYear()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
}

// ─── Local parser ────────────────────────────────────────────────────

export function parseNik(nik: string): NikParseResult {
  const key = String(nik).trim();
  const cached = parseCache.get(key);
  if (cached) return cached;

  if (!/^\d{16}$/.test(key)) {
    return { status: 'error', pesan: 'NIK harus 16 digit angka' };
  }

  const provCode = key.substring(0, 2);
  const kotaCode = key.substring(0, 4);
  const kecCode = key.substring(4, 6);
  let day = parseInt(key.substring(6, 8), 10);
  const month = parseInt(key.substring(8, 10), 10);
  let year = parseInt(key.substring(10, 12), 10);
  const uniq = key.substring(12, 16);

  let kelamin: Gender = 'LAKI-LAKI';
  if (day > 40) {
    kelamin = 'PEREMPUAN';
    day -= 40;
  }

  const currentYear = new Date().getFullYear() % 100;
  year += year <= currentYear + 5 ? 2000 : 1900;

  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return { status: 'error', pesan: 'Tanggal lahir pada NIK tidak valid' };
  }

  const birth = new Date(year, month - 1, day);
  if (
    birth.getFullYear() !== year ||
    birth.getMonth() !== month - 1 ||
    birth.getDate() !== day
  ) {
    return { status: 'error', pesan: 'Tanggal lahir pada NIK tidak valid' };
  }
  if (birth > new Date()) {
    return { status: 'error', pesan: 'Tanggal lahir di masa depan' };
  }

  const lahirStr = `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
  const pasaranFull = `${HARI[birth.getDay()]} ${getPasaran(birth)}, ${day} ${BULAN[month]} ${year}`;

  const result: NikParseResult = {
    status: 'success',
    pesan: 'NIK valid',
    data: {
      nik: key,
      kelamin,
      lahir: lahirStr,
      provinsi: PROVINSI[provCode] || `KODE PROVINSI ${provCode}`,
      kotakab: KOTAKAB[kotaCode] || `KODE WILAYAH ${kotaCode}`,
      kecamatan: `KECAMATAN KODE ${kecCode}`,
      uniqcode: uniq,
      provinceCode: provCode,
      regencyCode: key.substring(2, 4),
      districtCode: kecCode,
      birthDateISO: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
      age: new Date().getFullYear() - year,
      tambahan: {
        kodepos: '-',
        pasaran: pasaranFull,
        usia: formatUsia(birth),
        ultah: formatUltah(birth),
        zodiak: getZodiak(day, month),
      },
    },
  };

  if (parseCache.size >= CACHE_MAX) {
    const first = parseCache.keys().next().value;
    if (first) parseCache.delete(first);
  }
  parseCache.set(key, result);
  return result;
}

export function clearNikCache(): void {
  parseCache.clear();
}

/** Callback-style (drop-in for old nikParse) */
export function nikParse(nik: string, callback: (r: NikParseResult) => void): void {
  Promise.resolve().then(() => callback(parseNik(nik)));
}

// ─── HTTP (NS Http or fetch) ─────────────────────────────────────────

async function httpGetJson(url: string, timeoutMs = 8000): Promise<{ status: number; body: any }> {
  // Prefer global fetch (browser / modern NS)
  if (typeof fetch === 'function') {
    const ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const t = ctrl ? setTimeout(() => ctrl.abort(), timeoutMs) : null;
    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal: ctrl?.signal,
      });
      const text = await res.text();
      let body: any = text;
      try {
        body = JSON.parse(text);
      } catch {
        /* keep text */
      }
      return { status: res.status, body };
    } finally {
      if (t) clearTimeout(t);
    }
  }

  // NativeScript Http fallback
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { Http } = require('@nativescript/core');
    const response = await Http.request({
      url,
      method: 'GET',
      headers: { Accept: 'application/json' },
      timeout: timeoutMs,
    });
    let body: any = response.content;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        /* keep */
      }
    }
    return { status: response.statusCode, body };
  } catch (e: any) {
    throw new Error(e?.message || 'HTTP request failed');
  }
}

async function httpPostJson(
  url: string,
  payload: object,
  headers: Record<string, string> = {},
  timeoutMs = 15000
): Promise<{ status: number; body: any }> {
  if (typeof fetch === 'function') {
    const ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const t = ctrl ? setTimeout(() => ctrl.abort(), timeoutMs) : null;
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...headers,
        },
        body: JSON.stringify(payload),
        signal: ctrl?.signal,
      });
      const text = await res.text();
      let body: any = text;
      try {
        body = JSON.parse(text);
      } catch {
        /* keep */
      }
      return { status: res.status, body };
    } finally {
      if (t) clearTimeout(t);
    }
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { Http } = require('@nativescript/core');
    const response = await Http.request({
      url,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...headers,
      },
      content: JSON.stringify(payload),
      timeout: timeoutMs,
    });
    let body: any = response.content;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        /* keep */
      }
    }
    return { status: response.statusCode, body };
  } catch (e: any) {
    throw new Error(e?.message || 'HTTP POST failed');
  }
}

// ─── Nusakit ─────────────────────────────────────────────────────────

export async function validateViaNusakit(nik: string): Promise<ApiValidationResult> {
  const structural = parseNik(nik);

  try {
    const { status, body } = await httpGetJson(
      `${NUSAKIT_BASE}/nik/validate?nik=${encodeURIComponent(nik)}`
    );

    if (status >= 200 && status < 300 && body?.success && body?.data) {
      const info = body.data.info || body.data;
      if (structural.data && info) {
        if (info.province) structural.data.provinsi = info.province;
        if (info.provinceCode) structural.data.provinceCode = String(info.provinceCode);
        if (info.regencyCode) structural.data.regencyCode = String(info.regencyCode);
        if (info.districtCode) {
          structural.data.districtCode = String(info.districtCode);
          structural.data.kecamatan = `KECAMATAN KODE ${info.districtCode}`;
        }
        if (info.birthDateISO) structural.data.birthDateISO = info.birthDateISO;
        if (typeof info.age === 'number') structural.data.age = info.age;
        if (info.gender === 'L') structural.data.kelamin = 'LAKI-LAKI';
        if (info.gender === 'P') structural.data.kelamin = 'PEREMPUAN';
      }

      return {
        source: 'nusakit',
        structural,
        online: { ok: true, message: 'Validasi struktural online (Nusakit)', raw: body },
        registryVerified: false,
      };
    }

    return {
      source: 'nusakit',
      structural,
      online: { ok: false, message: `Nusakit HTTP ${status}` },
      registryVerified: false,
    };
  } catch (e: any) {
    return {
      source: 'local',
      structural,
      online: { ok: false, message: e?.message || 'Nusakit unreachable' },
      registryVerified: false,
    };
  }
}

// ─── Commercial (pluggable) ──────────────────────────────────────────

export async function validateViaCommercial(opts: {
  nik: string;
  name: string;
  dateOfBirth?: string;
  apiBaseUrl: string;
  apiKey: string;
  extraHeaders?: Record<string, string>;
}): Promise<ApiValidationResult> {
  const structural = parseNik(opts.nik);

  if (!opts.apiBaseUrl || !opts.apiKey) {
    return {
      source: 'commercial',
      structural,
      online: { ok: false, message: 'API base URL / key belum dikonfigurasi' },
      registryVerified: false,
    };
  }

  try {
    const { status, body } = await httpPostJson(
      opts.apiBaseUrl,
      { nik: opts.nik, name: opts.name, date_of_birth: opts.dateOfBirth },
      { Authorization: `Bearer ${opts.apiKey}`, ...(opts.extraHeaders || {}) }
    );

    const verified =
      body?.result === 'verified' ||
      body?.status === 'VERIFIED' ||
      body?.data?.isValid === true ||
      body?.verified === true ||
      body?.success === true;

    return {
      source: 'commercial',
      structural,
      online: {
        ok: status >= 200 && status < 300,
        message: verified ? 'Terverifikasi registry (provider)' : 'Tidak match / ditolak provider',
        raw: body,
      },
      registryVerified: !!verified,
    };
  } catch (e: any) {
    return {
      source: 'commercial',
      structural,
      online: { ok: false, message: e?.message || 'Commercial API error' },
      registryVerified: false,
    };
  }
}

// ─── Hybrid entry ────────────────────────────────────────────────────

export async function validateNikHybrid(
  nik: string,
  options?: {
    useOnlineStructural?: boolean;
    commercial?: {
      enabled: boolean;
      name: string;
      dateOfBirth?: string;
      apiBaseUrl: string;
      apiKey: string;
    };
  }
): Promise<ApiValidationResult> {
  if (options?.commercial?.enabled) {
    return validateViaCommercial({
      nik,
      name: options.commercial.name,
      dateOfBirth: options.commercial.dateOfBirth,
      apiBaseUrl: options.commercial.apiBaseUrl,
      apiKey: options.commercial.apiKey,
    });
  }

  if (options?.useOnlineStructural !== false) {
    return validateViaNusakit(nik);
  }

  return {
    source: 'local',
    structural: parseNik(nik),
    registryVerified: false,
  };
}

// ─── Minimal local history (ApplicationSettings if NS available) ─────

const HISTORY_KEY = 'ldkc';

function getSettings(): { getString(k: string): string; setString(k: string, v: string): void; remove(k: string): void; hasKey(k: string): boolean } | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { ApplicationSettings } = require('@nativescript/core');
    return ApplicationSettings;
  } catch {
    return null;
  }
}

export function historyGet(): { success: boolean; message: string; data: HistoryItem[] } {
  const s = getSettings();
  if (!s || !s.hasKey(HISTORY_KEY)) {
    return { success: false, message: 'Data not found!', data: [] };
  }
  try {
    return {
      success: true,
      message: 'Data found.',
      data: JSON.parse(s.getString(HISTORY_KEY) || '[]'),
    };
  } catch {
    return { success: false, message: 'Corrupt data', data: [] };
  }
}

export function historyInsert(item: HistoryItem): { success: boolean; message: string } {
  const s = getSettings();
  if (!s) return { success: false, message: 'Storage unavailable' };
  const cur = s.hasKey(HISTORY_KEY) ? JSON.parse(s.getString(HISTORY_KEY) || '[]') : [];
  s.setString(HISTORY_KEY, JSON.stringify([item, ...cur]));
  return { success: true, message: 'Inserted' };
}

export function historyDrop(): { success: boolean; message: string } {
  const s = getSettings();
  if (!s) return { success: false, message: 'Storage unavailable' };
  if (s.hasKey(HISTORY_KEY)) s.remove(HISTORY_KEY);
  return { success: true, message: 'Dropped' };
}

// ─── Default export ──────────────────────────────────────────────────

export default {
  parseNik,
  nikParse,
  clearNikCache,
  validateViaNusakit,
  validateViaCommercial,
  validateNikHybrid,
  getCurrentTime,
  historyGet,
  historyInsert,
  historyDrop,
};
