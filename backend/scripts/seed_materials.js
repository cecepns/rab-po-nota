/**
 * Script Seed Master Bahan Baku ke Database MySQL
 * Menjalankan: node backend/scripts/seed_materials.js
 */
const mysql = require("mysql2/promise");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const materialsData = [
  {
    "code": "KH.01.001",
    "name": "Beras putih (premium)",
    "unit": "kg",
    "category": "KARBOHIDRAT - BERAS DAN OLAHAN PADI"
  },
  {
    "code": "KH.01.002",
    "name": "Beras putih (medium)",
    "unit": "kg",
    "category": "KARBOHIDRAT - BERAS DAN OLAHAN PADI"
  },
  {
    "code": "KH.01.003",
    "name": "Beras merah",
    "unit": "kg",
    "category": "KARBOHIDRAT - BERAS DAN OLAHAN PADI"
  },
  {
    "code": "KH.01.004",
    "name": "Beras hitam",
    "unit": "kg",
    "category": "KARBOHIDRAT - BERAS DAN OLAHAN PADI"
  },
  {
    "code": "KH.01.005",
    "name": "Beras ketan putih",
    "unit": "kg",
    "category": "KARBOHIDRAT - BERAS DAN OLAHAN PADI"
  },
  {
    "code": "KH.01.006",
    "name": "Beras ketan hitam",
    "unit": "kg",
    "category": "KARBOHIDRAT - BERAS DAN OLAHAN PADI"
  },
  {
    "code": "KH.01.007",
    "name": "Tepung beras",
    "unit": "kg",
    "category": "KARBOHIDRAT - BERAS DAN OLAHAN PADI"
  },
  {
    "code": "KH.01.008",
    "name": "Tepung ketan",
    "unit": "kg",
    "category": "KARBOHIDRAT - BERAS DAN OLAHAN PADI"
  },
  {
    "code": "KH.01.009",
    "name": "Mie beras",
    "unit": "kg",
    "category": "KARBOHIDRAT - BERAS DAN OLAHAN PADI"
  },
  {
    "code": "KH.01.099",
    "name": "Beras dan olahan padi-lainnya",
    "unit": "kg",
    "category": "KARBOHIDRAT - BERAS DAN OLAHAN PADI"
  },
  {
    "code": "KH.02.001",
    "name": "Jagung pipil kering",
    "unit": "kg",
    "category": "KARBOHIDRAT - JAGUNG DAN OLAHANNYA"
  },
  {
    "code": "KH.02.002",
    "name": "Jagung pipil segar",
    "unit": "kg",
    "category": "KARBOHIDRAT - JAGUNG DAN OLAHANNYA"
  },
  {
    "code": "KH.02.003",
    "name": "Jagung manis segar",
    "unit": "kg",
    "category": "KARBOHIDRAT - JAGUNG DAN OLAHANNYA"
  },
  {
    "code": "KH.02.004",
    "name": "Beras jagung",
    "unit": "kg",
    "category": "KARBOHIDRAT - JAGUNG DAN OLAHANNYA"
  },
  {
    "code": "KH.02.005",
    "name": "Jagung giling",
    "unit": "kg",
    "category": "KARBOHIDRAT - JAGUNG DAN OLAHANNYA"
  },
  {
    "code": "KH.02.006",
    "name": "Tepung jagung (maizena)",
    "unit": "kg",
    "category": "KARBOHIDRAT - JAGUNG DAN OLAHANNYA"
  },
  {
    "code": "KH.02.007",
    "name": "Tepung jagung lokal (cornmeal)",
    "unit": "kg",
    "category": "KARBOHIDRAT - JAGUNG DAN OLAHANNYA"
  },
  {
    "code": "KH.02.099",
    "name": "Jagung dan olahan-lainnya",
    "unit": "kg",
    "category": "KARBOHIDRAT - JAGUNG DAN OLAHANNYA"
  },
  {
    "code": "KH.03.001",
    "name": "Singkong segar",
    "unit": "kg",
    "category": "KARBOHIDRAT - UMBI-UMBIAN"
  },
  {
    "code": "KH.03.002",
    "name": "Singkong kering/gaplek",
    "unit": "kg",
    "category": "KARBOHIDRAT - UMBI-UMBIAN"
  },
  {
    "code": "KH.03.003",
    "name": "Tepung singkong (tapioka)",
    "unit": "kg",
    "category": "KARBOHIDRAT - UMBI-UMBIAN"
  },
  {
    "code": "KH.03.004",
    "name": "Mocaf",
    "unit": "kg",
    "category": "KARBOHIDRAT - UMBI-UMBIAN"
  },
  {
    "code": "KH.03.005",
    "name": "Ubi jalar putih",
    "unit": "kg",
    "category": "KARBOHIDRAT - UMBI-UMBIAN"
  },
  {
    "code": "KH.03.006",
    "name": "Ubi jalar kuning/oranye",
    "unit": "kg",
    "category": "KARBOHIDRAT - UMBI-UMBIAN"
  },
  {
    "code": "KH.03.007",
    "name": "Ubi jalar ungu",
    "unit": "kg",
    "category": "KARBOHIDRAT - UMBI-UMBIAN"
  },
  {
    "code": "KH.03.008",
    "name": "Kentang",
    "unit": "kg",
    "category": "KARBOHIDRAT - UMBI-UMBIAN"
  },
  {
    "code": "KH.03.009",
    "name": "Talas",
    "unit": "kg",
    "category": "KARBOHIDRAT - UMBI-UMBIAN"
  },
  {
    "code": "KH.03.010",
    "name": "Ganyong",
    "unit": "kg",
    "category": "KARBOHIDRAT - UMBI-UMBIAN"
  },
  {
    "code": "KH.03.011",
    "name": "Sagu basah",
    "unit": "kg",
    "category": "KARBOHIDRAT - UMBI-UMBIAN"
  },
  {
    "code": "KH.03.012",
    "name": "Tepung sagu",
    "unit": "kg",
    "category": "KARBOHIDRAT - UMBI-UMBIAN"
  },
  {
    "code": "KH.03.099",
    "name": "Umbi umbian-lainnya",
    "unit": "kg",
    "category": "KARBOHIDRAT - UMBI-UMBIAN"
  },
  {
    "code": "KH.04.001",
    "name": "Tepung terigu protein rendah",
    "unit": "kg",
    "category": "KARBOHIDRAT - GANDUM DAN OLAHAN TEPUNG"
  },
  {
    "code": "KH.04.002",
    "name": "Tepung terigu protein sedang",
    "unit": "kg",
    "category": "KARBOHIDRAT - GANDUM DAN OLAHAN TEPUNG"
  },
  {
    "code": "KH.04.003",
    "name": "Tepung terigu protein tinggi",
    "unit": "kg",
    "category": "KARBOHIDRAT - GANDUM DAN OLAHAN TEPUNG"
  },
  {
    "code": "KH.04.004",
    "name": "Tepung semolina",
    "unit": "kg",
    "category": "KARBOHIDRAT - GANDUM DAN OLAHAN TEPUNG"
  },
  {
    "code": "KH.04.005",
    "name": "Mie kering (non-instan)",
    "unit": "pak",
    "category": "KARBOHIDRAT - GANDUM DAN OLAHAN TEPUNG"
  },
  {
    "code": "KH.04.006",
    "name": "Spageti",
    "unit": "pak",
    "category": "KARBOHIDRAT - GANDUM DAN OLAHAN TEPUNG"
  },
  {
    "code": "KH.04.007",
    "name": "Makaroni",
    "unit": "pak",
    "category": "KARBOHIDRAT - GANDUM DAN OLAHAN TEPUNG"
  },
  {
    "code": "KH.04.008",
    "name": "Roti tawar",
    "unit": "pak",
    "category": "KARBOHIDRAT - GANDUM DAN OLAHAN TEPUNG"
  },
  {
    "code": "KH.04.009",
    "name": "Roti gandum",
    "unit": "pak",
    "category": "KARBOHIDRAT - GANDUM DAN OLAHAN TEPUNG"
  },
  {
    "code": "KH.04.010",
    "name": "Tepung panir",
    "unit": "pak",
    "category": "KARBOHIDRAT - GANDUM DAN OLAHAN TEPUNG"
  },
  {
    "code": "KH.04.011",
    "name": "Biskuit",
    "unit": "pak",
    "category": "KARBOHIDRAT - GANDUM DAN OLAHAN TEPUNG"
  },
  {
    "code": "KH.04.012",
    "name": "Bubur bayi",
    "unit": "pak",
    "category": "KARBOHIDRAT - GANDUM DAN OLAHAN TEPUNG"
  },
  {
    "code": "KH.04.099",
    "name": "Gandum dan olahan tepung-lainnya",
    "unit": "pak",
    "category": "KARBOHIDRAT - GANDUM DAN OLAHAN TEPUNG"
  },
  {
    "code": "KH.05.001",
    "name": "Oat (rolled oats)",
    "unit": "kg",
    "category": "KARBOHIDRAT - SEREAL"
  },
  {
    "code": "KH.05.002",
    "name": "Oat instan",
    "unit": "kg",
    "category": "KARBOHIDRAT - SEREAL"
  },
  {
    "code": "KH.05.003",
    "name": "Sorgum biji",
    "unit": "kg",
    "category": "KARBOHIDRAT - SEREAL"
  },
  {
    "code": "KH.05.004",
    "name": "Tepung sorgum",
    "unit": "kg",
    "category": "KARBOHIDRAT - SEREAL"
  },
  {
    "code": "KH.05.005",
    "name": "Millet/jewawut biji",
    "unit": "kg",
    "category": "KARBOHIDRAT - SEREAL"
  },
  {
    "code": "KH.05.006",
    "name": "Tepung millet",
    "unit": "kg",
    "category": "KARBOHIDRAT - SEREAL"
  },
  {
    "code": "KH.05.099",
    "name": "Sereal-lainnya",
    "unit": "kg",
    "category": "KARBOHIDRAT - SEREAL"
  },
  {
    "code": "PH.01.001",
    "name": "Ayam broiler utuh",
    "unit": "kg",
    "category": "PROTEIN HEWANI - UNGGAS DAN OLAHANNYA"
  },
  {
    "code": "PH.01.002",
    "name": "Fillet dada ayam",
    "unit": "kg",
    "category": "PROTEIN HEWANI - UNGGAS DAN OLAHANNYA"
  },
  {
    "code": "PH.01.003",
    "name": "Paha ayam atas",
    "unit": "kg",
    "category": "PROTEIN HEWANI - UNGGAS DAN OLAHANNYA"
  },
  {
    "code": "PH.01.004",
    "name": "Paha ayam bawah (drumstick)",
    "unit": "kg",
    "category": "PROTEIN HEWANI - UNGGAS DAN OLAHANNYA"
  },
  {
    "code": "PH.01.005",
    "name": "Sayap ayam",
    "unit": "kg",
    "category": "PROTEIN HEWANI - UNGGAS DAN OLAHANNYA"
  },
  {
    "code": "PH.01.006",
    "name": "Hati ayam",
    "unit": "kg",
    "category": "PROTEIN HEWANI - UNGGAS DAN OLAHANNYA"
  },
  {
    "code": "PH.01.007",
    "name": "Ampela ayam",
    "unit": "kg",
    "category": "PROTEIN HEWANI - UNGGAS DAN OLAHANNYA"
  },
  {
    "code": "PH.01.008",
    "name": "Telur ayam ras/negeri",
    "unit": "kg",
    "category": "PROTEIN HEWANI - UNGGAS DAN OLAHANNYA"
  },
  {
    "code": "PH.01.009",
    "name": "Telur ayam kampung",
    "unit": "kg",
    "category": "PROTEIN HEWANI - UNGGAS DAN OLAHANNYA"
  },
  {
    "code": "PH.01.010",
    "name": "Telur puyuh",
    "unit": "kg",
    "category": "PROTEIN HEWANI - UNGGAS DAN OLAHANNYA"
  },
  {
    "code": "PH.01.011",
    "name": "Sosis ayam",
    "unit": "pak",
    "category": "PROTEIN HEWANI - UNGGAS DAN OLAHANNYA"
  },
  {
    "code": "PH.01.099",
    "name": "Ayam dan olahannya-lainnya",
    "unit": "kg",
    "category": "PROTEIN HEWANI - UNGGAS DAN OLAHANNYA"
  },
  {
    "code": "PH.02.001",
    "name": "Daging sapi segar (has luar/sirloin)",
    "unit": "kg",
    "category": "PROTEIN HEWANI - DAGING SAPI/KERBAU/KAMBING"
  },
  {
    "code": "PH.02.002",
    "name": "Daging sapi segar (has dalam/tenderloin)",
    "unit": "kg",
    "category": "PROTEIN HEWANI - DAGING SAPI/KERBAU/KAMBING"
  },
  {
    "code": "PH.02.003",
    "name": "Daging sapi segar (sandung lamur/brisket)",
    "unit": "kg",
    "category": "PROTEIN HEWANI - DAGING SAPI/KERBAU/KAMBING"
  },
  {
    "code": "PH.02.004",
    "name": "Daging sapi segar (paha)",
    "unit": "kg",
    "category": "PROTEIN HEWANI - DAGING SAPI/KERBAU/KAMBING"
  },
  {
    "code": "PH.02.005",
    "name": "Daging sapi giling",
    "unit": "kg",
    "category": "PROTEIN HEWANI - DAGING SAPI/KERBAU/KAMBING"
  },
  {
    "code": "PH.02.006",
    "name": "Hati sapi",
    "unit": "kg",
    "category": "PROTEIN HEWANI - DAGING SAPI/KERBAU/KAMBING"
  },
  {
    "code": "PH.02.007",
    "name": "Iga sapi",
    "unit": "kg",
    "category": "PROTEIN HEWANI - DAGING SAPI/KERBAU/KAMBING"
  },
  {
    "code": "PH.02.008",
    "name": "Daging kerbau segar",
    "unit": "kg",
    "category": "PROTEIN HEWANI - DAGING SAPI/KERBAU/KAMBING"
  },
  {
    "code": "PH.02.009",
    "name": "Daging kambing segar",
    "unit": "kg",
    "category": "PROTEIN HEWANI - DAGING SAPI/KERBAU/KAMBING"
  },
  {
    "code": "PH.02.010",
    "name": "Daging domba segar",
    "unit": "kg",
    "category": "PROTEIN HEWANI - DAGING SAPI/KERBAU/KAMBING"
  },
  {
    "code": "PH.02.011",
    "name": "Hati kambing",
    "unit": "kg",
    "category": "PROTEIN HEWANI - DAGING SAPI/KERBAU/KAMBING"
  },
  {
    "code": "PH.02.012",
    "name": "Sosis sapi",
    "unit": "pak",
    "category": "PROTEIN HEWANI - DAGING SAPI/KERBAU/KAMBING"
  },
  {
    "code": "PH.02.099",
    "name": "Daging sapi/kerbau/kambing-lainnya",
    "unit": "kg",
    "category": "PROTEIN HEWANI - DAGING SAPI/KERBAU/KAMBING"
  },
  {
    "code": "PH.03.001",
    "name": "Lele",
    "unit": "kg",
    "category": "PROTEIN HEWANI - IKAN AIR TAWAR"
  },
  {
    "code": "PH.03.002",
    "name": "Nila",
    "unit": "kg",
    "category": "PROTEIN HEWANI - IKAN AIR TAWAR"
  },
  {
    "code": "PH.03.003",
    "name": "Mujair",
    "unit": "kg",
    "category": "PROTEIN HEWANI - IKAN AIR TAWAR"
  },
  {
    "code": "PH.03.004",
    "name": "Patin",
    "unit": "kg",
    "category": "PROTEIN HEWANI - IKAN AIR TAWAR"
  },
  {
    "code": "PH.03.005",
    "name": "Gurame",
    "unit": "kg",
    "category": "PROTEIN HEWANI - IKAN AIR TAWAR"
  },
  {
    "code": "PH.03.006",
    "name": "Mas",
    "unit": "kg",
    "category": "PROTEIN HEWANI - IKAN AIR TAWAR"
  },
  {
    "code": "PH.03.007",
    "name": "Gabus",
    "unit": "kg",
    "category": "PROTEIN HEWANI - IKAN AIR TAWAR"
  },
  {
    "code": "PH.03.008",
    "name": "Fillet ikan tawar",
    "unit": "kg",
    "category": "PROTEIN HEWANI - IKAN AIR TAWAR"
  },
  {
    "code": "PH.03.099",
    "name": "Ikan air tawar-lainnya",
    "unit": "kg",
    "category": "PROTEIN HEWANI - IKAN AIR TAWAR"
  },
  {
    "code": "PH.04.001",
    "name": "Kembung",
    "unit": "kg",
    "category": "PROTEIN HEWANI - IKAN LAUT"
  },
  {
    "code": "PH.04.002",
    "name": "Tongkol",
    "unit": "kg",
    "category": "PROTEIN HEWANI - IKAN LAUT"
  },
  {
    "code": "PH.04.003",
    "name": "Cakalang",
    "unit": "kg",
    "category": "PROTEIN HEWANI - IKAN LAUT"
  },
  {
    "code": "PH.04.004",
    "name": "Tuna",
    "unit": "kg",
    "category": "PROTEIN HEWANI - IKAN LAUT"
  },
  {
    "code": "PH.04.005",
    "name": "Sarden/lemuru",
    "unit": "kg",
    "category": "PROTEIN HEWANI - IKAN LAUT"
  },
  {
    "code": "PH.04.006",
    "name": "Bandeng",
    "unit": "kg",
    "category": "PROTEIN HEWANI - IKAN LAUT"
  },
  {
    "code": "PH.04.007",
    "name": "Tenggiri",
    "unit": "kg",
    "category": "PROTEIN HEWANI - IKAN LAUT"
  },
  {
    "code": "PH.04.008",
    "name": "Kakap",
    "unit": "kg",
    "category": "PROTEIN HEWANI - IKAN LAUT"
  },
  {
    "code": "PH.04.009",
    "name": "Fillet ikan laut",
    "unit": "kg",
    "category": "PROTEIN HEWANI - IKAN LAUT"
  },
  {
    "code": "PH.04.010",
    "name": "Ikan laut-lainnya",
    "unit": "kg",
    "category": "PROTEIN HEWANI - IKAN LAUT"
  },
  {
    "code": "PH.05.001",
    "name": "Udang segar",
    "unit": "kg",
    "category": "PROTEIN HEWANI - PRODUK PERIKANAN LAIN"
  },
  {
    "code": "PH.05.002",
    "name": "Udang beku",
    "unit": "kg",
    "category": "PROTEIN HEWANI - PRODUK PERIKANAN LAIN"
  },
  {
    "code": "PH.05.003",
    "name": "Cumi-cumi",
    "unit": "kg",
    "category": "PROTEIN HEWANI - PRODUK PERIKANAN LAIN"
  },
  {
    "code": "PH.05.004",
    "name": "Sotong",
    "unit": "kg",
    "category": "PROTEIN HEWANI - PRODUK PERIKANAN LAIN"
  },
  {
    "code": "PH.05.005",
    "name": "Kepiting/rajungan",
    "unit": "kg",
    "category": "PROTEIN HEWANI - PRODUK PERIKANAN LAIN"
  },
  {
    "code": "PH.05.006",
    "name": "Kerang hijau",
    "unit": "kg",
    "category": "PROTEIN HEWANI - PRODUK PERIKANAN LAIN"
  },
  {
    "code": "PH.05.007",
    "name": "Kerang dara",
    "unit": "kg",
    "category": "PROTEIN HEWANI - PRODUK PERIKANAN LAIN"
  },
  {
    "code": "PH.05.099",
    "name": "Produk perikanan lain-lainnya",
    "unit": "kg",
    "category": "PROTEIN HEWANI - PRODUK PERIKANAN LAIN"
  },
  {
    "code": "PH.06.001",
    "name": "Susu UHT full cream",
    "unit": "liter",
    "category": "PROTEIN HEWANI - SUSU DAN OLAHANNYA"
  },
  {
    "code": "PH.06.002",
    "name": "Susu UHT rendah lemak",
    "unit": "liter",
    "category": "PROTEIN HEWANI - SUSU DAN OLAHANNYA"
  },
  {
    "code": "PH.06.003",
    "name": "Susu pasteurisasi",
    "unit": "liter",
    "category": "PROTEIN HEWANI - SUSU DAN OLAHANNYA"
  },
  {
    "code": "PH.06.004",
    "name": "Susu bubuk",
    "unit": "kg",
    "category": "PROTEIN HEWANI - SUSU DAN OLAHANNYA"
  },
  {
    "code": "PH.06.005",
    "name": "Yogurt plain",
    "unit": "pak",
    "category": "PROTEIN HEWANI - SUSU DAN OLAHANNYA"
  },
  {
    "code": "PH.06.006",
    "name": "Keju cheddar",
    "unit": "pak",
    "category": "PROTEIN HEWANI - SUSU DAN OLAHANNYA"
  },
  {
    "code": "PH.06.007",
    "name": "Keju olahan (slice)",
    "unit": "pak",
    "category": "PROTEIN HEWANI - SUSU DAN OLAHANNYA"
  },
  {
    "code": "PH.06.099",
    "name": "Susu dan olahan-lainnya",
    "unit": "liter",
    "category": "PROTEIN HEWANI - SUSU DAN OLAHANNYA"
  },
  {
    "code": "PN.01.001",
    "name": "Kedelai biji kering",
    "unit": "kg",
    "category": "PROTEIN NABATI - KEDELAI DAN OLAHANNYA"
  },
  {
    "code": "PN.01.002",
    "name": "Tempe",
    "unit": "kg",
    "category": "PROTEIN NABATI - KEDELAI DAN OLAHANNYA"
  },
  {
    "code": "PN.01.003",
    "name": "Tahu putih",
    "unit": "kg",
    "category": "PROTEIN NABATI - KEDELAI DAN OLAHANNYA"
  },
  {
    "code": "PN.01.004",
    "name": "Tahu kuning",
    "unit": "kg",
    "category": "PROTEIN NABATI - KEDELAI DAN OLAHANNYA"
  },
  {
    "code": "PN.01.005",
    "name": "Tahu sutra",
    "unit": "kg",
    "category": "PROTEIN NABATI - KEDELAI DAN OLAHANNYA"
  },
  {
    "code": "PN.01.006",
    "name": "Susu kedelai",
    "unit": "liter",
    "category": "PROTEIN NABATI - KEDELAI DAN OLAHANNYA"
  },
  {
    "code": "PN.01.007",
    "name": "Tepung kedelai",
    "unit": "kg",
    "category": "PROTEIN NABATI - KEDELAI DAN OLAHANNYA"
  },
  {
    "code": "PN.01.099",
    "name": "Kedelai dan olahannya-lainnya",
    "unit": "kg",
    "category": "PROTEIN NABATI - KEDELAI DAN OLAHANNYA"
  },
  {
    "code": "PN.02.001",
    "name": "Kacang tanah kupas",
    "unit": "kg",
    "category": "PROTEIN NABATI - KACANG-KACANGAN"
  },
  {
    "code": "PN.02.002",
    "name": "Kacang tanah dengan kulit",
    "unit": "kg",
    "category": "PROTEIN NABATI - KACANG-KACANGAN"
  },
  {
    "code": "PN.02.003",
    "name": "Kacang hijau",
    "unit": "kg",
    "category": "PROTEIN NABATI - KACANG-KACANGAN"
  },
  {
    "code": "PN.02.004",
    "name": "Kacang merah",
    "unit": "kg",
    "category": "PROTEIN NABATI - KACANG-KACANGAN"
  },
  {
    "code": "PN.02.005",
    "name": "Kacang tolo/tunggak",
    "unit": "kg",
    "category": "PROTEIN NABATI - KACANG-KACANGAN"
  },
  {
    "code": "PN.02.006",
    "name": "Kacang hitam",
    "unit": "kg",
    "category": "PROTEIN NABATI - KACANG-KACANGAN"
  },
  {
    "code": "PN.02.007",
    "name": "Kacang arab/chickpea",
    "unit": "kg",
    "category": "PROTEIN NABATI - KACANG-KACANGAN"
  },
  {
    "code": "PN.02.008",
    "name": "Kacang polong/pea",
    "unit": "kg",
    "category": "PROTEIN NABATI - KACANG-KACANGAN"
  },
  {
    "code": "PN.02.009",
    "name": "Kacang mede",
    "unit": "kg",
    "category": "PROTEIN NABATI - KACANG-KACANGAN"
  },
  {
    "code": "PN.02.010",
    "name": "Kacang almond",
    "unit": "kg",
    "category": "PROTEIN NABATI - KACANG-KACANGAN"
  },
  {
    "code": "PN.02.099",
    "name": "Kacang kacangan-lainnya",
    "unit": "kg",
    "category": "PROTEIN NABATI - KACANG-KACANGAN"
  },
  {
    "code": "PN.03.001",
    "name": "Wijen",
    "unit": "kg",
    "category": "PROTEIN NABATI - BIJI-BIJIAN DAN PRODUKNYA"
  },
  {
    "code": "PN.03.002",
    "name": "Biji bunga matahari",
    "unit": "kg",
    "category": "PROTEIN NABATI - BIJI-BIJIAN DAN PRODUKNYA"
  },
  {
    "code": "PN.03.003",
    "name": "Chia seed",
    "unit": "kg",
    "category": "PROTEIN NABATI - BIJI-BIJIAN DAN PRODUKNYA"
  },
  {
    "code": "PN.03.004",
    "name": "Flaxseed",
    "unit": "kg",
    "category": "PROTEIN NABATI - BIJI-BIJIAN DAN PRODUKNYA"
  },
  {
    "code": "PN.03.099",
    "name": "Biji-bijian dan produknya-lainnya",
    "unit": "kg",
    "category": "PROTEIN NABATI - BIJI-BIJIAN DAN PRODUKNYA"
  },
  {
    "code": "SY.01.001",
    "name": "Bayam",
    "unit": "ikat",
    "category": "SAYURAN - SAYURAN DAUN/BATANG/BUNGA"
  },
  {
    "code": "SY.01.002",
    "name": "Kangkung",
    "unit": "ikat",
    "category": "SAYURAN - SAYURAN DAUN/BATANG/BUNGA"
  },
  {
    "code": "SY.01.003",
    "name": "Sawi hijau",
    "unit": "ikat",
    "category": "SAYURAN - SAYURAN DAUN/BATANG/BUNGA"
  },
  {
    "code": "SY.01.004",
    "name": "Sawi putih",
    "unit": "ikat",
    "category": "SAYURAN - SAYURAN DAUN/BATANG/BUNGA"
  },
  {
    "code": "SY.01.005",
    "name": "Pakcoy",
    "unit": "ikat",
    "category": "SAYURAN - SAYURAN DAUN/BATANG/BUNGA"
  },
  {
    "code": "SY.01.006",
    "name": "Selada",
    "unit": "ikat",
    "category": "SAYURAN - SAYURAN DAUN/BATANG/BUNGA"
  },
  {
    "code": "SY.01.007",
    "name": "Daun singkong",
    "unit": "ikat",
    "category": "SAYURAN - SAYURAN DAUN/BATANG/BUNGA"
  },
  {
    "code": "SY.01.008",
    "name": "Daun pepaya",
    "unit": "ikat",
    "category": "SAYURAN - SAYURAN DAUN/BATANG/BUNGA"
  },
  {
    "code": "SY.01.009",
    "name": "Kelor",
    "unit": "ikat",
    "category": "SAYURAN - SAYURAN DAUN/BATANG/BUNGA"
  },
  {
    "code": "SY.01.010",
    "name": "Katuk",
    "unit": "ikat",
    "category": "SAYURAN - SAYURAN DAUN/BATANG/BUNGA"
  },
  {
    "code": "SY.01.011",
    "name": "Seledri daun",
    "unit": "ikat",
    "category": "SAYURAN - SAYURAN DAUN/BATANG/BUNGA"
  },
  {
    "code": "SY.01.012",
    "name": "Brokoli",
    "unit": "kg",
    "category": "SAYURAN - SAYURAN DAUN/BATANG/BUNGA"
  },
  {
    "code": "SY.01.013",
    "name": "Kembang kol",
    "unit": "kg",
    "category": "SAYURAN - SAYURAN DAUN/BATANG/BUNGA"
  },
  {
    "code": "SY.01.014",
    "name": "Buncis",
    "unit": "kg",
    "category": "SAYURAN - SAYURAN DAUN/BATANG/BUNGA"
  },
  {
    "code": "SY.01.015",
    "name": "Seledri batang",
    "unit": "ikat",
    "category": "SAYURAN - SAYURAN DAUN/BATANG/BUNGA"
  },
  {
    "code": "SY.01.016",
    "name": "Asparagus",
    "unit": "ikat",
    "category": "SAYURAN - SAYURAN DAUN/BATANG/BUNGA"
  },
  {
    "code": "SY.01.099",
    "name": "Sayuran daun/batang/bunga-lainnya",
    "unit": "ikat",
    "category": "SAYURAN - SAYURAN DAUN/BATANG/BUNGA"
  },
  {
    "code": "SY.02.001",
    "name": "Tomat",
    "unit": "kg",
    "category": "SAYURAN - SAYURAN BUAH/UMBI/AKAR"
  },
  {
    "code": "SY.02.002",
    "name": "Mentimun",
    "unit": "kg",
    "category": "SAYURAN - SAYURAN BUAH/UMBI/AKAR"
  },
  {
    "code": "SY.02.003",
    "name": "Terong ungu",
    "unit": "kg",
    "category": "SAYURAN - SAYURAN BUAH/UMBI/AKAR"
  },
  {
    "code": "SY.02.004",
    "name": "Terong hijau",
    "unit": "kg",
    "category": "SAYURAN - SAYURAN BUAH/UMBI/AKAR"
  },
  {
    "code": "SY.02.005",
    "name": "Cabai merah besar",
    "unit": "kg",
    "category": "SAYURAN - SAYURAN BUAH/UMBI/AKAR"
  },
  {
    "code": "SY.02.006",
    "name": "Cabai rawit",
    "unit": "kg",
    "category": "SAYURAN - SAYURAN BUAH/UMBI/AKAR"
  },
  {
    "code": "SY.02.007",
    "name": "Labu siam",
    "unit": "kg",
    "category": "SAYURAN - SAYURAN BUAH/UMBI/AKAR"
  },
  {
    "code": "SY.02.008",
    "name": "Pare",
    "unit": "kg",
    "category": "SAYURAN - SAYURAN BUAH/UMBI/AKAR"
  },
  {
    "code": "SY.02.009",
    "name": "Paprika",
    "unit": "kg",
    "category": "SAYURAN - SAYURAN BUAH/UMBI/AKAR"
  },
  {
    "code": "SY.02.010",
    "name": "Okra",
    "unit": "kg",
    "category": "SAYURAN - SAYURAN BUAH/UMBI/AKAR"
  },
  {
    "code": "SY.02.011",
    "name": "Wortel",
    "unit": "kg",
    "category": "SAYURAN - SAYURAN BUAH/UMBI/AKAR"
  },
  {
    "code": "SY.02.012",
    "name": "Lobak putih",
    "unit": "kg",
    "category": "SAYURAN - SAYURAN BUAH/UMBI/AKAR"
  },
  {
    "code": "SY.02.013",
    "name": "Bit",
    "unit": "kg",
    "category": "SAYURAN - SAYURAN BUAH/UMBI/AKAR"
  },
  {
    "code": "SY.02.099",
    "name": "Sayuran buah/umbi/akar-lainnya",
    "unit": "kg",
    "category": "SAYURAN - SAYURAN BUAH/UMBI/AKAR"
  },
  {
    "code": "SY.03.001",
    "name": "Bawang merah",
    "unit": "kg",
    "category": "SAYURAN - SAYURAN BAWANG DAN AROMATIK"
  },
  {
    "code": "SY.03.002",
    "name": "Bawang putih",
    "unit": "kg",
    "category": "SAYURAN - SAYURAN BAWANG DAN AROMATIK"
  },
  {
    "code": "SY.03.003",
    "name": "Bawang bombai",
    "unit": "kg",
    "category": "SAYURAN - SAYURAN BAWANG DAN AROMATIK"
  },
  {
    "code": "SY.03.004",
    "name": "Daun bawang",
    "unit": "kg",
    "category": "SAYURAN - SAYURAN BAWANG DAN AROMATIK"
  },
  {
    "code": "SY.03.005",
    "name": "Bawang prei",
    "unit": "kg",
    "category": "SAYURAN - SAYURAN BAWANG DAN AROMATIK"
  },
  {
    "code": "SY.03.006",
    "name": "Jahe",
    "unit": "kg",
    "category": "SAYURAN - SAYURAN BAWANG DAN AROMATIK"
  },
  {
    "code": "SY.03.007",
    "name": "Kunyit",
    "unit": "kg",
    "category": "SAYURAN - SAYURAN BAWANG DAN AROMATIK"
  },
  {
    "code": "SY.03.008",
    "name": "Lengkuas",
    "unit": "kg",
    "category": "SAYURAN - SAYURAN BAWANG DAN AROMATIK"
  },
  {
    "code": "SY.03.009",
    "name": "Kencur",
    "unit": "kg",
    "category": "SAYURAN - SAYURAN BAWANG DAN AROMATIK"
  },
  {
    "code": "SY.03.010",
    "name": "Serai",
    "unit": "kg",
    "category": "SAYURAN - SAYURAN BAWANG DAN AROMATIK"
  },
  {
    "code": "SY.03.011",
    "name": "Temu kunci",
    "unit": "kg",
    "category": "SAYURAN - SAYURAN BAWANG DAN AROMATIK"
  },
  {
    "code": "SY.03.012",
    "name": "Kemiri",
    "unit": "kg",
    "category": "SAYURAN - SAYURAN BAWANG DAN AROMATIK"
  },
  {
    "code": "SY.03.099",
    "name": "Sayuran bawang dan aromatik lainnya",
    "unit": "kg",
    "category": "SAYURAN - SAYURAN BAWANG DAN AROMATIK"
  },
  {
    "code": "SY.04.001",
    "name": "Jamur tiram",
    "unit": "kg",
    "category": "SAYURAN - JAMUR"
  },
  {
    "code": "SY.04.002",
    "name": "Jamur kancing",
    "unit": "kg",
    "category": "SAYURAN - JAMUR"
  },
  {
    "code": "SY.04.003",
    "name": "Jamur kuping",
    "unit": "kg",
    "category": "SAYURAN - JAMUR"
  },
  {
    "code": "SY.04.004",
    "name": "Jamur shiitake",
    "unit": "kg",
    "category": "SAYURAN - JAMUR"
  },
  {
    "code": "SY.04.099",
    "name": "Jamur-lainnya",
    "unit": "kg",
    "category": "SAYURAN - JAMUR"
  },
  {
    "code": "BU.01.001",
    "name": "Pisang ambon",
    "unit": "kg",
    "category": "BUAH-BUAHAN - BUAH LOKAL"
  },
  {
    "code": "BU.01.002",
    "name": "Pisang kepok",
    "unit": "kg",
    "category": "BUAH-BUAHAN - BUAH LOKAL"
  },
  {
    "code": "BU.01.003",
    "name": "Pisang raja",
    "unit": "kg",
    "category": "BUAH-BUAHAN - BUAH LOKAL"
  },
  {
    "code": "BU.01.004",
    "name": "Pepaya",
    "unit": "kg",
    "category": "BUAH-BUAHAN - BUAH LOKAL"
  },
  {
    "code": "BU.01.005",
    "name": "Semangka",
    "unit": "kg",
    "category": "BUAH-BUAHAN - BUAH LOKAL"
  },
  {
    "code": "BU.01.006",
    "name": "Melon",
    "unit": "kg",
    "category": "BUAH-BUAHAN - BUAH LOKAL"
  },
  {
    "code": "BU.01.007",
    "name": "Mangga harum manis",
    "unit": "kg",
    "category": "BUAH-BUAHAN - BUAH LOKAL"
  },
  {
    "code": "BU.01.008",
    "name": "Mangga gedong",
    "unit": "kg",
    "category": "BUAH-BUAHAN - BUAH LOKAL"
  },
  {
    "code": "BU.01.009",
    "name": "Jeruk manis",
    "unit": "kg",
    "category": "BUAH-BUAHAN - BUAH LOKAL"
  },
  {
    "code": "BU.01.010",
    "name": "Jeruk keprok",
    "unit": "kg",
    "category": "BUAH-BUAHAN - BUAH LOKAL"
  },
  {
    "code": "BU.01.011",
    "name": "Jambu biji",
    "unit": "kg",
    "category": "BUAH-BUAHAN - BUAH LOKAL"
  },
  {
    "code": "BU.01.012",
    "name": "Jambu air",
    "unit": "kg",
    "category": "BUAH-BUAHAN - BUAH LOKAL"
  },
  {
    "code": "BU.01.013",
    "name": "Nanas",
    "unit": "kg",
    "category": "BUAH-BUAHAN - BUAH LOKAL"
  },
  {
    "code": "BU.01.014",
    "name": "Salak",
    "unit": "kg",
    "category": "BUAH-BUAHAN - BUAH LOKAL"
  },
  {
    "code": "BU.01.015",
    "name": "Rambutan",
    "unit": "kg",
    "category": "BUAH-BUAHAN - BUAH LOKAL"
  },
  {
    "code": "BU.01.016",
    "name": "Duku",
    "unit": "kg",
    "category": "BUAH-BUAHAN - BUAH LOKAL"
  },
  {
    "code": "BU.01.017",
    "name": "Sirsak",
    "unit": "kg",
    "category": "BUAH-BUAHAN - BUAH LOKAL"
  },
  {
    "code": "BU.01.018",
    "name": "Durian",
    "unit": "kg",
    "category": "BUAH-BUAHAN - BUAH LOKAL"
  },
  {
    "code": "BU.01.019",
    "name": "Manggis",
    "unit": "kg",
    "category": "BUAH-BUAHAN - BUAH LOKAL"
  },
  {
    "code": "BU.01.020",
    "name": "Alpukat",
    "unit": "kg",
    "category": "BUAH-BUAHAN - BUAH LOKAL"
  },
  {
    "code": "BU.01.021",
    "name": "Apel malang",
    "unit": "kg",
    "category": "BUAH-BUAHAN - BUAH LOKAL"
  },
  {
    "code": "BU.01.022",
    "name": "Buah naga merah",
    "unit": "kg",
    "category": "BUAH-BUAHAN - BUAH LOKAL"
  },
  {
    "code": "BU.01.023",
    "name": "Buah naga putih",
    "unit": "kg",
    "category": "BUAH-BUAHAN - BUAH LOKAL"
  },
  {
    "code": "BU.01.024",
    "name": "Kedondong",
    "unit": "kg",
    "category": "BUAH-BUAHAN - BUAH LOKAL"
  },
  {
    "code": "BU.01.025",
    "name": "Markisa",
    "unit": "kg",
    "category": "BUAH-BUAHAN - BUAH LOKAL"
  },
  {
    "code": "BU.01.026",
    "name": "Belimbing",
    "unit": "kg",
    "category": "BUAH-BUAHAN - BUAH LOKAL"
  },
  {
    "code": "BU.01.027",
    "name": "Sawo",
    "unit": "kg",
    "category": "BUAH-BUAHAN - BUAH LOKAL"
  },
  {
    "code": "BU.01.028",
    "name": "Matoa",
    "unit": "kg",
    "category": "BUAH-BUAHAN - BUAH LOKAL"
  },
  {
    "code": "BU.01.099",
    "name": "Buah lokal-lainnya",
    "unit": "kg",
    "category": "BUAH-BUAHAN - BUAH LOKAL"
  },
  {
    "code": "BU.02.001",
    "name": "Apel",
    "unit": "kg",
    "category": "BUAH-BUAHAN - BUAH IMPOR"
  },
  {
    "code": "BU.02.002",
    "name": "Pear",
    "unit": "kg",
    "category": "BUAH-BUAHAN - BUAH IMPOR"
  },
  {
    "code": "BU.02.003",
    "name": "Anggur merah",
    "unit": "kg",
    "category": "BUAH-BUAHAN - BUAH IMPOR"
  },
  {
    "code": "BU.02.004",
    "name": "Anggur hijau",
    "unit": "kg",
    "category": "BUAH-BUAHAN - BUAH IMPOR"
  },
  {
    "code": "BU.02.005",
    "name": "Kiwi",
    "unit": "kg",
    "category": "BUAH-BUAHAN - BUAH IMPOR"
  },
  {
    "code": "BU.02.099",
    "name": "Buah impor-lainnya",
    "unit": "kg",
    "category": "BUAH-BUAHAN - BUAH IMPOR"
  },
  {
    "code": "BB.01.001",
    "name": "Minyak goreng sawit",
    "unit": "liter",
    "category": "BAHAN BAKU LAIN - MINYAK DAN LEMAK"
  },
  {
    "code": "BB.01.002",
    "name": "Minyak goreng campuran",
    "unit": "liter",
    "category": "BAHAN BAKU LAIN - MINYAK DAN LEMAK"
  },
  {
    "code": "BB.01.003",
    "name": "Minyak kelapa",
    "unit": "liter",
    "category": "BAHAN BAKU LAIN - MINYAK DAN LEMAK"
  },
  {
    "code": "BB.01.004",
    "name": "Margarin",
    "unit": "kg",
    "category": "BAHAN BAKU LAIN - MINYAK DAN LEMAK"
  },
  {
    "code": "BB.01.005",
    "name": "Mentega (butter)",
    "unit": "kg",
    "category": "BAHAN BAKU LAIN - MINYAK DAN LEMAK"
  },
  {
    "code": "BB.01.099",
    "name": "Minyak dan lemak-lainnya",
    "unit": "kg",
    "category": "BAHAN BAKU LAIN - MINYAK DAN LEMAK"
  },
  {
    "code": "BB.02.001",
    "name": "Garam beryodium",
    "unit": "pak",
    "category": "BAHAN BAKU LAIN - GARAM, GULA, DAN PEMANIS"
  },
  {
    "code": "BB.02.002",
    "name": "Gula pasir",
    "unit": "kg",
    "category": "BAHAN BAKU LAIN - GARAM, GULA, DAN PEMANIS"
  },
  {
    "code": "BB.02.003",
    "name": "Gula merah/aren",
    "unit": "kg",
    "category": "BAHAN BAKU LAIN - GARAM, GULA, DAN PEMANIS"
  },
  {
    "code": "BB.02.004",
    "name": "Madu",
    "unit": "kg",
    "category": "BAHAN BAKU LAIN - GARAM, GULA, DAN PEMANIS"
  },
  {
    "code": "BB.02.099",
    "name": "Garam, gula, dan pemanis-lainnya",
    "unit": "kg",
    "category": "BAHAN BAKU LAIN - GARAM, GULA, DAN PEMANIS"
  },
  {
    "code": "BB.03.001",
    "name": "Lada/merica bubuk",
    "unit": "pcs",
    "category": "BAHAN BAKU LAIN - BUMBU KERING (REMPAH)"
  },
  {
    "code": "BB.03.002",
    "name": "Ketumbar bubuk",
    "unit": "pcs",
    "category": "BAHAN BAKU LAIN - BUMBU KERING (REMPAH)"
  },
  {
    "code": "BB.03.003",
    "name": "Jinten bubuk",
    "unit": "pcs",
    "category": "BAHAN BAKU LAIN - BUMBU KERING (REMPAH)"
  },
  {
    "code": "BB.03.004",
    "name": "Pala bubuk",
    "unit": "pcs",
    "category": "BAHAN BAKU LAIN - BUMBU KERING (REMPAH)"
  },
  {
    "code": "BB.03.005",
    "name": "Kayu manis",
    "unit": "pcs",
    "category": "BAHAN BAKU LAIN - BUMBU KERING (REMPAH)"
  },
  {
    "code": "BB.03.006",
    "name": "Cengkeh",
    "unit": "pcs",
    "category": "BAHAN BAKU LAIN - BUMBU KERING (REMPAH)"
  },
  {
    "code": "BB.03.007",
    "name": "Kapulaga",
    "unit": "pcs",
    "category": "BAHAN BAKU LAIN - BUMBU KERING (REMPAH)"
  },
  {
    "code": "BB.03.008",
    "name": "Daun salam kering",
    "unit": "pcs",
    "category": "BAHAN BAKU LAIN - BUMBU KERING (REMPAH)"
  },
  {
    "code": "BB.03.009",
    "name": "Oregano",
    "unit": "pcs",
    "category": "BAHAN BAKU LAIN - BUMBU KERING (REMPAH)"
  },
  {
    "code": "BB.03.099",
    "name": "Bumbu kering (rempah)-lainnya",
    "unit": "pcs",
    "category": "BAHAN BAKU LAIN - BUMBU KERING (REMPAH)"
  },
  {
    "code": "BB.04.001",
    "name": "Kecap manis",
    "unit": "botol",
    "category": "BAHAN BAKU LAIN - BUMBU CAIR, SAUS, DAN KONDIMEN"
  },
  {
    "code": "BB.04.002",
    "name": "Kecap asin",
    "unit": "botol",
    "category": "BAHAN BAKU LAIN - BUMBU CAIR, SAUS, DAN KONDIMEN"
  },
  {
    "code": "BB.04.003",
    "name": "Saus sambal",
    "unit": "botol",
    "category": "BAHAN BAKU LAIN - BUMBU CAIR, SAUS, DAN KONDIMEN"
  },
  {
    "code": "BB.04.004",
    "name": "Saus tomat",
    "unit": "botol",
    "category": "BAHAN BAKU LAIN - BUMBU CAIR, SAUS, DAN KONDIMEN"
  },
  {
    "code": "BB.04.005",
    "name": "Saus tiram",
    "unit": "botol",
    "category": "BAHAN BAKU LAIN - BUMBU CAIR, SAUS, DAN KONDIMEN"
  },
  {
    "code": "BB.04.006",
    "name": "Cuka makan",
    "unit": "botol",
    "category": "BAHAN BAKU LAIN - BUMBU CAIR, SAUS, DAN KONDIMEN"
  },
  {
    "code": "BB.04.007",
    "name": "Mayones",
    "unit": "botol",
    "category": "BAHAN BAKU LAIN - BUMBU CAIR, SAUS, DAN KONDIMEN"
  },
  {
    "code": "BB.04.099",
    "name": "Bumbu cair, saus, dan kondimen-lainnya",
    "unit": "botol",
    "category": "BAHAN BAKU LAIN - BUMBU CAIR, SAUS, DAN KONDIMEN"
  },
  {
    "code": "BB.05.001",
    "name": "Santan segar",
    "unit": "pcs",
    "category": "BAHAN BAKU LAIN - PRODUK OLAHAN DASAR"
  },
  {
    "code": "BB.05.002",
    "name": "Santan instan cair",
    "unit": "pcs",
    "category": "BAHAN BAKU LAIN - PRODUK OLAHAN DASAR"
  },
  {
    "code": "BB.05.003",
    "name": "Santan bubuk",
    "unit": "pcs",
    "category": "BAHAN BAKU LAIN - PRODUK OLAHAN DASAR"
  },
  {
    "code": "BB.05.004",
    "name": "Kaldu bubuk ayam",
    "unit": "pcs",
    "category": "BAHAN BAKU LAIN - PRODUK OLAHAN DASAR"
  },
  {
    "code": "BB.05.005",
    "name": "Kaldu bubuk sapi",
    "unit": "pcs",
    "category": "BAHAN BAKU LAIN - PRODUK OLAHAN DASAR"
  },
  {
    "code": "BB.05.006",
    "name": "Kaldu jamur",
    "unit": "pcs",
    "category": "BAHAN BAKU LAIN - PRODUK OLAHAN DASAR"
  },
  {
    "code": "BB.05.007",
    "name": "Agar-agar bubuk",
    "unit": "pcs",
    "category": "BAHAN BAKU LAIN - PRODUK OLAHAN DASAR"
  },
  {
    "code": "BB.05.008",
    "name": "Gelatin",
    "unit": "pcs",
    "category": "BAHAN BAKU LAIN - PRODUK OLAHAN DASAR"
  },
  {
    "code": "BB.05.099",
    "name": "Produk olahan dasar-lainnya",
    "unit": "pcs",
    "category": "BAHAN BAKU LAIN - PRODUK OLAHAN DASAR"
  },
  {
    "code": "BB.06.001",
    "name": "Terasi",
    "unit": "pcs",
    "category": "BAHAN BAKU LAIN - BAHAN FERMENTASI/PELENGKAP"
  },
  {
    "code": "BB.06.002",
    "name": "Tauco",
    "unit": "pcs",
    "category": "BAHAN BAKU LAIN - BAHAN FERMENTASI/PELENGKAP"
  },
  {
    "code": "BB.06.003",
    "name": "Ragi roti",
    "unit": "pcs",
    "category": "BAHAN BAKU LAIN - BAHAN FERMENTASI/PELENGKAP"
  },
  {
    "code": "BB.06.004",
    "name": "Baking powder",
    "unit": "pcs",
    "category": "BAHAN BAKU LAIN - BAHAN FERMENTASI/PELENGKAP"
  },
  {
    "code": "BB.06.099",
    "name": "Bahan fermentasi/pelengkap-lainnya",
    "unit": "pcs",
    "category": "BAHAN BAKU LAIN - BAHAN FERMENTASI/PELENGKAP"
  },
  {
    "code": "BB.07.001",
    "name": "Air minum kemasan galon",
    "unit": "pcs",
    "category": "BAHAN BAKU LAIN - BAHAN MINUMAN PENDAMPING"
  },
  {
    "code": "BB.07.002",
    "name": "Air minum kemasan botol 2 liter",
    "unit": "dus",
    "category": "BAHAN BAKU LAIN - BAHAN MINUMAN PENDAMPING"
  },
  {
    "code": "BB.07.003",
    "name": "Air minum kemasan botol 1,5 liter",
    "unit": "dus",
    "category": "BAHAN BAKU LAIN - BAHAN MINUMAN PENDAMPING"
  },
  {
    "code": "BB.07.004",
    "name": "Air minum kemasan botol 600 ml",
    "unit": "dus",
    "category": "BAHAN BAKU LAIN - BAHAN MINUMAN PENDAMPING"
  },
  {
    "code": "BB.07.005",
    "name": "Air minum kemasan botol 330 ml",
    "unit": "dus",
    "category": "BAHAN BAKU LAIN - BAHAN MINUMAN PENDAMPING"
  },
  {
    "code": "BB.07.006",
    "name": "Air minum kemasan cup",
    "unit": "dus",
    "category": "BAHAN BAKU LAIN - BAHAN MINUMAN PENDAMPING"
  },
  {
    "code": "BB.07.007",
    "name": "Minuman kemasan botol/kaleng",
    "unit": "pcs",
    "category": "BAHAN BAKU LAIN - BAHAN MINUMAN PENDAMPING"
  },
  {
    "code": "BB.07.008",
    "name": "Susu kental manis",
    "unit": "pcs",
    "category": "BAHAN BAKU LAIN - BAHAN MINUMAN PENDAMPING"
  },
  {
    "code": "BB.07.099",
    "name": "Bahan minuman pendamping-lainnya",
    "unit": "pcs",
    "category": "BAHAN BAKU LAIN - BAHAN MINUMAN PENDAMPING"
  }
];

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
    await conn.query(`
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
    `);

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

    console.log(`Mulai seeding ${materialsData.length} bahan baku...`);
    let inserted = 0;
    let updated = 0;

    for (const m of materialsData) {
      const [res] = await conn.query(
        `INSERT INTO materials (code, name, category, unit, price)
         VALUES (?, ?, ?, ?, 0)
         ON DUPLICATE KEY UPDATE
           code = VALUES(code),
           category = VALUES(category),
           unit = VALUES(unit)`,
        [m.code, m.name, m.category, m.unit]
      );
      if (res.affectedRows === 1) inserted++;
      else if (res.affectedRows === 2) updated++;
    }

    console.log(`✅ Seeding selesai! Berhasil memasukkan ${inserted} item baru, memperbarui ${updated} item existing.`);
  } catch (err) {
    console.error("❌ Gagal seeding bahan baku:", err);
  } finally {
    await conn.end();
  }
}

runSeed();
