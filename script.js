/* =====================================================================
   JEMAAT GPM HUKURILA — script.js
   Bagian 1: data bawaan (sama dengan yang tampil di layar pengunjung)
   Data bawaan menjadi konten awal. Perubahan admin disimpan ke Supabase
   pada tabel public.site_content; login dan hak akses menggunakan Supabase Auth/RLS.
===================================================================== */
"use strict";
// Koneksi Supabase
const SUPABASE_URL = "https://hdvzocfgbbqtkfukdldj.supabase.co";
const SUPABASE_KEY = "sb_publishable_BIdeC53xAOrDUUR8j8qNow_3m86ro26";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

// Username admin dipetakan ke email akun Supabase
const ADMIN_EMAILS = {
  admingereja: "admingereja@hukurila.invalid",
  adminsektor1: "adminsektor1@hukurila.invalid",
  adminsektor2: "adminsektor2@hukurila.invalid",
  adminsektor3: "adminsektor3@hukurila.invalid",
  adminsektor4: "adminsektor4@hukurila.invalid"
};

const $ = id => document.getElementById(id);
const STORE_KEY = "hukurila_site_v2";

const escapeHtml = (value = "") =>
  String(value ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

/* URL aman: http(s), gambar data:, atau alamat relatif (assets/...) */
const safeUrl = value => {
  const v = String(value || "").trim();
  if (!v) return "";
  if (/^https?:\/\//i.test(v) || /^data:image\/(png|jpe?g|webp|gif);base64,/i.test(v)) return v;
  if (!/^[a-z][a-z0-9+.-]*:/i.test(v) && !v.startsWith("//") && !v.includes("..")) return v;
  return "";
};

const clone = v => JSON.parse(JSON.stringify(v));
const withIds = (prefix, list) => list.map((x, i) => ({ id: `${prefix}-${i + 1}`, published: true, ...x }));

const SECTOR_ORDER = ["Nazareth", "Tiberias", "Getsemani", "Efata"];
const GEDUNG = "Gedung Gereja Jemaat GPM Hukurila";

const DEFAULTS = {
  beranda: {
    main: {
      logo: "assets/logo-gpm.png",
      bg: "assets/gereja-ebenhaezer.jpg",
      eyebrow: "GEREJA PROTESTAN MALUKU",
      line1: "Selamat Datang di",
      line2: "Jemaat GPM Hukurila",
      verse: "\"Sebab di mana dua atau tiga berkumpul dalam Nama-Ku, di situ Aku ada di tengah-tengah mereka.\"",
      verseRef: "— Matius 18:20",
      btn1: "Kenali Jemaat Kami",
      btn2: "Lihat Jadwal Ibadah",
      note: "Iman · Persekutuan · Pelayanan"
    },
    situs: {
      brandName: "Jemaat GPM Hukurila",
      tagline: "Gereja yang bertumbuh dalam kasih",
      footerTagline: "Iman · Persekutuan · Pelayanan"
    }
  },

  profil: {
    main: {
      image: "assets/gereja-hukurila.jpeg",
      captionSmall: "Gereja Protestan Maluku",
      captionTitle: "Jemaat GPM Hukurila",
      label: "PROFIL JEMAAT",
      title: "Jemaat GPM Hukurila",
      intro: "Mengenal Jemaat GPM Hukurila yang berada di Negeri Hukurila, Kecamatan Leitimur Selatan, Kota Ambon, beserta kehidupan masyarakat, kondisi wilayah, dan arah pelayanan jemaat.",
      description: "Wilayah Hukurila memiliki karakteristik alam yang beragam, mulai dari kawasan pesisir, wilayah dataran, hingga daerah perbukitan. Pada bagian selatan terdapat kawasan pesisir yang berbatasan dengan Laut Banda. Sementara itu, wilayah perbukitan terdapat di bagian utara dan timur. Kehidupan masyarakat Hukurila berkaitan erat dengan kondisi alam dan potensi wilayahnya. Sebagian masyarakat melakukan kegiatan perikanan, berkebun, berdagang, serta mengolah hasil alam. Dalam kehidupan sosial, masyarakat Hukurila menjunjung tinggi nilai kebersamaan, kekeluargaan, adat istiadat, dan semangat gotong royong.",
      visi: "“Menjadi Gereja yang Berbuah dalam Anugerah Allah Tritunggal.”",
      misi: "Menggembalakan keluarga sebagai komunitas kasih yang berbuah dalam iman dan meneladani Allah Tritunggal\nMemperjuangkan keadilan dan kelayakhunian dunia sebagai rumah bersama bagi seluruh ciptaan.\nMelayani, memulihkan dan membaharui kehidupan bersama dalam anugerah Allah Tritunggal.",
      sejarah: "Jemaat GPM Hukurila berada di Negeri Hukurila, Kecamatan Leitimur Selatan, Kota Ambon, Provinsi Maluku. Wilayah Hukurila memiliki karakteristik alam yang beragam, mulai dari kawasan pesisir, wilayah dataran, hingga daerah perbukitan. Pada bagian selatan terdapat kawasan pesisir yang berbatasan dengan Laut Banda. Sementara itu, wilayah perbukitan terdapat di bagian utara dan timur."
    }
  },

  organisasi: {
    info: {
      heading: "Struktur Organisasi Pelayanan",
      logo: "assets/logo-gpm-maluku.png",
      coverTitle: "BAGAN POLA ORGANISASI JEMAAT HUKURILA",
      coverSub: "JEMAAT GPM HUKURILA",
      coverPeriod: "PERIODE 2025–2030",
      photo: "assets/foto-bersama-pendeta-majelis.jpeg",
      photoCaption: "Pendeta dan Majelis Jemaat GPM Hukurila",
      majelisTitle: "MAJELIS JEMAAT",
      majelisPeriod: "PERIODE 2025–2030",
      majelisLabel: "PIMPINAN HARIAN MAJELIS JEMAAT",
      seksiKicker: "UNSUR PELAKSANA PELAYANAN",
      seksiTitle: "Seksi-Seksi Pelayanan",
      sektorKicker: "WILAYAH PELAYANAN",
      sektorTitle: "Sektor-Sektor Jemaat"
    },
    pimpinan: withIds("pim", [
      { position: "Ketua", name: "Pdt. Hanny Huwae" },
      { position: "Wakil Ketua", name: "Pnt. James de Queloe" },
      { position: "Sekretaris", name: "Pnt. Pimi Maitimu" },
      { position: "Wakil Sekretaris", name: "Dkn. Dany Sohilait" },
      { position: "Bendahara", name: "Dkn. Ny. Ona Latupeirissa-M" },
      { position: "Wakil Bendahara", name: "Pnt. Eli Sariwating" }
    ]),
    /* subs: satu baris = satu kelompok  →  "tugas 1; tugas 2 | penanggung jawab" */
    seksi: withIds("seksi", [
      { name: "SEKSI PTPU", ketua: "Pnt. Nico de Fretes", subs:
        "Pembinaan ARK; Pembinaan Pemuda | Pnt. Ny. Ani Porwaila-T\n" +
        "Pembinaan Kemitraan I&P; Pembinaan WGS | Pnt. Niko de Fretes\n" +
        "Pembinaan Keluarga; Pembinaan WGP | Dkn. Ny. Din Palijama-D\n" +
        "Pembinaan Peribadatan & MUGER; Pembinaan Pastoral Konseling | Dkn. Nani de Fretes" },
      { name: "SEKSI PIPK", ketua: "Pnt. Ongky Tupan", subs:
        "Pemberitaan Injil; Pelayanan Hukum & Advokasi | Pnt. Ongky Tupan\n" +
        "Pelayanan Pendidikan; Pelayanan Kesehatan | Dkn. Ny. Na de Queloe-L\n" +
        "Pemberdayaan Ekonomi Umat; Pemberdayaan Sosialbud | Dkn. Ny. Ace Wattimena-P" },
      { name: "SEKSI POS", ketua: "Dkn. Ny. Peni Maitimu-S", subs:
        "Pembinaan Kerjasama Lintas Denominasi; Pembinaan Kerjasama Antar Agama dan Aliran Kepercayaan | Dkn. Ny. Peni Maitimu-S\n" +
        "Lingkungan Hidup dan Keutuhan Ciptaan; Bencana Alam dan Sosial | Dkn. Ny. Linda Papilaya-P" },
      { name: "SEKSI PPK", ketua: "Pnt. Noken Latumahina", subs:
        "Pembinaan Administrasi & Manajemen; Pembinaan Kepegawaian; Pengembangan Staff | Pnt. Pimi Maitimu & Dkn. Dany Sohilait\n" +
        "Pembinaan Sistem & Manajemen Keuangan; Inventarisasi dan Pengelolaan Barang; Pengembangan Sumber Daya Keuangan | Dkn. Ny. Ona Latupeirissa-M & Pnt. Eli Sariwating\n" +
        "Pengembangan Infrastruktur; Pembinaan Aparatur Pelayanan | Pnt. Ucu Latuheru\n" +
        "Pembinaan Pengembangan & Perencanaan; Pengendalian Program; Penggalangan Hubungan Kerjasama | Pnt. James de Queloe\n" +
        "Pengelolaan Informasi; Dokumentasi & Publikasi; Komunikasi Pelayanan | Pnt. Noken Latumahina" }
    ]),
    sektor: withIds("sektor", SECTOR_ORDER.map(s => ({ name: "SEKTOR " + s.toUpperCase(), units: "UNIT 1\nUNIT 2" })))
  },

  ibadah: {
    heading: {
      kicker: "Mari bersekutu",
      t1: "Beribadah bersama,",
      t2: "bertumbuh bersama.",
      desc: "Jadwal ibadah raya, wadah pelayanan, ibadah sektor, dan ibadah unit di setiap sektor. Jadwal dapat diperbarui oleh admin.",
      generalTitle: "Ibadah Raya & Wadah Pelayanan",
      generalDesc: "Ibadah Minggu, kategorial, dan pelayanan khusus.",
      sectorTitle: "Ibadah Sektor",
      sectorDesc: "Ibadah bersama seluruh warga di masing-masing dari 4 sektor.",
      unitTitle: "Ibadah Unit",
      unitDesc: "Setiap sektor memiliki 2 unit ibadah."
    },
    items: [
      ...withIds("umum", [
        { kind: "umum", title: "Ibadah Minggu", tag: "Ibadah Raya", date: "Minggu, pukul 09:00 WIT", place: GEDUNG, useHost: false,
          desc: "Ibadah raya seluruh warga Jemaat GPM Hukurila setiap hari Minggu. Seluruh warga jemaat dan keluarga diundang untuk hadir." },
        { kind: "umum", title: "Angkatan Muda", tag: "Wadah Pelayanan", date: "Jumat, pukul 19:00 WIT", place: GEDUNG, useHost: true,
          desc: "Ibadah dan persekutuan Angkatan Muda Jemaat GPM Hukurila." },
        { kind: "umum", title: "Wadah Pelayanan Wanita", tag: "Wadah Pelayanan", date: "Kamis, pukul 17:00 WIT", place: GEDUNG, useHost: true,
          desc: "Ibadah dan persekutuan Wadah Pelayanan Wanita Jemaat GPM Hukurila." },
        { kind: "umum", title: "Wadah Pelayanan Laki-laki", tag: "Wadah Pelayanan", date: "Selasa, pukul 19:00 WIT", place: GEDUNG, useHost: true,
          desc: "Ibadah dan persekutuan Wadah Pelayanan Laki-laki Jemaat GPM Hukurila." },
        { kind: "umum", title: "Tunas Pekabaran Injil", tag: "Wadah Pelayanan", date: "Sabtu, pukul 16:00 WIT", place: GEDUNG, useHost: true,
          desc: "Ibadah dan pembinaan Tunas Pekabaran Injil Jemaat GPM Hukurila." },
        { kind: "umum", title: "Ibadah Paduan Suara", tag: "Paduan Suara", date: "Sabtu, pukul 19:00 WIT", place: GEDUNG, useHost: true,
          desc: "Ibadah dan latihan Paduan Suara Jemaat GPM Hukurila." }
      ]),
      ...SECTOR_ORDER.map(sector => ({
        id: `sektor-${sector.toLowerCase()}`, published: true, kind: "sektor", sector, tag: "Ibadah Sektor", useHost: true,
        title: `Ibadah Sektor ${sector}`,
        date: "Jadwal diperbarui oleh admin sektor",
        place: `Tempat ibadah Sektor ${sector}`,
        desc: `Ibadah bersama seluruh warga Sektor ${sector}. Hari, jam, tempat, tuan rumah, dan pemimpin ibadah diperbarui oleh admin sektor.`
      })),
      ...SECTOR_ORDER.flatMap(sector => ["1", "2"].map(unit => ({
        id: `unit-${sector.toLowerCase()}-${unit}`, published: true, kind: "unit", sector, unit, tag: "Unit", useHost: true,
        title: `Sektor ${sector} — Unit ${unit}`,
        date: sector === "Nazareth" ? "Selasa, pukul 17:00 WIT" : "Sabtu, pukul 17:00 WIT",
        place: `Rumah tuan rumah Unit ${unit}`,
        desc: `Unit ibadah Sektor ${sector}. Tuan rumah dan pemimpin ibadah diperbarui oleh admin sektor.`
      })))
    ]
  },

  renungan: {
    heading: { kicker: "Firman yang menguatkan", title: "Renungan & Firman", desc: "Luangkan waktu sejenak untuk membaca dan merenungkan firman Tuhan." },
    items: []
  },
  kegiatan: {
    heading: { kicker: "Kehidupan bersama", title: "Kegiatan Jemaat", desc: "Ikuti kabar pelayanan, persekutuan, dan kegiatan yang membangun kehidupan jemaat." },
    items: []
  },
  galeri: {
    heading: { kicker: "Momen pelayanan", title: "Galeri Jemaat", desc: "Dokumentasi foto kegiatan dan kebersamaan Jemaat GPM Hukurila." },
    items: []
  },
  umkm: {
    heading: { kicker: "Karya dan kemandirian", title: "UMKM Jemaat", desc: "Dukung usaha dan produk karya warga jemaat." },
    items: withIds("umkm", [
      { title: "Tortilla Kelor", tag: "UMKM Ebenhaezer", image: "assets/umkm-tortilla-kelor.jpg", contact: "6285348460202",
        desc: "Olahan berbahan daun kelor untuk melengkapi pilihan camilan keluarga." },
      { title: "Sambal Goreng Singkong Hot", tag: "UMKM Ebenhaezer", image: "assets/umkm-sambal-goreng-singkong.jpg", contact: "6285348460202",
        desc: "Camilan singkong dengan tampilan berbumbu pedas." },
      { title: "Tortilla Ubi Ungu", tag: "UMKM Ebenhaezer", image: "assets/umkm-tortilla-ubi-ungu.jpg", contact: "6285348460202",
        desc: "Olahan ubi ungu dengan warna alami yang menarik." },
      { title: "Puding Sayur Karang", tag: "UMKM Ebenhaezer", image: "assets/umkm-puding-sayur-karang.jpg", contact: "6285348460202",
        desc: "Puding dengan bahan hasil laut, dikemas untuk pilihan sajian keluarga." }
    ])
  },
  "informasi-lain": {
    heading: { kicker: "Informasi · Pengumuman", title: "Pengumuman", desc: "Informasi penting, pengumuman pelayanan, dan kabar lain untuk warga jemaat." },
    items: []
  },
  kontak: {
    heading: {
      eyebrow: "Informasi · Kontak & Peta",
      t1: "Terhubung dalam", t2: "Pelayanan.",
      desc: "Ikuti perjalanan pelayanan Jemaat GPM Hukurila. Dapatkan informasi kegiatan, kabar jemaat, dokumentasi, dan pesan-pesan rohani melalui media sosial kami.",
      locLabel: "LOKASI PELAYANAN",
      locTitle: "Temukan Jemaat GPM Hukurila",
      footerLine: "Bersama bertumbuh dalam iman, kasih, dan pelayanan."
    },
    info: {
      address: "766Q+J8F, Hukurila, Kec. Leitimur Selatan, Kota Ambon, Maluku.",
      phone: "",
      mapUrl: "https://www.google.com/maps/search/?api=1&query=766Q%2BJ8F%20Hukurila%20Ambon"
    },
    socials: withIds("sosmed", [
      { platform: "Instagram", handle: "@jemaatgpmhukurila28",
        desc: "Lihat dokumentasi kegiatan, momen kebersamaan, dan kabar pelayanan jemaat.",
        url: "https://www.instagram.com/jemaatgpmhukurila28?rpxt=MXdyYWRwdmU3cTl1" },
      { platform: "TikTok", handle: "@jemaathukurila",
        desc: "Saksikan video singkat, aktivitas pelayanan, dan berbagai momen inspiratif.",
        url: "https://www.tiktok.com/@jemaathukurila?_r=1&_t=ZS-9B1OmrrKtCq" },
      { platform: "Facebook", handle: "Jemaat GPM Hukurila",
        desc: "Ikuti informasi gerejawi, pengumuman, berita, dan kegiatan jemaat.",
        url: "https://www.facebook.com/profile.php?id=61572652554900" }
    ])
  }
};
const DEFAULT_ADDRESS = DEFAULTS.kontak.info.address;
const DEFAULT_MAP_EMBED = "https://www.google.com/maps?q=766Q%2BJ8F%2C%20Hukurila%2C%20Ambon%2C%20Maluku&output=embed";

/* ---------- Penyimpanan konten melalui Supabase ---------- */
let stored = {};
let deletedWorshipIds = new Set();
let remoteWorshipRows = [];

function getPart(sec, part) {
  const def = DEFAULTS[sec]?.[part];
  const val = stored[sec]?.[part];
  if (sec === "ibadah" && part === "items") {
    const defaults = clone(Array.isArray(def) ? def : []);
    const remote = Array.isArray(val) ? val : [];
    const byId = new Map(remote.filter(x => !x.deleted).map(x => [String(x.id), x]));
    const merged = defaults
      .filter(x => !deletedWorshipIds.has(String(x.id)))
      .map(x => byId.has(String(x.id)) ? { ...x, ...byId.get(String(x.id)) } : x);
    const defaultIds = new Set(defaults.map(x => String(x.id)));
    remote.filter(x => !x.deleted && !defaultIds.has(String(x.id))).forEach(x => merged.push(x));
    return merged;
  }
  if (Array.isArray(def)) return clone(Array.isArray(val) ? val : def);
  return { ...clone(def || {}), ...(val || {}) };
}

async function loadStoreFromSupabase() {
  const { data, error } = await supabaseClient
    .from("site_content")
    .select("section, part, sector, item_key, data, published");
  if (error) throw error;

  const next = {};
  deletedWorshipIds = new Set();
  remoteWorshipRows = [];
  for (const row of (data || [])) {
    if (row.section === "ibadah" && row.part === "items") {
      remoteWorshipRows.push(row);
      if (row.data?.deleted && row.data?.id) deletedWorshipIds.add(String(row.data.id));
      else {
        next.ibadah = next.ibadah || {};
        next.ibadah.items = next.ibadah.items || [];
        next.ibadah.items.push({ ...(row.data || {}), sector: row.sector || "" });
      }
    } else if (row.item_key === "__single__") {
      next[row.section] = next[row.section] || {};
      next[row.section][row.part] = row.data;
    }
  }
  stored = next;
}

async function savePartToSupabase(sec, part, value) {
  const nowUser = (await supabaseClient.auth.getUser()).data.user;
  if (!nowUser) throw new Error("Sesi login tidak ditemukan. Silakan login kembali.");

  if (sec === "ibadah" && part === "items") {
    const isSectorAdmin = !!currentUser?.sector;
    const ownSector = currentUser?.sector || "";
    let existingQuery = supabaseClient
      .from("site_content")
      .select("item_key, sector, data")
      .eq("section", "ibadah")
      .eq("part", "items");
    if (isSectorAdmin) existingQuery = existingQuery.eq("sector", ownSector);
    const { data: existing, error: readError } = await existingQuery;
    if (readError) throw readError;

    const defaults = DEFAULTS.ibadah.items;
    const desired = value.filter(x => !isSectorAdmin || x.sector === ownSector);
    const desiredRows = desired.map(item => ({
      section: "ibadah", part: "items", sector: item.sector || "",
      item_key: String(item.id), data: item,
      published: item.published !== false, updated_by: nowUser.id
    }));

    // Item bawaan yang dihapus disimpan sebagai penanda agar tidak muncul lagi dari DEFAULTS.
    const presentIds = new Set(desired.map(x => String(x.id)));
    const tombstones = defaults
      .filter(x => (!isSectorAdmin || x.sector === ownSector) && !presentIds.has(String(x.id)))
      .map(item => ({
        section: "ibadah", part: "items", sector: item.sector || "",
        item_key: String(item.id), data: { id: item.id, deleted: true },
        published: true, updated_by: nowUser.id
      }));
    const rowsToSave = [...desiredRows, ...tombstones];

    if (rowsToSave.length) {
      const { error } = await supabaseClient.from("site_content").upsert(rowsToSave, {
        onConflict: "section,part,sector,item_key"
      });
      if (error) throw error;
    }

    const keepKeys = new Set(rowsToSave.map(x => x.item_key));
    for (const row of (existing || [])) {
      if (!keepKeys.has(String(row.item_key))) {
        const { error } = await supabaseClient.from("site_content")
          .delete().eq("section", "ibadah").eq("part", "items")
          .eq("sector", row.sector || "").eq("item_key", row.item_key);
        if (error) throw error;
      }
    }
  } else {
    if (currentUser?.sector) throw new Error("Admin Sektor tidak memiliki izin mengubah bagian ini.");
    const { error } = await supabaseClient.from("site_content").upsert({
      section: sec, part, sector: "", item_key: "__single__",
      data: value, published: true, updated_by: nowUser.id
    }, { onConflict: "section,part,sector,item_key" });
    if (error) throw error;
  }

  await loadStoreFromSupabase();
}

async function setPart(sec, part, value) {
  await savePartToSupabase(sec, part, value);
}

function getByPath(path) {
  const [sec, part, field] = path.split(".");
  return getPart(sec, part)[field];
}

/* =====================================================================
   Bagian 2: menampilkan isi di layar pengunjung
===================================================================== */

const FEATURE_LABEL = {
  renungan: "Renungan", kegiatan: "Berita & Kegiatan", galeri: "Galeri",
  umkm: "UMKM", "informasi-lain": "Pengumuman", ibadah: "Jadwal Ibadah"
};
const DAY_NAMES = ["minggu", "senin", "selasa", "rabu", "kamis", "jumat", "sabtu"];

const ICONS = {
  church: '<path d="M12 2v5M10 4.5h4"/><path d="M6 22V11l6-4 6 4v11"/><path d="M2 22h20"/><path d="M10 22v-5a2 2 0 0 1 4 0v5"/>',
  cal: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
  tag: '<path d="M12.6 2.6a2 2 0 0 0-1.4-.6H4a2 2 0 0 0-2 2v7.2a2 2 0 0 0 .6 1.4l8.7 8.7a2.4 2.4 0 0 0 3.4 0l6.6-6.6a2.4 2.4 0 0 0 0-3.4z"/><circle cx="7.5" cy="7.5" r="1.2"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4.5 21c.5-4.2 3.2-6.5 7.5-6.5s7 2.3 7.5 6.5"/>',
  home: '<path d="M3 11 12 3l9 8"/><path d="M5 10v11h14V10"/>'
};
const icon = name => `<svg class="ico" viewBox="0 0 24 24" aria-hidden="true">${ICONS[name]}</svg>`;

const lines = text => String(text || "").split("\n").map(s => s.trim()).filter(Boolean);
const usesHost = item => item.kind === "unit" || item.kind === "sektor" || !!item.useHost;

/* ---------- Teks & foto otomatis dari atribut data-t / data-img ---------- */
function bindStatic() {
  document.querySelectorAll("[data-t]").forEach(el => {
    const v = getByPath(el.dataset.t);
    if (typeof v === "string") el.textContent = v;
  });
  document.querySelectorAll("[data-img]").forEach(el => {
    const url = safeUrl(getByPath(el.dataset.img));
    if (url) el.src = url; else el.removeAttribute("src");
    el.hidden = !url;
  });
  document.querySelectorAll("[data-wrap-for]").forEach(el => {
    el.hidden = !safeUrl(getByPath(el.dataset.wrapFor));
  });
  document.querySelectorAll("[data-list]").forEach(el => {
    el.innerHTML = lines(getByPath(el.dataset.list)).map(x => `<li>${escapeHtml(x)}</li>`).join("");
  });
  const bg = safeUrl(getPart("beranda", "main").bg);
  document.querySelector(".hero")?.style.setProperty("--hero-img", bg ? `url("${bg.replace(/"/g, "%22")}")` : "none");
}

/* ---------- Struktur kepengurusan ---------- */
function renderOrganisasi() {
  $("orgPimpinan").innerHTML = getPart("organisasi", "pimpinan").map(p => `
    <article class="org-person-card">
      <span class="org-position">${escapeHtml(p.position)}</span>
      <h4>${escapeHtml(p.name)}</h4>
    </article>`).join("");

  $("orgSeksi").innerHTML = getPart("organisasi", "seksi").map(s => {
    const subs = lines(s.subs).map(line => {
      const [tasksPart, ...pj] = line.split("|");
      const tasks = tasksPart.split(";").map(x => x.trim()).filter(Boolean);
      return `<div class="org-subitem"><ul>${tasks.map(t => `<li>${escapeHtml(t)}</li>`).join("")}</ul>${pj.length ? `<strong>${escapeHtml(pj.join("|").trim())}</strong>` : ""}</div>`;
    }).join("");
    return `
    <div class="org-section">
      <div class="org-section-title">
        <h3>${escapeHtml(s.name)}</h3>
        ${s.ketua ? `<p>Ketua: ${escapeHtml(s.ketua)}</p>` : ""}
      </div>
      <div class="org-subtitle">SUB SEKSI PELAYANAN</div>
      ${subs}
    </div>`;
  }).join("");

  $("orgSektor").innerHTML = getPart("organisasi", "sektor").map(s => `
    <div class="org-sector">
      <h3>${escapeHtml(s.name)}</h3>
      <div class="org-units">${lines(s.units).map(u => `<span>${escapeHtml(u)}</span>`).join("")}</div>
    </div>`).join("");
}

/* ---------- Jadwal ibadah ---------- */
function nowInWIT() {
  const p = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jayapura", year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hour12: false
  }).formatToParts(new Date()).reduce((a, x) => (a[x.type] = x.value, a), {});
  return { y: +p.year, m: +p.month, d: +p.day, minutes: (+p.hour % 24) * 60 + +p.minute };
}
function nextOccurrence(text) {
  const t = String(text || "").toLowerCase().replace(/['’`]/g, "");
  const dow = DAY_NAMES.findIndex(d => t.includes(d));
  if (dow < 0) return "";
  const tm = t.match(/(\d{1,2})[:.](\d{2})/);
  const at = tm ? (+tm[1]) * 60 + (+tm[2]) : 24 * 60;
  const now = nowInWIT();
  const base = new Date(Date.UTC(now.y, now.m - 1, now.d));
  let diff = (dow - base.getUTCDay() + 7) % 7;
  if (diff === 0 && now.minutes >= at) diff = 7;
  base.setUTCDate(base.getUTCDate() + diff);
  return new Intl.DateTimeFormat("id-ID", { timeZone: "UTC", weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(base);
}

function scheduleCard(item) {
  const next = nextOccurrence(item.date);
  const tag = item.tag || (item.kind === "unit" ? "Unit" : item.kind === "sektor" ? "Ibadah Sektor" : "Wadah Pelayanan");
  const host = usesHost(item);
  const detail = [
    item.desc || "",
    item.place ? `Tempat: ${item.place}` : "",
    host && item.host ? `Tuan rumah: ${item.host}` : "",
    host && item.leader ? `Pemimpin ibadah: ${item.leader}` : "",
    next ? `Berikutnya: ${next}` : ""
  ].filter(Boolean).join("\n\n");

  return `
    <article class="schedule-card" data-sector="${escapeHtml(item.sector || "")}">
      <div class="schedule-icon">${icon("church")}</div>
      <h3>${escapeHtml(item.title || "Ibadah")}</h3>

      <ul class="schedule-meta">
        ${item.date ? `<li>${icon("cal")}<span>${escapeHtml(item.date)}</span></li>` : ""}
        ${item.place ? `<li>${icon("pin")}<span>${escapeHtml(item.place)}</span></li>` : ""}
        ${host && item.host ? `<li>${icon("home")}<span>Tuan rumah: ${escapeHtml(item.host)}</span></li>` : ""}
        ${host && item.leader ? `<li>${icon("user")}<span>Pemimpin ibadah: ${escapeHtml(item.leader)}</span></li>` : ""}
        <li>${icon("tag")}<span>${escapeHtml(tag)}</span></li>
      </ul>

      ${item.desc ? `<p class="schedule-desc">${escapeHtml(item.desc)}</p>` : ""}

      <div class="schedule-foot">
        ${next ? `<div class="schedule-next">${icon("clock")}<span>Berikutnya: ${escapeHtml(next)}</span></div>` : ""}
        <button type="button" class="schedule-btn"
          data-detail-title="${escapeHtml(item.title || "Jadwal Ibadah")}"
          data-detail-category="Jadwal Ibadah · ${escapeHtml(tag)}"
          data-detail-date="${escapeHtml(item.date || "")}"
          data-detail-content="${escapeHtml(detail || "Belum ada keterangan lengkap.")}">
          ${icon("arrow")}<span>Lihat Detail</span>
        </button>
      </div>
    </article>`;
}

let currentSectorFilter = "semua";
function renderWorship() {
  const list = getPart("ibadah", "items").filter(x => x.published !== false);
  const general = list.filter(x => x.kind !== "unit" && x.kind !== "sektor");
  const sectors = list.filter(x => x.kind === "sektor").sort((a, b) => SECTOR_ORDER.indexOf(a.sector) - SECTOR_ORDER.indexOf(b.sector));
  const units = list.filter(x => x.kind === "unit").sort((a, b) =>
    SECTOR_ORDER.indexOf(a.sector) - SECTOR_ORDER.indexOf(b.sector) || String(a.unit).localeCompare(String(b.unit)));

  $("worshipGeneral").innerHTML = general.length
    ? general.map(scheduleCard).join("")
    : `<div class="empty-state dark">Jadwal ibadah raya belum ditambahkan.</div>`;
  $("worshipSector").innerHTML = sectors.length
    ? sectors.map(scheduleCard).join("")
    : `<div class="empty-state dark">Jadwal ibadah sektor belum ditambahkan.</div>`;
  $("worshipContent").innerHTML = units.length
    ? units.map(scheduleCard).join("")
    : `<div class="empty-state dark">Jadwal ibadah unit belum ditambahkan.</div>`;
  applySectorFilter();
}
function applySectorFilter() {
  $("worshipContent").querySelectorAll(".schedule-card").forEach(c => {
    c.hidden = currentSectorFilter !== "semua" && c.dataset.sector !== currentSectorFilter;
  });
  document.querySelectorAll("#worshipFilter .chip").forEach(chip => {
    const on = chip.dataset.sector === currentSectorFilter;
    chip.classList.toggle("active", on);
    chip.setAttribute("aria-pressed", String(on));
  });
}

/* ---------- Kartu renungan / berita / pengumuman, galeri, UMKM ---------- */
function card(item, category) {
  const img = safeUrl(item.image || "");
  const label = FEATURE_LABEL[category] || "Informasi";
  const body = item.excerpt || item.content || "";
  return `
    <article class="content-card">
      ${img ? `<img src="${escapeHtml(img)}" alt="${escapeHtml(item.title)}" loading="lazy">` : ""}
      <div class="card-body">
        <span class="card-tag">${escapeHtml(label)}</span>
        <h3>${escapeHtml(item.title || "Tanpa judul")}</h3>
        ${item.date ? `<div class="card-meta">${escapeHtml(item.date)}</div>` : ""}
        <p>${escapeHtml(body)}</p>
        ${category === "renungan" ? `<button type="button" class="devotion-download" data-download-title="${escapeHtml(item.title || "Renungan")}" data-download-content="${escapeHtml(item.content || item.excerpt || "")}">Unduh renungan ↓</button>` : ""}
        <button type="button" class="content-read-more"
          data-detail-title="${escapeHtml(item.title || "Informasi")}"
          data-detail-category="${escapeHtml(label)}"
          data-detail-date="${escapeHtml(item.date || "")}"
          data-detail-content="${escapeHtml(item.content || item.excerpt || "Belum ada keterangan lengkap.")}"
          ${img ? `data-detail-image="${escapeHtml(img)}"` : ""}>
          Baca selengkapnya <span aria-hidden="true">→</span>
        </button>
      </div>
    </article>`;
}

function renderCards(category, targetId, emptyText) {
  const items = getPart(category, "items").filter(x => x.published !== false);
  $(targetId).innerHTML = items.length ? items.map(i => card(i, category)).join("") : `<div class="empty-state">${emptyText}</div>`;
}

function renderGallery() {
  const items = getPart("galeri", "items").filter(x => x.published !== false);
  $("galleryContent").innerHTML = items.length ? items.map(item => {
    const img = safeUrl(item.image || "");
    if (!img) return card(item, "galeri");
    return `
      <figure class="gallery-item">
        <img src="${escapeHtml(img)}" alt="${escapeHtml(item.title)}" loading="lazy">
        <figcaption>
          ${escapeHtml(item.title)}${item.date ? ` · ${escapeHtml(item.date)}` : ""}
          <button type="button" class="content-read-more"
            data-detail-title="${escapeHtml(item.title || "Galeri Jemaat")}"
            data-detail-category="Galeri Jemaat"
            data-detail-date="${escapeHtml(item.date || "")}"
            data-detail-content="${escapeHtml(item.content || item.excerpt || item.title || "Dokumentasi kegiatan Jemaat GPM Hukurila.")}"
            data-detail-image="${escapeHtml(img)}">Lihat foto &amp; detail →</button>
        </figcaption>
      </figure>`;
  }).join("") : `<div class="empty-state">Foto galeri akan ditampilkan setelah ditambahkan melalui dashboard admin.</div>`;
}

function contactHref(c) {
  const v = String(c || "").trim();
  if (!v) return "";
  if (/^https?:\/\//i.test(v)) return v;
  let d = v.replace(/\D/g, "");
  if (!d) return "";
  if (d.startsWith("0")) d = "62" + d.slice(1);
  return "https://wa.me/" + d;
}

function renderUmkm() {
  const items = getPart("umkm", "items").filter(x => x.published !== false);
  $("umkmContent").innerHTML = items.length ? items.map(p => {
    const img = safeUrl(p.image || "");
    const href = contactHref(p.contact);
    const detail = (p.content || p.desc || "") + (href ? "\n\nUntuk pemesanan, silakan gunakan tombol Hubungi Penjual pada kartu produk." : "");
    return `
    <article class="umkm-product">
      ${img ? `<img src="${escapeHtml(img)}" alt="${escapeHtml(p.title)}" loading="lazy">` : ""}
      <div class="umkm-product-body">
        ${p.tag ? `<span class="card-tag">${escapeHtml(p.tag)}</span>` : ""}
        <h3>${escapeHtml(p.title)}</h3>
        <p>${escapeHtml(p.desc || "")}</p>
        <div class="umkm-actions">
          ${href ? `<a class="umkm-order" href="${escapeHtml(href)}" target="_blank" rel="noopener">Hubungi Penjual <span aria-hidden="true">↗</span></a>` : ""}
          <button type="button" class="umkm-detail"
            data-detail-title="${escapeHtml(p.title)}" data-detail-category="UMKM Jemaat"
            data-detail-content="${escapeHtml(detail || "Belum ada keterangan lengkap.")}"
            ${img ? `data-detail-image="${escapeHtml(img)}"` : ""}>Lihat Detail Produk</button>
        </div>
      </div>
    </article>`;
  }).join("") : `<div class="empty-state">Produk UMKM akan ditampilkan di sini.</div>`;
}

const SOCIAL_ICONS = {
  instagram: '<rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="18" cy="6" r="1.3" fill="currentColor"/>',
  tiktok: '<path d="M15 3c.4 3 2.1 4.8 5 5v4c-2 0-3.7-.6-5-1.7v6.2a5.5 5.5 0 1 1-5.5-5.5c.5 0 1 .1 1.5.2v4a2 2 0 1 0 0 3.3V3h4z" fill="currentColor"/>',
  facebook: '<path d="M13.5 21v-8h2.8l.4-3h-3.2V8.1c0-.9.3-1.5 1.6-1.5h1.7V3.9c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3V10H7.3v3h2.8v8h3.4z" fill="currentColor"/>',
  other: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>'
};
function renderKontak() {
  const info = getPart("kontak", "info");
  const socials = getPart("kontak", "socials").filter(s => safeUrl(s.url));
  $("socialGrid").innerHTML = socials.map(s => {
    const key = /instagram/i.test(s.platform) ? "instagram" : /tiktok/i.test(s.platform) ? "tiktok" : /facebook/i.test(s.platform) ? "facebook" : "other";
    return `
      <a href="${escapeHtml(safeUrl(s.url))}" class="social-card ${key === "other" ? "" : key + "-card"}" target="_blank" rel="noopener noreferrer">
        <div class="social-card-top">
          <div class="social-icon ${key === "other" ? "" : key + "-icon"}"><svg viewBox="0 0 24 24" aria-hidden="true">${SOCIAL_ICONS[key]}</svg></div>
          <span class="social-arrow" aria-hidden="true">↗</span>
        </div>
        <span class="social-platform">${escapeHtml(String(s.platform || "").toUpperCase())}</span>
        <h3>${escapeHtml(s.handle || s.platform)}</h3>
        <p>${escapeHtml(s.desc || "")}</p>
        <span class="social-visit">Kunjungi ${escapeHtml(s.platform)} <b>→</b></span>
      </a>`;
  }).join("");

  $("contactPhoneRow").hidden = !String(info.phone || "").trim();
  const q = encodeURIComponent(info.address || "");
  $("mapLink").href = safeUrl(info.mapUrl) || `https://www.google.com/maps/search/?api=1&query=${q}`;
  $("mapFrame").src = (info.address === DEFAULT_ADDRESS || !info.address) ? DEFAULT_MAP_EMBED : `https://www.google.com/maps?q=${q}&output=embed`;
}

function printOrganization() { window.print(); }

function renderAll() {
  bindStatic();
  renderOrganisasi();
  renderWorship();
  renderCards("renungan", "devotionContent", "Renungan akan ditampilkan di sini setelah diterbitkan oleh admin.");
  renderCards("kegiatan", "activityContent", "Berita dan kegiatan akan ditampilkan di sini.");
  renderCards("informasi-lain", "otherInfoContent", "Pengumuman akan ditampilkan di sini.");
  renderGallery();
  renderUmkm();
  renderKontak();
}

/* ---------- Pop-up detail konten ---------- */
function initContentModal() {
  if ($("contentDetailModal")) return;
  const modal = document.createElement("div");
  modal.id = "contentDetailModal";
  modal.className = "content-modal";
  modal.setAttribute("aria-hidden", "true");
  modal.innerHTML = `
    <div class="content-modal-panel" role="dialog" aria-modal="true" aria-labelledby="contentModalTitle">
      <button type="button" class="content-modal-close" aria-label="Tutup jendela">×</button>
      <img class="content-modal-image" alt="" hidden>
      <div class="content-modal-body">
        <span class="card-tag" id="contentModalCategory"></span>
        <div class="card-meta" id="contentModalDate"></div>
        <h2 id="contentModalTitle"></h2>
        <div class="content-modal-text pl" id="contentModalText"></div>
      </div>
    </div>`;
  document.body.appendChild(modal);

  const close = () => {
    modal.classList.remove("active");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("content-modal-open");
  };
  modal.querySelector(".content-modal-close").addEventListener("click", close);
  modal.addEventListener("click", e => { if (e.target === modal) close(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && modal.classList.contains("active")) close(); });

  document.addEventListener("click", e => {
    const t = e.target.closest("[data-detail-title]");
    if (!t) return;
    $("contentModalTitle").textContent = t.dataset.detailTitle || "Informasi";
    $("contentModalCategory").textContent = t.dataset.detailCategory || "Informasi";
    $("contentModalDate").textContent = t.dataset.detailDate || "";
    $("contentModalText").textContent = t.dataset.detailContent || "Belum ada keterangan lengkap.";
    const image = modal.querySelector(".content-modal-image");
    const url = safeUrl(t.dataset.detailImage || "");
    image.hidden = !url;
    if (url) image.src = url; else image.removeAttribute("src");
    modal.classList.add("active");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("content-modal-open");
    modal.querySelector(".content-modal-close").focus();
  });
}

/* ---------- Pop-up profil ---------- */
function initProfileModal() {
  const m = $("profileModal");
  const show = () => { m.classList.add("active"); document.body.classList.add("profile-modal-open"); };
  const hide = () => { m.classList.remove("active"); document.body.classList.remove("profile-modal-open"); };
  $("openProfile")?.addEventListener("click", show);
  $("closeProfile")?.addEventListener("click", hide);
  $("closeProfileBottom")?.addEventListener("click", hide);
  m.addEventListener("click", e => { if (e.target === m) hide(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && m.classList.contains("active")) hide(); });
}

/* ---------- Menu navigasi, sorotan menu aktif ---------- */
function initNav() {
  const menuToggle = $("menuToggle"), mainNav = $("mainNav");
  const navInfo = $("navInfo"), navInfoToggle = $("navInfoToggle");

  const setInfo = open => { navInfo.classList.toggle("open", open); navInfoToggle.setAttribute("aria-expanded", String(open)); };
  const closeMenu = () => {
    mainNav.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.textContent = "☰";
    setInfo(false);
  };

  menuToggle.addEventListener("click", () => {
    const open = mainNav.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.textContent = open ? "✕" : "☰";
  });
  mainNav.querySelectorAll("a").forEach(a => a.addEventListener("click", closeMenu));

  navInfoToggle.addEventListener("click", e => { e.stopPropagation(); setInfo(!navInfo.classList.contains("open")); });
  document.addEventListener("click", e => { if (!navInfo.contains(e.target)) setInfo(false); });
  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && navInfo.classList.contains("open")) { setInfo(false); navInfoToggle.focus(); }
  });

  /* Sorotan menu aktif: bagian terakhir yang sudah melewati bagian atas layar */
  const spy = [
    ["beranda", "#beranda"], ["profil", "#profil"], ["organisasi", "#organisasi"],
    ["seksi-pelayanan", "#seksi-pelayanan"], ["ibadah", "#ibadah"], ["renungan", "#renungan"],
    ["kegiatan", "#kegiatan"], ["galeri", "#galeri"],
    ["umkm", "info"], ["informasi-lain", "info"], ["kontak", "info"]
  ].map(([id, target]) => ({ el: $(id), target })).filter(x => x.el);
  const links = [...mainNav.querySelectorAll("a[href^='#']")];

  let ticking = false;
  const update = () => {
    ticking = false;
    const hdr = document.querySelector(".site-header");
    const line = (hdr ? hdr.offsetHeight : 72) + 24;
    let current = spy[0];
    for (const s of spy) if (s.el.getBoundingClientRect().top <= line) current = s;
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) current = spy[spy.length - 1];
    links.forEach(a => a.classList.toggle("active", a.getAttribute("href") === current.target));
    navInfoToggle.classList.toggle("active", current.target === "info");
  };
  window.addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  window.addEventListener("resize", update);
  update();
}

function initPublic() {
  $("year").textContent = new Date().getFullYear();
  initNav();
  initProfileModal();
  initContentModal();

  $("worshipFilter").addEventListener("click", e => {
    const chip = e.target.closest(".chip");
    if (!chip) return;
    currentSectorFilter = chip.dataset.sector;
    applySectorFilter();
  });

  document.addEventListener("click", e => {
    const btn = e.target.closest("[data-download-title]");
    if (!btn) return;
    const blob = new Blob([btn.dataset.downloadTitle + "\n\n" + btn.dataset.downloadContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob), a = document.createElement("a");
    a.href = url;
    a.download = (btn.dataset.downloadTitle || "renungan").toLowerCase().replace(/[^a-z0-9]+/g, "-") + ".txt";
    a.click();
    URL.revokeObjectURL(url);
  });

  renderAll();

  const reveal = document.querySelectorAll("main section, .section-heading, .org-section, .org-sector");
  reveal.forEach(el => el.classList.add("scroll-reveal"));
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add("show"); io.unobserve(en.target); } });
    }, { threshold: 0.12 });
    reveal.forEach(el => io.observe(el));
  } else reveal.forEach(el => el.classList.add("show"));
}

/* =====================================================================
   Bagian 3: PANEL ADMIN
   Admin Utama  → semua fitur: tambah, edit, ganti foto, hapus.
   Admin Sektor → hanya jadwal ibadah sektornya + ubah kata sandi.
   (Akun, kata sandi, dan hak akses tidak diubah.)
===================================================================== */

const ROLES = {admingereja:{name:"Admin Utama",sector:null},adminsektor1:{name:"Admin Sektor Nazareth",sector:"Nazareth"},adminsektor2:{name:"Admin Sektor Tiberias",sector:"Tiberias"},adminsektor3:{name:"Admin Sektor Getsemani",sector:"Getsemani"},adminsektor4:{name:"Admin Sektor Efata",sector:"Efata"}};

let currentUser = null;
let activeFeature = "";
let activePart = "";
let editingId = null;
let imgState = {};

/* ---------- Definisi kolom isian ---------- */
const T = (n, l, extra = {}) => ({ n, l, t: "text", ...extra });
const A = (n, l, extra = {}) => ({ n, l, t: "area", ...extra });
const IMG = (n, l, extra = {}) => ({ n, l, t: "image", ...extra });
const CHK = (n, l, extra = {}) => ({ n, l, t: "check", ...extra });
const PUBLISHED = CHK("published", "Tampilkan di website publik");

const SECTOR_OPTS = SECTOR_ORDER.map(s => [s, s]);
const heading3 = [T("kicker", "Tulisan kecil di atas judul"), T("title", "Judul bagian"), A("desc", "Kalimat pengantar", { rows: 2 })];

function cardPart(label, titleLabel, dateLabel, opts = {}) {
  return {
    key: "items", tab: "Daftar " + label, type: "list", top: true, reorder: true,
    blank: { published: true },
    fields: [
      T("title", titleLabel, { req: true }),
      T("date", dateLabel, { ph: "Opsional" }),
      IMG("image", "Foto / gambar" + (opts.imgReq ? " (wajib)" : ""), { req: !!opts.imgReq }),
      A("excerpt", "Ringkasan / keterangan singkat", { rows: 3 }),
      A("content", "Isi lengkap / detail", { rows: 6 }),
      PUBLISHED
    ],
    rowTitle: it => it.title || "(tanpa judul)",
    rowSub: it => it.date || ""
  };
}

const FEATURES = {
  ibadah: {
    label: "Jadwal Ibadah", icon: "cal",
    menuDesc: "Ibadah raya, wadah pelayanan, sektor, dan unit",
    desc: "Kelola jadwal ibadah raya, wadah pelayanan, ibadah sektor, dan ibadah unit.",
    parts: [
      {
        key: "items", tab: "Daftar Ibadah", type: "list", reorder: false,
        blank: { kind: "umum", sector: "Nazareth", unit: "1", published: true, useHost: false },
        fields: [
          { n: "kind", l: "Kelompok ibadah", t: "select", opts: [["umum", "Ibadah Raya / Wadah Pelayanan"], ["sektor", "Ibadah Sektor"], ["unit", "Ibadah Unit (per sektor)"]] },
          { n: "sector", l: "Sektor", t: "select", opts: SECTOR_OPTS, show: v => v.kind === "unit" || v.kind === "sektor" },
          { n: "unit", l: "Unit", t: "select", opts: [["1", "Unit 1"], ["2", "Unit 2"]], show: v => v.kind === "unit" },
          T("title", "Nama ibadah", { ph: "Kosongkan untuk ibadah sektor/unit agar terisi otomatis", show: v => v.kind !== "unit" }),
          T("tag", "Jenis (contoh: Wadah Pelayanan)", { ph: "Opsional", show: v => v.kind !== "unit" }),
          T("date", "Hari dan jam ibadah", { ph: "Contoh: Rabu, pukul 17:00 WIT" }),
          T("place", "Tempat ibadah", { ph: "Contoh: Rumah Keluarga ..." }),
          CHK("useHost", "Ibadah ini memakai nama tuan rumah dan pemimpin ibadah", { show: v => v.kind === "umum" }),
          T("host", "Nama tuan rumah", { show: v => v.kind === "unit" || v.kind === "sektor" || v.useHost }),
          T("leader", "Nama pemimpin ibadah", { show: v => v.kind === "unit" || v.kind === "sektor" || v.useHost }),
          A("desc", "Keterangan tambahan", { rows: 3 }),
          PUBLISHED
        ],
        rowTitle: it => it.title || "(tanpa nama)",
        rowSub: it => [it.kind === "unit" ? `Sektor ${it.sector} · Unit ${it.unit}` : it.kind === "sektor" ? `Ibadah Sektor ${it.sector}` : "Ibadah raya / wadah pelayanan", it.date, it.leader ? "Pemimpin: " + it.leader : ""].filter(Boolean).join(" · ")
      },
      { key: "heading", tab: "Judul & Teks Bagian", type: "single", fields: [
        T("kicker", "Tulisan kecil di atas judul"), T("t1", "Judul (bagian pertama)"), T("t2", "Judul (bagian berwarna)"),
        A("desc", "Kalimat pengantar", { rows: 2 }),
        T("generalTitle", "Judul kelompok ibadah raya"), T("generalDesc", "Keterangan kelompok ibadah raya"),
        T("sectorTitle", "Judul kelompok ibadah sektor"), T("sectorDesc", "Keterangan kelompok ibadah sektor"),
        T("unitTitle", "Judul kelompok ibadah unit"), T("unitDesc", "Keterangan kelompok ibadah unit")
      ] }
    ]
  },

  beranda: {
    label: "Beranda", icon: "church", menuDesc: "Sambutan, foto & identitas situs",
    desc: "Kelola tampilan layar utama: sambutan, ayat, foto, dan identitas situs.",
    parts: [
      { key: "main", tab: "Layar Utama", type: "single", fields: [
        IMG("logo", "Logo bulat di bagian atas", { logo: true }),
        IMG("bg", "Foto latar belakang beranda"),
        T("eyebrow", "Tulisan kecil di atas judul"),
        T("line1", "Judul baris 1"), T("line2", "Judul baris 2 (berwarna emas)"),
        A("verse", "Ayat / kutipan", { rows: 3 }), T("verseRef", "Keterangan ayat"),
        T("btn1", "Tulisan tombol utama"), T("btn2", "Tulisan tautan jadwal ibadah"),
        T("note", "Tulisan kecil di kanan bawah")
      ] },
      { key: "situs", tab: "Identitas Situs", type: "single", fields: [
        T("brandName", "Nama jemaat (header & footer)"), T("tagline", "Tulisan kecil di header"), T("footerTagline", "Tulisan kecil di footer")
      ] }
    ]
  },

  profil: {
    label: "Profil", icon: "book", menuDesc: "Profil, visi, misi, sejarah",
    desc: "Kelola foto gereja, profil, visi, misi, dan sejarah jemaat.",
    parts: [
      { key: "main", tab: "Profil Jemaat", type: "single", fields: [
        IMG("image", "Foto gereja"),
        T("captionSmall", "Tulisan kecil pada foto"), T("captionTitle", "Judul pada foto"),
        T("label", "Label di atas judul"), T("title", "Judul profil"),
        A("intro", "Kalimat pengantar", { rows: 3 }),
        A("description", "Uraian profil", { rows: 8 }),
        A("visi", "Visi", { rows: 2 }),
        A("misi", "Misi (satu butir per baris)", { rows: 5, help: "Tekan Enter untuk memisahkan setiap butir misi." }),
        A("sejarah", "Sejarah singkat (pada pop-up Selengkapnya)", { rows: 6 })
      ] }
    ]
  },

  organisasi: {
    label: "Struktur Kepengurusan", icon: "org", menuDesc: "Majelis, seksi pelayanan & sektor",
    desc: "Kelola bagan, pimpinan majelis, seksi-seksi pelayanan, dan sektor jemaat.",
    parts: [
      { key: "info", tab: "Judul, Logo & Foto", type: "single", fields: [
        T("heading", "Judul bagian"), IMG("logo", "Logo pada kop bagan", { logo: true }),
        T("coverTitle", "Judul kop bagan"), T("coverSub", "Sub judul kop"), T("coverPeriod", "Periode (kop)"),
        IMG("photo", "Foto bersama pelayan"), T("photoCaption", "Keterangan foto"),
        T("majelisTitle", "Judul majelis"), T("majelisPeriod", "Periode majelis"), T("majelisLabel", "Label pimpinan harian"),
        T("seksiKicker", "Tulisan kecil seksi"), T("seksiTitle", "Judul seksi pelayanan"),
        T("sektorKicker", "Tulisan kecil sektor"), T("sektorTitle", "Judul sektor")
      ] },
      { key: "pimpinan", tab: "Pimpinan Harian", type: "list", reorder: true, blank: {},
        fields: [T("position", "Jabatan", { req: true }), T("name", "Nama", { req: true })],
        rowTitle: it => it.name, rowSub: it => it.position },
      { key: "seksi", tab: "Seksi Pelayanan", type: "list", reorder: true, blank: {},
        fields: [
          T("name", "Nama seksi", { req: true, ph: "Contoh: SEKSI PTPU" }),
          T("ketua", "Nama ketua seksi"),
          A("subs", "Sub seksi pelayanan (satu kelompok per baris)", { rows: 7,
            help: "Format tiap baris:  tugas 1; tugas 2 | nama penanggung jawab" })
        ],
        rowTitle: it => it.name, rowSub: it => it.ketua ? "Ketua: " + it.ketua : "" },
      { key: "sektor", tab: "Sektor & Unit", type: "list", reorder: true, blank: {},
        fields: [
          T("name", "Nama sektor", { req: true, ph: "Contoh: SEKTOR NAZARETH" }),
          A("units", "Daftar unit (satu per baris)", { rows: 3 })
        ],
        rowTitle: it => it.name, rowSub: it => lines(it.units).join(", ") }
    ]
  },

  kegiatan: {
    label: "Berita & Kegiatan", icon: "news", menuDesc: "Berita & kegiatan jemaat",
    desc: "Kelola berita dan kegiatan jemaat.",
    parts: [cardPart("Berita", "Judul berita / kegiatan", "Tanggal"),
            { key: "heading", tab: "Judul Bagian", type: "single", fields: heading3 }]
  },
  renungan: {
    label: "Renungan", icon: "sprout", menuDesc: "Renungan harian",
    desc: "Kelola renungan dan firman.",
    parts: [cardPart("Renungan", "Judul renungan", "Tanggal / Penulis"),
            { key: "heading", tab: "Judul Bagian", type: "single", fields: heading3 }]
  },
  galeri: {
    label: "Galeri", icon: "images", menuDesc: "Foto dokumentasi",
    desc: "Kelola foto dokumentasi kegiatan jemaat.",
    parts: [cardPart("Foto", "Judul foto", "Tanggal / Keterangan", { imgReq: true }),
            { key: "heading", tab: "Judul Bagian", type: "single", fields: heading3 }]
  },
  umkm: {
    label: "UMKM", icon: "bag", menuDesc: "Produk & usaha jemaat",
    desc: "Kelola produk UMKM jemaat. Semua produk yang tampil di website ada di daftar ini.",
    parts: [
      { key: "items", tab: "Daftar Produk", type: "list", reorder: true, blank: { published: true },
        fields: [
          T("title", "Nama produk", { req: true }),
          T("tag", "Nama usaha / label", { ph: "Contoh: UMKM Ebenhaezer" }),
          IMG("image", "Foto produk"),
          A("desc", "Deskripsi singkat produk", { rows: 3 }),
          A("content", "Detail produk dan informasi pemesanan", { rows: 4 }),
          T("contact", "Nomor WhatsApp penjual", { ph: "Contoh: 0853xxxxxxx (atau tautan https://...)", help: "Kosongkan jika tidak ada tombol Hubungi Penjual." }),
          PUBLISHED
        ],
        rowTitle: it => it.title, rowSub: it => it.tag || "" },
      { key: "heading", tab: "Judul Bagian", type: "single", fields: heading3 }
    ]
  },
  "informasi-lain": {
    label: "Pengumuman", icon: "mega", menuDesc: "Pengumuman & informasi penting",
    desc: "Kelola pengumuman dan informasi penting (menu Informasi → Pengumuman).",
    parts: [cardPart("Pengumuman", "Judul pengumuman", "Tanggal"),
            { key: "heading", tab: "Judul Bagian", type: "single", fields: heading3 }]
  },
  kontak: {
    label: "Kontak & Peta", icon: "phone", menuDesc: "Alamat, telepon, peta, media sosial",
    desc: "Kelola alamat, telepon, tautan peta, dan media sosial (menu Informasi → Kontak & Peta).",
    parts: [
      { key: "info", tab: "Alamat & Peta", type: "single", fields: [
        A("address", "Alamat jemaat", { rows: 2 }), T("phone", "Nomor telepon / email"),
        T("mapUrl", "Tautan Google Maps", { ph: "https://maps.google.com/..." })
      ] },
      { key: "socials", tab: "Media Sosial", type: "list", reorder: true, blank: {},
        fields: [
          T("platform", "Nama media sosial", { req: true, ph: "Instagram / TikTok / Facebook / YouTube ..." }),
          T("handle", "Nama akun", { ph: "@namaakun" }),
          A("desc", "Keterangan singkat", { rows: 2 }),
          T("url", "Tautan (https://...)", { req: true })
        ],
        rowTitle: it => it.platform, rowSub: it => it.handle || it.url },
      { key: "heading", tab: "Judul & Teks Bagian", type: "single", fields: [
        T("eyebrow", "Tulisan kecil"), T("t1", "Judul (bagian pertama)"), T("t2", "Judul (bagian berwarna)"),
        A("desc", "Kalimat pengantar", { rows: 3 }),
        T("locLabel", "Label lokasi"), T("locTitle", "Judul lokasi"), T("footerLine", "Kalimat penutup")
      ] }
    ]
  }
};

const MENU = [
  ...["ibadah", "beranda", "profil", "organisasi", "kegiatan", "renungan", "galeri", "umkm", "informasi-lain", "kontak"]
    .map(k => ({ key: k, label: FEATURES[k].label, desc: FEATURES[k].menuDesc, icon: FEATURES[k].icon, all: k === "ibadah" })),
  { key: "sandi", label: "Ubah Kata Sandi", desc: "Ganti kata sandi akun sendiri", icon: "lock", all: true }
];

/* ---------- Alat bantu ---------- */
const PW_RULE = /[!@#$%^&*()_+\-=\[\]{};:\\'",.<>/?|~`]/;
function passwordRulesOk(p) { return p.length >= 8 && /^[A-Z]/.test(p) && /[0-9]/.test(p) && PW_RULE.test(p); }
function updatePasswordChecks() {
  const p = $("pwNew").value;
  const checks = [p.length >= 8, /^[A-Z]/.test(p), /[0-9]/.test(p), PW_RULE.test(p)];
  document.querySelectorAll("[data-pass-check]").forEach((el, i) => {
    el.classList.toggle("valid", checks[i]);
    el.querySelector("span").textContent = checks[i] ? "✓" : "○";
  });
}
function showNotice(id, message, type = "error") {
  const el = $(id); if (el) el.innerHTML = `<div class="notice ${type}">${escapeHtml(message)}</div>`;
}
function clearNotice(id) { if ($(id)) $(id).innerHTML = ""; }

const newId = () => (crypto.randomUUID ? crypto.randomUUID() : "id-" + Date.now() + "-" + Math.random().toString(16).slice(2));

function canManage(item) {
  return !currentUser?.sector || ((item.kind === "unit" || item.kind === "sektor") && item.sector === currentUser.sector);
}
const featureOf = () => FEATURES[activeFeature];
function visibleParts() {
  const parts = featureOf().parts;
  return currentUser?.sector ? parts.filter(p => p.key === "items") : parts;
}
const partOf = () => visibleParts().find(p => p.key === activePart);
function lockVals() {
  return activeFeature === "ibadah" && currentUser?.sector ? { sector: currentUser.sector } : {};
}
function fieldsOf(part) {
  return part.fields;
}

/* ---------- Gambar: perkecil otomatis agar hemat penyimpanan ---------- */
function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) return reject(new Error("Pilih gambar JPG, PNG, atau WebP."));
    if (file.size > 8 * 1024 * 1024) return reject(new Error("Ukuran gambar terlalu besar (maksimal 8 MB)."));
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const png = file.type === "image/png";
      const max = png ? 900 : 1400;
      const ratio = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * ratio); c.height = Math.round(img.height * ratio);
      const ctx = c.getContext("2d");
      if (!png) { ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, c.width, c.height); }
      ctx.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      resolve(png ? c.toDataURL("image/png") : c.toDataURL("image/jpeg", 0.82));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Gagal membaca gambar.")); };
    img.src = url;
  });
}

/* ---------- Pembuat formulir ---------- */
function imageFieldHtml(f) {
  const url = safeUrl(imgState[f.n]);
  return `<div class="field full" data-f="${f.n}">
    <label>${escapeHtml(f.l)}</label>
    <div class="img-box">
      ${url ? `<img src="${escapeHtml(url)}" alt="Pratinjau" class="${f.logo ? "is-logo" : ""}" data-preview="${f.n}">` : `<div class="img-empty" data-preview="${f.n}">Belum ada foto</div>`}
      <div class="img-actions">
        <label class="adm-mini">${url ? "Ganti foto" : "Pilih foto"}<input type="file" accept="image/jpeg,image/png,image/webp" data-img-input="${f.n}"></label>
        ${url ? `<button type="button" class="adm-mini danger" data-img-clear="${f.n}">Hapus foto</button>` : ""}
      </div>
    </div>
    <small class="admin-help">JPG, PNG, atau WebP. Ukuran diperkecil otomatis.</small>
  </div>`;
}
function fieldHtml(f, val) {
  const lock = lockVals();
  if (f.t === "image") return imageFieldHtml(f);
  const help = f.help ? `<small class="admin-help">${escapeHtml(f.help)}</small>` : "";
  if (f.t === "check") {
    return `<div class="field full" data-f="${f.n}"><label class="check-row"><input type="checkbox" name="${f.n}" ${val ? "checked" : ""}> ${escapeHtml(f.l)}</label></div>`;
  }
  let ctl;
  if (f.t === "area") ctl = `<textarea id="f_${f.n}" name="${f.n}" rows="${f.rows || 3}">${escapeHtml(val ?? "")}</textarea>`;
  else if (f.t === "select") {
    const dis = lock[f.n] !== undefined ? "disabled" : "";
    const cur = lock[f.n] ?? val;
    const opts = f.n === "kind" && currentUser?.sector ? f.opts.filter(([v]) => v !== "umum") : f.opts;
    ctl = `<select id="f_${f.n}" name="${f.n}" ${dis}>${opts.map(([v, l]) => `<option value="${escapeHtml(v)}" ${String(cur) === String(v) ? "selected" : ""}>${escapeHtml(l)}</option>`).join("")}</select>`;
  } else ctl = `<input id="f_${f.n}" name="${f.n}" type="text" maxlength="300" value="${escapeHtml(val ?? "")}" ${f.ph ? `placeholder="${escapeHtml(f.ph)}"` : ""}>`;
  const wide = f.t === "area" || f.full ? "full" : "";
  return `<div class="field ${wide}" data-f="${f.n}"><label for="f_${f.n}">${escapeHtml(f.l)}${f.req ? " *" : ""}</label>${ctl}${help}</div>`;
}
function readForm(form, fields) {
  const vals = { ...lockVals() };
  fields.forEach(f => {
    if (f.t === "image") vals[f.n] = imgState[f.n] || "";
    else if (f.t === "check") vals[f.n] = !!form.elements[f.n]?.checked;
    else if (vals[f.n] === undefined) vals[f.n] = String(form.elements[f.n]?.value ?? "").trim();
  });
  return vals;
}
function applyShow(form, fields) {
  const vals = readForm(form, fields);
  fields.forEach(f => {
    if (!f.show) return;
    form.querySelector(`[data-f="${f.n}"]`)?.classList.toggle("hidden", !f.show(vals));
  });
}

/* ---------- Tampilan panel ---------- */
function renderMenu() {
  const restricted = !!currentUser.sector;
  $("menuGrid").innerHTML = MENU.filter(m => m.all || !restricted).map(m => {
    const desc = restricted && m.key === "ibadah" ? "Jadwal ibadah Sektor " + currentUser.sector : m.desc;
    return `<button type="button" class="adm-card" data-menu="${m.key}"><span class="adm-tile"><svg class="adm-ico" viewBox="0 0 24 24" aria-hidden="true"><use href="#i-${m.icon}"/></svg></span><span class="adm-card-text"><strong>${escapeHtml(m.label)}</strong><small>${escapeHtml(desc)}</small></span></button>`;
  }).join("");
}
function showMenu() {
  activeFeature = ""; activePart = ""; editingId = null;
  $("panelMenu").hidden = false; $("panelWork").hidden = true;
  $("editorHost").innerHTML = ""; $("partTabs").innerHTML = "";
  clearNotice("formNotice"); clearNotice("pwNotice");
  $("panelBody").scrollTop = 0;
}
function openSection(key) {
  const item = MENU.find(m => m.key === key);
  if (!item || !currentUser || (currentUser.sector && !item.all)) return;
  clearNotice("formNotice"); clearNotice("pwNotice");
  $("panelMenu").hidden = true; $("panelWork").hidden = false;
  $("activeSectionTitle").textContent = item.label;
  const isPw = key === "sandi";
  $("editorWrap").hidden = isPw; $("pwForm").hidden = !isPw;
  if (isPw) {
    activeFeature = "sandi";
    $("activeSectionDescription").textContent = "Ganti kata sandi akun yang sedang Anda gunakan.";
    $("pwForm").reset(); updatePasswordChecks();
  } else {
    activeFeature = key; editingId = null;
    $("activeSectionDescription").textContent = currentUser.sector
      ? `Kelola jadwal ibadah sektor dan ibadah unit Sektor ${currentUser.sector}.`
      : FEATURES[key].desc;
    openPart(visibleParts()[0].key);
  }
  $("panelBody").scrollTop = 0;
}
function openPart(key) {
  activePart = key; editingId = null;
  const parts = visibleParts();
  $("partTabs").hidden = parts.length < 2;
  $("partTabs").innerHTML = parts.map(p => `<button type="button" class="adm-tab ${p.key === key ? "active" : ""}" data-part="${p.key}" role="tab">${escapeHtml(p.tab)}</button>`).join("");
  clearNotice("formNotice");
  renderPart();
}

function itemsOfActive() {
  const part = partOf();
  let arr = getPart(activeFeature, part.key);
  return arr;
}
function renderPart() {
  const part = partOf(), fields = fieldsOf(part);
  let values, title = "", hint = "";
  if (part.type === "single") {
    values = getPart(activeFeature, part.key);
  } else {
    const list = itemsOfActive();
    const cur = editingId ? list.find(x => x.id === editingId) : null;
    values = cur ? { ...cur } : { ...(part.blank || {}), ...lockVals() };
    title = cur ? "Edit data" : "Tambah data baru";
    if (activeFeature === "ibadah" && !cur && currentUser?.sector) { values.sector = currentUser.sector; values.kind = "sektor"; }
  }
  imgState = {};
  fields.filter(f => f.t === "image").forEach(f => { imgState[f.n] = values[f.n] || ""; });

  const isSingle = part.type === "single";
  const form = `<form class="adm-formbox section-editor" novalidate autocomplete="off">
      ${isSingle ? `<h4>${escapeHtml(part.tab)}</h4><p class="adm-hint">Isi di bawah sama dengan yang tampil di website. Ubah lalu tekan Simpan.</p>` : `<h4>${title}</h4>`}
      <div class="form-grid">${fields.map(f => fieldHtml(f, values[f.n])).join("")}</div>
      <div class="admin-actions">
        <button class="adm-primary adm-auto" type="submit">${isSingle ? "Simpan Perubahan" : (editingId ? "Perbarui Data" : "Tambah ke Daftar")}</button>
        ${isSingle ? "" : `<button class="adm-pill" type="button" data-reset-form>${editingId ? "Batal Edit" : "Bersihkan Formulir"}</button>`}
      </div>
    </form>`;

  let listHtml = "";
  if (!isSingle) {
    const all = itemsOfActive();
    const rows = all.filter(canManage);
    listHtml = `<h4 class="adm-sub">Daftar yang sedang tampil di website (${rows.length})</h4>` + (rows.length
      ? `<div class="adm-rows">${rows.map(it => {
          const idx = all.findIndex(x => x.id === it.id);
          const img = safeUrl(it.image);
          const hasPub = it.published !== undefined || fields.some(f => f.n === "published");
          return `<div class="adm-row">
            ${fields.some(f => f.t === "image") ? (img ? `<img class="adm-row-thumb" src="${escapeHtml(img)}" alt="">` : `<div class="adm-row-thumb"></div>`) : ""}
            <div class="adm-row-main"><strong>${escapeHtml(part.rowTitle(it))}</strong>${part.rowSub(it) ? `<small>${escapeHtml(part.rowSub(it))}</small>` : ""}</div>
            ${hasPub ? `<span class="status-pill ${it.published !== false ? "is-published" : "is-draft"}">${it.published !== false ? "Tampil" : "Draft"}</span>` : ""}
            <div class="adm-row-actions">
              ${part.reorder ? `<button type="button" class="mv" data-mv="${escapeHtml(it.id)}" data-dir="-1" ${idx === 0 ? "disabled" : ""} aria-label="Naikkan">↑</button><button type="button" class="mv" data-mv="${escapeHtml(it.id)}" data-dir="1" ${idx === all.length - 1 ? "disabled" : ""} aria-label="Turunkan">↓</button>` : ""}
              <button type="button" class="edit-btn" data-edit="${escapeHtml(it.id)}">Edit</button>
              <button type="button" class="delete-btn" data-del="${escapeHtml(it.id)}">Hapus</button>
            </div>
          </div>`;
        }).join("")}</div>`
      : `<div class="adm-empty">Belum ada data. Tambahkan lewat formulir di atas.</div>`);
  }
  $("editorHost").innerHTML = form + listHtml;
  applyShow($("editorHost").querySelector("form"), fields);
}

/* ---------- Simpan, edit, hapus ---------- */
function afterChange(msg) {
  renderAll();
  renderPart();
  showNotice("formNotice", msg, "success");
}
async function submitForm(form) {
  clearNotice("formNotice");
  const part = partOf(), fields = fieldsOf(part);
  try {
    if (currentUser.sector && activeFeature !== "ibadah") throw new Error("Akun ini hanya dapat mengelola jadwal sektornya.");
    const vals = readForm(form, fields);

    if (part.type === "single") {
      await setPart(activeFeature, part.key, { ...getPart(activeFeature, part.key), ...vals });
      afterChange("Perubahan berhasil disimpan dan sudah tampil di website.");
      return;
    }

    /* aturan khusus jadwal ibadah */
    if (activeFeature === "ibadah") {
      if (vals.kind === "sektor") {
        vals.tag = "Ibadah Sektor"; vals.useHost = true; vals.unit = "";
        if (!vals.title) vals.title = `Ibadah Sektor ${vals.sector}`;
      } else if (vals.kind === "unit") {
        vals.tag = "Unit"; vals.useHost = true;
        if (!vals.title || /^Sektor .+ — Unit \d+$/.test(vals.title)) vals.title = `Sektor ${vals.sector} — Unit ${vals.unit}`;
      } else { vals.sector = ""; vals.unit = ""; }
    }
    for (const f of fields) {
      if (f.req && f.t !== "image" && !vals[f.n]) throw new Error(`${f.l} wajib diisi.`);
      if (f.req && f.t === "image" && !vals[f.n]) throw new Error("Foto wajib dipilih.");
    }
    if (!vals.title && activeFeature === "ibadah") throw new Error("Nama ibadah wajib diisi.");
    if (activeFeature === "kontak" && !/^https?:\/\//i.test(vals.url || "")) throw new Error("Tautan harus diawali https://");

    const arr = getPart(activeFeature, part.key);
    let msg;
    let pos = editingId ? arr.findIndex(x => x.id === editingId) : -1;
    if (editingId && pos < 0) throw new Error("Data tidak ditemukan.");
    if (pos < 0 && activeFeature === "ibadah" && vals.kind === "sektor") {
      pos = arr.findIndex(x => x.kind === "sektor" && x.sector === vals.sector);
    }
    if (pos < 0 && activeFeature === "ibadah" && vals.kind === "unit") {
      pos = arr.findIndex(x => x.kind === "unit" && x.sector === vals.sector && String(x.unit) === String(vals.unit));
    }
    if (pos >= 0) {
      if (!canManage(arr[pos])) throw new Error("Anda tidak berhak mengubah data ini.");
      arr[pos] = { ...arr[pos], ...vals, id: arr[pos].id };
      msg = "Data berhasil diperbarui.";
    } else {
      const item = { ...vals, id: newId() };
      if (part.top) arr.unshift(item); else arr.push(item);
      msg = "Data baru berhasil ditambahkan.";
    }
    await setPart(activeFeature, part.key, arr);
    editingId = null;
    afterChange(msg);
  } catch (err) {
    showNotice("formNotice", err.message || "Gagal menyimpan. Periksa kembali isian.");
    $("panelBody").scrollTop = 0;
  }
}
function editItem(id) {
  const it = itemsOfActive().find(x => x.id === id);
  if (!it || !canManage(it)) return;
  editingId = id; clearNotice("formNotice");
  renderPart();
  $("editorHost").querySelector("form")?.scrollIntoView({ behavior: "smooth", block: "start" });
}
async function deleteItem(id) {
  const part = partOf();
  const arr = itemsOfActive();
  const it = arr.find(x => x.id === id);
  if (!it || !canManage(it)) return;
  if (!confirm(`Hapus "${part.rowTitle(it)}"? Data ini akan hilang dari website.`)) return;
  try {
    await setPart(activeFeature, part.key, arr.filter(x => x.id !== id));
    if (editingId === id) editingId = null;
    afterChange("Data berhasil dihapus.");
  } catch (err) { showNotice("formNotice", err.message); }
}
async function moveItem(id, dir) {
  const part = partOf(), arr = itemsOfActive();
  const i = arr.findIndex(x => x.id === id), j = i + dir;
  if (i < 0 || j < 0 || j >= arr.length) return;
  [arr[i], arr[j]] = [arr[j], arr[i]];
  try { await setPart(activeFeature, part.key, arr); afterChange("Urutan berhasil diubah."); }
  catch (err) { showNotice("formNotice", err.message); }
}

/* ---------- Modal login / panel ---------- */
function syncScrollLock() { document.body.classList.toggle("adm-lock", !$("loginModal").hidden || !$("panelModal").hidden); }
function openLogin() {
  if (currentUser) { openPanel(); return; }
  $("loginForm").reset(); clearNotice("loginNotice");
  $("loginForm").hidden = true; $("loginStepRole").hidden = false; $("loginTitle").textContent = "Masuk Sebagai";
  $("loginModal").hidden = false; syncScrollLock();
  $("loginModal").querySelector("[data-role-choice]")?.focus();
}
function closeLogin() { $("loginModal").hidden = true; syncScrollLock(); }
function openPanel() {
  closeLogin();
  $("currentRole").textContent = currentUser.name + " — " + currentUser.username;
  $("menuLead").innerHTML = currentUser.sector
    ? `Anda masuk sebagai admin sektor. Anda dapat mengelola <strong>jadwal ibadah Sektor ${escapeHtml(currentUser.sector)}</strong> dan mengubah kata sandi akun sendiri.`
    : `Pilih menu yang ingin diubah. Semua isi yang tampil di website dapat diedit, diganti fotonya, ditambah, atau dihapus. Tekan <strong>Kembali ke Menu Panel</strong> untuk memilih menu lain.`;
  renderMenu(); showMenu();
  $("panelModal").hidden = false; syncScrollLock();
  $("logoutBtn").focus();
}
function closePanel() { $("panelModal").hidden = true; syncScrollLock(); renderAll(); }
async function logout() {
  await supabaseClient.auth.signOut();

  currentUser = null;
  activeFeature = "";
  $("editorHost").innerHTML = "";

  closePanel();
}

function initAdmin() {
  document.querySelectorAll(".admin-login[href='#admin']").forEach(a => a.addEventListener("click", e => { e.preventDefault(); openLogin(); }));
  if (location.hash === "#admin") openLogin();

  let chosenRole = "";
  document.querySelectorAll("[data-role-choice]").forEach(button => button.addEventListener("click", () => {
    const u = button.dataset.roleChoice, r = ROLES[u]; if (!r) return;
    chosenRole = u; $("loginForm").reset();
    $("chosenName").textContent = r.name;
    $("loginTitle").textContent = "Masukkan Username & Kata Sandi";
    $("loginStepRole").hidden = true; $("loginForm").hidden = false; clearNotice("loginNotice"); $("username").focus();
  }));
  $("changeRole").addEventListener("click", () => {
    chosenRole = ""; $("loginForm").reset(); clearNotice("loginNotice");
    $("loginForm").hidden = true; $("loginStepRole").hidden = false; $("loginTitle").textContent = "Masuk Sebagai";
  });
$("loginForm").addEventListener("submit", async e => {
  e.preventDefault();
  clearNotice("loginNotice");

  const username = $("username").value.trim().toLowerCase();
  const password = $("password").value;

  if (!username) {
    showNotice("loginNotice", "Username wajib diketik.");
    return;
  }

  if (!ADMIN_EMAILS[username]) {
    showNotice("loginNotice", "Username tidak terdaftar.");
    return;
  }

  if (username !== chosenRole) {
    showNotice("loginNotice", "Username tidak sesuai dengan role yang dipilih.");
    return;
  }

  try {
    // Login ke Supabase Auth
    const { data: authData, error: authError } =
      await supabaseClient.auth.signInWithPassword({
        email: ADMIN_EMAILS[username],
        password: password
      });

    if (authError) throw authError;

    // Ambil hak akses akun dari tabel user_roles
    const { data: roleData, error: roleError } =
      await supabaseClient
        .from("user_roles")
        .select("role, sector")
        .eq("user_id", authData.user.id)
        .single();

    if (roleError || !roleData) {
      await supabaseClient.auth.signOut();
      throw new Error("Hak akses akun belum ditemukan.");
    }

    // Cocokkan role dari database dengan role website
    const expectedRole = username === "admingereja"
      ? "admin_utama"
      : "admin_sektor";

    if (roleData.role !== expectedRole) {
      await supabaseClient.auth.signOut();
      throw new Error("Role akun tidak sesuai.");
    }

    const role = ROLES[username];

    if (roleData.sector !== role.sector) {
      await supabaseClient.auth.signOut();
      throw new Error("Sektor akun tidak sesuai.");
    }

    currentUser = { username, ...role };
    await loadStoreFromSupabase();
    renderAll();

    $("loginForm").reset();
    chosenRole = "";
    openPanel();

  } catch (error) {
    console.error("Login error:", error);
    showNotice(
      "loginNotice",
      error.message || "Login gagal. Periksa username dan password."
    );
  }
});
  document.querySelectorAll("[data-toggle-pass]").forEach(btn => btn.addEventListener("click", () => {
    const input = $(btn.dataset.togglePass); input.type = input.type === "password" ? "text" : "password";
    btn.setAttribute("aria-label", input.type === "password" ? "Tampilkan kata sandi" : "Sembunyikan kata sandi");
  }));
  $("pwNew").addEventListener("input", updatePasswordChecks);
  $("pwForm").addEventListener("submit", async e => {
    e.preventDefault(); clearNotice("pwNotice");
    if (!currentUser) return;
    const oldP = $("pwOld").value, newP = $("pwNew").value, conf = $("pwConfirm").value;
    if (!passwordRulesOk(newP)) return showNotice("pwNotice", "Kata sandi baru belum memenuhi syarat: minimal 8 karakter, huruf awal besar, ada angka, dan ada lambang.");
    if (newP !== conf) return showNotice("pwNotice", "Pengulangan kata sandi baru tidak sama.");
    if (newP === oldP) return showNotice("pwNotice", "Kata sandi baru harus berbeda dari yang lama.");
    try {
      const { error: verifyError } = await supabaseClient.auth.signInWithPassword({
        email: ADMIN_EMAILS[currentUser.username], password: oldP
      });
      if (verifyError) return showNotice("pwNotice", "Kata sandi saat ini tidak sesuai.");
      const { error: updateError } = await supabaseClient.auth.updateUser({ password: newP });
      if (updateError) throw updateError;
    } catch (err) { return showNotice("pwNotice", err.message || "Kata sandi gagal diubah."); }
    $("pwForm").reset(); updatePasswordChecks();
    showNotice("pwNotice", "Kata sandi Supabase berhasil diubah. Gunakan kata sandi baru saat login berikutnya.", "success");
  });

  $("menuGrid").addEventListener("click", e => { const b = e.target.closest("[data-menu]"); if (b) openSection(b.dataset.menu); });
  $("backToMenu").addEventListener("click", showMenu);
  $("logoutBtn").addEventListener("click", logout);
  document.querySelectorAll("[data-close]").forEach(b => b.addEventListener("click", () => b.dataset.close === "login" ? closeLogin() : closePanel()));
  ["loginModal", "panelModal"].forEach(id => $(id).addEventListener("mousedown", e => {
    if (e.target === $(id)) id === "loginModal" ? closeLogin() : closePanel();
  }));
  document.addEventListener("keydown", e => {
    if (e.key !== "Escape") return;
    if ($("contentDetailModal")?.classList.contains("active")) return;
    if (!$("panelModal").hidden) closePanel(); else if (!$("loginModal").hidden) closeLogin();
  });

  $("partTabs").addEventListener("click", e => { const b = e.target.closest("[data-part]"); if (b) openPart(b.dataset.part); });

  const host = $("editorHost");
  host.addEventListener("submit", e => { e.preventDefault(); submitForm(e.target); });
  host.addEventListener("click", e => {
    if (e.target.closest("[data-reset-form]")) { editingId = null; clearNotice("formNotice"); renderPart(); return; }
    const ed = e.target.closest("[data-edit]"); if (ed) return editItem(ed.dataset.edit);
    const del = e.target.closest("[data-del]"); if (del) return deleteItem(del.dataset.del);
    const mv = e.target.closest("[data-mv]"); if (mv) return moveItem(mv.dataset.mv, +mv.dataset.dir);
    const clr = e.target.closest("[data-img-clear]");
    if (clr) { imgState[clr.dataset.imgClear] = ""; refreshImageField(clr.dataset.imgClear); }
  });
  host.addEventListener("change", async e => {
    const form = e.target.closest("form"); if (!form) return;
    const fin = e.target.closest("[data-img-input]");
    if (fin) {
      const f = fin.dataset.imgInput, file = fin.files[0]; if (!file) return;
      try { imgState[f] = await fileToDataUrl(file); clearNotice("formNotice"); refreshImageField(f); }
      catch (err) { showNotice("formNotice", err.message); fin.value = ""; }
      return;
    }
    applyShow(form, fieldsOf(partOf()));
  });
  host.addEventListener("input", e => {
    /* otomatis centang "memakai tuan rumah & pemimpin" untuk wadah yang dikenal */
    if (activeFeature === "ibadah" && e.target.name === "title" && !editingId) {
      const form = e.target.closest("form"), cb = form.elements.useHost;
      if (cb && !cb.dataset.touched) {
        cb.checked = /laki|wanita|perempuan|tunas|pekabaran|angkatan muda|paduan suara|sektor|unit/i.test(e.target.value);
        applyShow(form, fieldsOf(partOf()));
      }
    }
    if (e.target.name === "useHost") e.target.dataset.touched = "1";
  });
}

function refreshImageField(name) {
  const part = partOf(), f = fieldsOf(part).find(x => x.n === name);
  const wrap = $("editorHost").querySelector(`[data-f="${name}"]`);
  if (!f || !wrap) return;
  const tmp = document.createElement("div");
  tmp.innerHTML = imageFieldHtml(f);
  wrap.replaceWith(tmp.firstElementChild);
}

/* ---------- Mulai ---------- */
document.addEventListener("DOMContentLoaded", async () => {
  initPublic();
  initAdmin();
  try {
    await loadStoreFromSupabase();
    renderAll();
  } catch (error) {
    console.error("Gagal memuat konten Supabase:", error);
    showNotice("loginNotice", "Konten online belum dapat dimuat. Periksa koneksi Supabase dan kebijakan RLS.");
  }
});
