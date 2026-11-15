const fs = require("fs");
const path = require("path");

const raw = `Kode,Nama Barang,Satuan
KH,KARBOHIDRAT,
KH.01,BERAS DAN OLAHAN PADI,
KH.01.001,Beras putih (premium),kg
KH.01.002,Beras putih (medium),kg
KH.01.003,Beras merah,kg
KH.01.004,Beras hitam,kg
KH.01.005,Beras ketan putih,kg
KH.01.006,Beras ketan hitam,kg
KH.01.007,Tepung beras,kg
KH.01.008,Tepung ketan,kg
KH.01.009,Mie beras,kg
KH.01.099,Beras dan olahan padi-lainnya,kg
KH.02,JAGUNG DAN OLAHANNYA,
KH.02.001,Jagung pipil kering,kg
KH.02.002,Jagung pipil segar,kg
KH.02.003,Jagung manis segar,kg
KH.02.004,Beras jagung,kg
KH.02.005,Jagung giling,kg
KH.02.006,Tepung jagung (maizena),kg
KH.02.007,Tepung jagung lokal (cornmeal),kg
KH.02.099,Jagung dan olahan-lainnya,kg
KH.03,UMBI-UMBIAN,
KH.03.001,Singkong segar,kg
KH.03.002,Singkong kering/gaplek,kg
KH.03.003,Tepung singkong (tapioka),kg
KH.03.004,Mocaf,kg
KH.03.005,Ubi jalar putih,kg
KH.03.006,Ubi jalar kuning/oranye,kg
KH.03.007,Ubi jalar ungu,kg
KH.03.008,Kentang,kg
KH.03.009,Talas,kg
KH.03.010,Ganyong,kg
KH.03.011,Sagu basah,kg
KH.03.012,Tepung sagu,kg
KH.03.099,Umbi umbian-lainnya,kg
KH.04,GANDUM DAN OLAHAN TEPUNG,
KH.04.001,Tepung terigu protein rendah,kg
KH.04.002,Tepung terigu protein sedang,kg
KH.04.003,Tepung terigu protein tinggi,kg
KH.04.004,Tepung semolina,kg
KH.04.005,Mie kering (non-instan),pak
KH.04.006,Spageti,pak
KH.04.007,Makaroni,pak
KH.04.008,Roti tawar,pak
KH.04.009,Roti gandum,pak
KH.04.010,Tepung panir,pak
KH.04.011,Biskuit,pak
KH.04.012,Bubur bayi,pak
KH.04.099,Gandum dan olahan tepung-lainnya,pak
KH.05,SEREAL,
KH.05.001,Oat (rolled oats),kg
KH.05.002,Oat instan,kg
KH.05.003,Sorgum biji,kg
KH.05.004,Tepung sorgum,kg
KH.05.005,Millet/jewawut biji,kg
KH.05.006,Tepung millet,kg
KH.05.099,Sereal-lainnya,kg
PH,PROTEIN HEWANI,
PH.01,UNGGAS DAN OLAHANNYA,
PH.01.001,Ayam broiler utuh,kg
PH.01.002,Fillet dada ayam,kg
PH.01.003,Paha ayam atas,kg
PH.01.004,Paha ayam bawah (drumstick),kg
PH.01.005,Sayap ayam,kg
PH.01.006,Hati ayam,kg
PH.01.007,Ampela ayam,kg
PH.01.008,Telur ayam ras/negeri,kg
PH.01.009,Telur ayam kampung,kg
PH.01.010,Telur puyuh,kg
PH.01.011,Sosis ayam,pak
PH.01.099,Ayam dan olahannya-lainnya,kg
PH.02,DAGING SAPI/KERBAU/KAMBING,
PH.02.001,Daging sapi segar (has luar/sirloin),kg
PH.02.002,Daging sapi segar (has dalam/tenderloin),kg
PH.02.003,Daging sapi segar (sandung lamur/brisket),kg
PH.02.004,Daging sapi segar (paha),kg
PH.02.005,Daging sapi giling,kg
PH.02.006,Hati sapi,kg
PH.02.007,Iga sapi,kg
PH.02.008,Daging kerbau segar,kg
PH.02.009,Daging kambing segar,kg
PH.02.010,Daging domba segar,kg
PH.02.011,Hati kambing,kg
PH.02.012,Sosis sapi,pak
PH.02.099,Daging sapi/kerbau/kambing-lainnya,kg
PH.03,IKAN AIR TAWAR,
PH.03.001,Lele,kg
PH.03.002,Nila,kg
PH.03.003,Mujair,kg
PH.03.004,Patin,kg
PH.03.005,Gurame,kg
PH.03.006,Mas,kg
PH.03.007,Gabus,kg
PH.03.008,Fillet ikan tawar,kg
PH.03.099,Ikan air tawar-lainnya,kg
PH.04,IKAN LAUT,
PH.04.001,Kembung,kg
PH.04.002,Tongkol,kg
PH.04.003,Cakalang,kg
PH.04.004,Tuna,kg
PH.04.005,Sarden/lemuru,kg
PH.04.006,Bandeng,kg
PH.04.007,Tenggiri,kg
PH.04.008,Kakap,kg
PH.04.009,Fillet ikan laut,kg
PH.04.010,Ikan laut-lainnya,kg
PH.05,PRODUK PERIKANAN LAIN,
PH.05.001,Udang segar,kg
PH.05.002,Udang beku,kg
PH.05.003,Cumi-cumi,kg
PH.05.004,Sotong,kg
PH.05.005,Kepiting/rajungan,kg
PH.05.006,Kerang hijau,kg
PH.05.007,Kerang dara,kg
PH.05.099,Produk perikanan lain-lainnya,kg
PH.06,SUSU DAN OLAHANNYA,
PH.06.001,Susu UHT full cream,liter
PH.06.002,Susu UHT rendah lemak,liter
PH.06.003,Susu pasteurisasi,liter
PH.06.004,Susu bubuk,kg
PH.06.005,Yogurt plain,pak
PH.06.006,Keju cheddar,pak
PH.06.007,Keju olahan (slice),pak
PH.06.099,Susu dan olahan-lainnya,liter
PN,PROTEIN NABATI,
PN.01,KEDELAI DAN OLAHANNYA,
PN.01.001,Kedelai biji kering,kg
PN.01.002,Tempe,kg
PN.01.003,Tahu putih,kg
PN.01.004,Tahu kuning,kg
PN.01.005,Tahu sutra,kg
PN.01.006,Susu kedelai,liter
PN.01.007,Tepung kedelai,kg
PN.01.099,Kedelai dan olahannya-lainnya,kg
PN.02,KACANG-KACANGAN,
PN.02.001,Kacang tanah kupas,kg
PN.02.002,Kacang tanah dengan kulit,kg
PN.02.003,Kacang hijau,kg
PN.02.004,Kacang merah,kg
PN.02.005,Kacang tolo/tunggak,kg
PN.02.006,Kacang hitam,kg
PN.02.007,Kacang arab/chickpea,kg
PN.02.008,Kacang polong/pea,kg
PN.02.009,Kacang mede,kg
PN.02.010,Kacang almond,kg
PN.02.099,Kacang kacangan-lainnya,kg
PN.03,BIJI-BIJIAN DAN PRODUKNYA,
PN.03.001,Wijen,kg
PN.03.002,Biji bunga matahari,kg
PN.03.003,Chia seed,kg
PN.03.004,Flaxseed,kg
PN.03.099,Biji-bijian dan produknya-lainnya,kg
SY,SAYURAN,
SY.01,SAYURAN DAUN/BATANG/BUNGA,
SY.01.001,Bayam,ikat
SY.01.002,Kangkung,ikat
SY.01.003,Sawi hijau,ikat
SY.01.004,Sawi putih,ikat
SY.01.005,Pakcoy,ikat
SY.01.006,Selada,ikat
SY.01.007,Daun singkong,ikat
SY.01.008,Daun pepaya,ikat
SY.01.009,Kelor,ikat
SY.01.010,Katuk,ikat
SY.01.011,Seledri daun,ikat
SY.01.012,Brokoli,kg
SY.01.013,Kembang kol,kg
SY.01.014,Buncis,kg
SY.01.015,Seledri batang,ikat
SY.01.016,Asparagus,ikat
SY.01.099,Sayuran daun/batang/bunga-lainnya,ikat
SY.02,SAYURAN BUAH/UMBI/AKAR,
SY.02.001,Tomat,kg
SY.02.002,Mentimun,kg
SY.02.003,Terong ungu,kg
SY.02.004,Terong hijau,kg
SY.02.005,Cabai merah besar,kg
SY.02.006,Cabai rawit,kg
SY.02.007,Labu siam,kg
SY.02.008,Pare,kg
SY.02.009,Paprika,kg
SY.02.010,Okra,kg
SY.02.011,Wortel,kg
SY.02.012,Lobak putih,kg
SY.02.013,Bit,kg
SY.02.099,Sayuran buah/umbi/akar-lainnya,kg
SY.03,SAYURAN BAWANG DAN AROMATIK,
SY.03.001,Bawang merah,kg
SY.03.002,Bawang putih,kg
SY.03.003,Bawang bombai,kg
SY.03.004,Daun bawang,kg
SY.03.005,Bawang prei,kg
SY.03.006,Jahe,kg
SY.03.007,Kunyit,kg
SY.03.008,Lengkuas,kg
SY.03.009,Kencur,kg
SY.03.010,Serai,kg
SY.03.011,Temu kunci,kg
SY.03.012,Kemiri,kg
SY.03.099,Sayuran bawang dan aromatik lainnya,kg
SY.04,JAMUR,
SY.04.001,Jamur tiram,kg
SY.04.002,Jamur kancing,kg
SY.04.003,Jamur kuping,kg
SY.04.004,Jamur shiitake,kg
SY.04.099,Jamur-lainnya,kg
BU,BUAH-BUAHAN,
BU.01,BUAH LOKAL,
BU.01.001,Pisang ambon,kg
BU.01.002,Pisang kepok,kg
BU.01.003,Pisang raja,kg
BU.01.004,Pepaya,kg
BU.01.005,Semangka,kg
BU.01.006,Melon,kg
BU.01.007,Mangga harum manis,kg
BU.01.008,Mangga gedong,kg
BU.01.009,Jeruk manis,kg
BU.01.010,Jeruk keprok,kg
BU.01.011,Jambu biji,kg
BU.01.012,Jambu air,kg
BU.01.013,Nanas,kg
BU.01.014,Salak,kg
BU.01.015,Rambutan,kg
BU.01.016,Duku,kg
BU.01.017,Sirsak,kg
BU.01.018,Durian,kg
BU.01.019,Manggis,kg
BU.01.020,Alpukat,kg
BU.01.021,Apel malang,kg
BU.01.022,Buah naga merah,kg
BU.01.023,Buah naga putih,kg
BU.01.024,Kedondong,kg
BU.01.025,Markisa,kg
BU.01.026,Belimbing,kg
BU.01.027,Sawo,kg
BU.01.028,Matoa,kg
BU.01.099,Buah lokal-lainnya,kg
BU.02,BUAH IMPOR,
BU.02.001,Apel,kg
BU.02.002,Pear,kg
BU.02.003,Anggur merah,kg
BU.02.004,Anggur hijau,kg
BU.02.005,Kiwi,kg
BU.02.099,Buah impor-lainnya,kg
BB,BAHAN BAKU LAIN,
BB.01,MINYAK DAN LEMAK,
BB.01.001,Minyak goreng sawit,liter
BB.01.002,Minyak goreng campuran,liter
BB.01.003,Minyak kelapa,liter
BB.01.004,Margarin,kg
BB.01.005,Mentega (butter),kg
BB.01.099,Minyak dan lemak-lainnya,kg
BB.02,"GARAM, GULA, DAN PEMANIS",
BB.02.001,Garam beryodium,pak
BB.02.002,Gula pasir,kg
BB.02.003,Gula merah/aren,kg
BB.02.004,Madu,kg
BB.02.099,"Garam, gula, dan pemanis-lainnya",kg
BB.03,BUMBU KERING (REMPAH),
BB.03.001,Lada/merica bubuk,pcs
BB.03.002,Ketumbar bubuk,pcs
BB.03.003,Jinten bubuk,pcs
BB.03.004,Pala bubuk,pcs
BB.03.005,Kayu manis,pcs
BB.03.006,Cengkeh,pcs
BB.03.007,Kapulaga,pcs
BB.03.008,Daun salam kering,pcs
BB.03.009,Oregano,pcs
BB.03.099,Bumbu kering (rempah)-lainnya,pcs
BB.04,"BUMBU CAIR, SAUS, DAN KONDIMEN",
BB.04.001,Kecap manis,botol
BB.04.002,Kecap asin,botol
BB.04.003,Saus sambal,botol
BB.04.004,Saus tomat,botol
BB.04.005,Saus tiram,botol
BB.04.006,Cuka makan,botol
BB.04.007,Mayones,botol
BB.04.099,"Bumbu cair, saus, dan kondimen-lainnya",botol
BB.05,PRODUK OLAHAN DASAR,
BB.05.001,Santan segar,pcs
BB.05.002,Santan instan cair,pcs
BB.05.003,Santan bubuk,pcs
BB.05.004,Kaldu bubuk ayam,pcs
BB.05.005,Kaldu bubuk sapi,pcs
BB.05.006,Kaldu jamur,pcs
BB.05.007,Agar-agar bubuk,pcs
BB.05.008,Gelatin,pcs
BB.05.099,Produk olahan dasar-lainnya,pcs
BB.06,BAHAN FERMENTASI/PELENGKAP,
BB.06.001,Terasi,pcs
BB.06.002,Tauco,pcs
BB.06.003,Ragi roti,pcs
BB.06.004,Baking powder,pcs
BB.06.099,Bahan fermentasi/pelengkap-lainnya,pcs
BB.07,BAHAN MINUMAN PENDAMPING,
BB.07.001,Air minum kemasan galon,pcs
BB.07.002,Air minum kemasan botol 2 liter,dus
BB.07.003,"Air minum kemasan botol 1,5 liter",dus
BB.07.004,Air minum kemasan botol 600 ml,dus
BB.07.005,Air minum kemasan botol 330 ml,dus
BB.07.006,Air minum kemasan cup,dus
BB.07.007,Minuman kemasan botol/kaleng,pcs
BB.07.008,Susu kental manis,pcs
BB.07.099,Bahan minuman pendamping-lainnya,pcs`;

function parseCsv(text) {
  const lines = text.trim().split("\n");
  const items = [];
  let mainCat = "";
  let subCat = "";

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const match = line.match(/^([^,]+),(".*?"|[^,]*),(.*)$/);
    if (!match) continue;
    const code = match[1].trim();
    let name = match[2].trim().replace(/^"|"$/g, "");
    let unit = match[3].trim().replace(/^"|"$/g, "");

    if (!unit) {
      if (!code.includes(".")) {
        mainCat = name;
        subCat = "";
      } else {
        subCat = name;
      }
    } else {
      items.push({
        code,
        name,
        unit,
        category: subCat ? `${mainCat} - ${subCat}` : mainCat,
      });
    }
  }
  return items;
}

const items = parseCsv(raw);
console.log(`Parsed ${items.length} items.`);

// 1. Write Migration SQL
const migrationSql = `-- Migration: Tambah kolom code & category pada tabel materials
ALTER TABLE materials ADD COLUMN IF NOT EXISTS code VARCHAR(30) NULL AFTER id;
ALTER TABLE materials ADD COLUMN IF NOT EXISTS category VARCHAR(100) NULL AFTER name;
`;
fs.writeFileSync(
  path.resolve(__dirname, "../sql/migrations/20261115_add_code_category_to_materials.sql"),
  migrationSql
);

// 2. Write Seed SQL
let seedSql = `-- Seed Master Bahan Baku Standar (Total: ${items.length} Item)
-- Tanggal: 15 November 2026

-- Pastikan kolom code dan category sudah ada
ALTER TABLE materials ADD COLUMN IF NOT EXISTS code VARCHAR(30) NULL AFTER id;
ALTER TABLE materials ADD COLUMN IF NOT EXISTS category VARCHAR(100) NULL AFTER name;

INSERT INTO materials (code, name, category, unit, price) VALUES
`;

const valuesSql = items
  .map((it) => {
    const escName = it.name.replace(/'/g, "''");
    const escCat = it.category.replace(/'/g, "''");
    const escCode = it.code.replace(/'/g, "''");
    const escUnit = it.unit.replace(/'/g, "''");
    return `  ('${escCode}', '${escName}', '${escCat}', '${escUnit}', 0)`;
  })
  .join(",\n");

seedSql +=
  valuesSql +
  `
ON DUPLICATE KEY UPDATE
  code = VALUES(code),
  category = VALUES(category),
  unit = VALUES(unit);
`;

const seedsDir = path.resolve(__dirname, "../sql/seeds");
if (!fs.existsSync(seedsDir)) fs.mkdirSync(seedsDir, { recursive: true });
fs.writeFileSync(path.resolve(seedsDir, "20261115_seed_materials.sql"), seedSql);
console.log("SQL seed written:", path.resolve(seedsDir, "20261115_seed_materials.sql"));

// 3. Write Standalone Seed Script
const scriptContent = `/**
 * Script Seed Master Bahan Baku ke Database MySQL
 * Menjalankan: node backend/scripts/seed_materials.js
 */
const mysql = require("mysql2/promise");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const materialsData = ${JSON.stringify(items, null, 2)};

async function runSeed() {
  console.log("Menghubungkan ke database MySQL...");
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASS || "",
    database: process.env.DB_NAME || "rab_po_nota",
  });

  try {
    console.log("Memeriksa struktur tabel materials...");
    await conn.query(\`
      CREATE TABLE IF NOT EXISTS materials (
        id INT AUTO_INCREMENT PRIMARY KEY,
        code VARCHAR(30) NULL,
        name VARCHAR(150) NOT NULL UNIQUE,
        category VARCHAR(100) NULL,
        unit VARCHAR(30) NULL,
        price DECIMAL(14,2) NOT NULL DEFAULT 0,
        default_supplier_id INT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (default_supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL
      )
    \`);

    // Tambah kolom code & category jika belum ada
    try {
      await conn.query("ALTER TABLE materials ADD COLUMN code VARCHAR(30) NULL AFTER id");
      console.log("- Kolom code berhasil ditambahkan");
    } catch (e) {
      if (e.code !== "ER_DUP_FIELDNAME") console.warn("Notice code:", e.message);
    }

    try {
      await conn.query("ALTER TABLE materials ADD COLUMN category VARCHAR(100) NULL AFTER name");
      console.log("- Kolom category berhasil ditambahkan");
    } catch (e) {
      if (e.code !== "ER_DUP_FIELDNAME") console.warn("Notice category:", e.message);
    }

    console.log(\`Mulai seeding \${materialsData.length} bahan baku...\`);
    let inserted = 0;
    let updated = 0;

    for (const m of materialsData) {
      const [res] = await conn.query(
        \`INSERT INTO materials (code, name, category, unit, price)
         VALUES (?, ?, ?, ?, 0)
         ON DUPLICATE KEY UPDATE
           code = VALUES(code),
           category = VALUES(category),
           unit = VALUES(unit)\`,
        [m.code, m.name, m.category, m.unit]
      );
      if (res.affectedRows === 1) inserted++;
      else if (res.affectedRows === 2) updated++;
    }

    console.log(\`✅ Seeding selesai! Berhasil memasukkan \${inserted} item baru, memperbarui \${updated} item existing.\`);
  } catch (err) {
    console.error("❌ Gagal seeding bahan baku:", err);
  } finally {
    await conn.end();
  }
}

runSeed();
`;

fs.writeFileSync(path.resolve(__dirname, "seed_materials.js"), scriptContent);
console.log("Script seed written: backend/scripts/seed_materials.js");
