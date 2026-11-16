import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  ArrowRight,
  Utensils,
  Building2,
  Landmark,
  FileText,
  PackageSearch,
  Sprout,
  ClipboardCheck,
  Truck,
  ChevronRight,
  Award,
  Handshake,
  Compass,
  Clock,
  BadgePercent,
  FileSpreadsheet,
  Leaf,
  Beef,
  Wheat,
  Droplets,
  Flame,
  Box,
  Send,
  MessageSquarePlus,
  FileCheck2,
  PackageCheck,
  AlertCircle,
  Building,
  MapPin,
  Headset,
  Copy,
  CheckCircle2,
  Check,
  Menu,
  X,
  ExternalLink,
  MessageCircle,
  LogIn,
  LayoutDashboard,
} from "lucide-react";
import Logo from "@/components/Logo";
import { api } from "@/utils/api";
import { API_ENDPOINTS as E } from "@/utils/endpoints";

// Kamus Bahasa (ID & EN)
const TRANSLATIONS = {
  id: {
    nav_home: "Beranda",
    nav_about: "Tentang Kami",
    nav_advantages: "Keunggulan",
    nav_catalog: "Katalog Komoditas",
    nav_workflow: "Alur Pengadaan",
    nav_contact: "Hubungi & RFQ",
    nav_cta: "Ajukan Penawaran (RFQ)",
    nav_login: "Login Sistem",
    nav_dashboard: "Buka Dashboard",
    hero_badge: "Solusi Rantai Pasok & Pengadaan B2B Terintegrasi",
    hero_title: "Mitra Strategis Penyedia Bahan Baku Berkualitas untuk Kelancaran Operasional Anda",
    hero_subtitle:
      "Ikatandi Group menghadirkan rantai pasok bahan baku yang terintegrasi, higienis, dan tepat waktu—mendukung kebutuhan dapur skala besar, industri kuliner, katering korporasi, hingga pengadaan instansi di berbagai wilayah.",
    seg_corp: "Korporasi & HoReCa",
    seg_catering: "Katering Skala Besar",
    seg_gov: "Instansi & Program Khusus",
    hero_cta_primary: "Ajukan Penawaran (RFQ)",
    hero_cta_secondary: "Lihat Katalog Produk",
    card_status_label: "Standar Kinerja Operasional",
    card_status_title: "Jaminan Kualitas & Distribusi",
    card_active: "Siap Suplai",
    stat_1: "Ketepatan Waktu Pengiriman",
    stat_2: "QC & Sortir Higienis Berlapis",
    stat_3: "Jaringan Gudang & Cabang Terpadu",
    stat_4: "Administrasi PO & Invoice Rapi",
    flow_mini_1: "Sumber Utama",
    flow_mini_2: "Sortir & QC",
    flow_mini_3: "Armada Terjadwal",
    about_kicker: "Profil Perusahaan",
    about_title: "Lebih dari Sekadar Pemasok, Kami adalah Mitra Pertumbuhan Anda",
    about_p1:
      "Ikatandi Group berdiri dengan komitmen kuat untuk menjawab tantangan ketersediaan, konsistensi mutu, dan stabilitas harga bahan baku. Beroperasi melalui jaringan cabang serta kemitraan strategis dengan produsen langsung, kami mengelola distribusi komoditas pangan secara profesional.",
    about_p2:
      "Melalui manajemen pengadaan yang terstandar, kami memastikan setiap pesanan diproses secara transparan—mulai dari seleksi sumber bahan, kontrol kualitas higienis yang ketat, hingga pengiriman ke lokasi operasional Anda dalam kondisi prima dan siap pakai.",
    about_badge_1_title: "Kepatuhan Standar",
    about_badge_1_desc: "Higienitas & keamanan pangan terjaga",
    about_badge_2_title: "Kemitraan B2B",
    about_badge_2_desc: "Skema kontrak fleksibel & transparan",
    vision_label: "Visi Kami",
    vision_text:
      '"Menjadi grup penyedia bahan baku dan logistik pangan terdepan yang paling dipercaya oleh korporasi, industri kuliner, dan instansi di Indonesia melalui keunggulan layanan dan integritas rantai pasok."',
    mission_label: "Misi Perusahaan",
    mission_1_title: "Menjamin Mutu & Ketersediaan",
    mission_1_desc: "Menyediakan produk pangan berkualitas tinggi dengan ketersediaan stok yang stabil dan terjadwal.",
    mission_2_title: "Inovasi Layanan Terintegrasi",
    mission_2_desc: "Mengembangkan sistem pencatatan dan distribusi yang cepat, transparan, dan mudah diverifikasi.",
    mission_3_title: "Kemitraan Jangka Panjang",
    mission_3_desc:
      "Membangun hubungan yang saling menguntungkan berbasis kepercayaan, kepatuhan administratif, dan kepuasan mitra.",
    adv_kicker: "Keunggulan Korporat",
    adv_title: "Mengapa Bermitra dengan Ikatandi Group?",
    adv_subtitle: "Dirancang khusus untuk memenuhi standar tata kelola pengadaan bisnis modern dan instansi.",
    adv_1_title: "Kualitas Terjaga & Terstandar",
    adv_1_desc:
      "Setiap komoditas melalui proses penyortiran dan pemeriksaan mutu berlapis untuk menjamin kesegaran serta keamanan pangan sesuai SOP.",
    adv_2_title: "Ketepatan Waktu Pengiriman",
    adv_2_desc:
      "Didukung armada logistik terjadwal dan manajemen stok multi-cabang untuk meminimalkan risiko keterlambatan pasokan harian maupun berkala.",
    adv_3_title: "Harga Kompetitif & Transparan",
    adv_3_desc:
      "Kemitraan langsung dengan produsen dan distributor utama memungkinkan kami menawarkan struktur harga efisien dengan rincian biaya yang jelas.",
    adv_4_title: "Administrasi Terintegrasi",
    adv_4_desc:
      "Pencatatan mulai dari Purchase Order (PO), surat jalan, hingga invoice dikelola sistematis untuk memudahkan proses audit dan pembukuan mitra.",
    cat_kicker: "Lini Komoditas Utama",
    cat_title: "Solusi Pasokan Bahan Baku Terlengkap",
    cat_subtitle:
      "Pilih kategori di bawah ini untuk melihat spesifikasi pasokan atau klik tombol tambah untuk langsung memasukkannya ke draf permintaan penawaran (RFQ) Anda.",
    filter_all: "Semua Komoditas",
    filter_fresh: "Bahan Pangan Segar",
    filter_staples: "Bahan Pokok & Sembako",
    filter_dry: "Bahan Kering & Kemasan",
    flow_kicker: "Standar Operasional Prosedur",
    flow_title: "Proses Pengadaan yang Mudah dan Terukur",
    flow_subtitle: "Empat langkah sistematis dari pengajuan kebutuhan hingga serah terima barang di lokasi Anda.",
    step_1_title: "Konsultasi & Permintaan Penawaran",
    step_1_desc:
      "Sampaikan daftar kebutuhan komoditas (RAB/PO), estimasi volume, dan jadwal pengiriman yang diinginkan.",
    step_2_title: "Konfirmasi Harga & Ketersediaan",
    step_2_desc:
      "Tim pengadaan kami menyiapkan dokumen penawaran resmi dengan rincian spesifikasi produk dan skema kontrak.",
    step_3_title: "Proses Sortir & Pengemasan",
    step_3_desc:
      "Komoditas disiapkan, ditimbang akurat, dan diperiksa sesuai standar kualitas higienis sebelum diberangkatkan.",
    step_4_title: "Pengiriman & Serah Terima",
    step_4_desc:
      "Pesanan tiba tepat waktu di lokasi mitra lengkap dengan berita acara pengiriman dan invoice yang sah.",
    rfq_kicker: "Hubungi Kami & Permintaan Penawaran",
    rfq_title: "Mari Berdiskusi untuk Kebutuhan Pengadaan Anda",
    rfq_subtitle:
      "Lengkapi formulir Request for Quotation (RFQ) di bawah ini untuk mendapatkan penawaran harga resmi dan proposal kerja sama dari tim Ikatandi Group.",
    form_heading: "Formulir Permintaan Penawaran (RFQ)",
    form_subheading: "Respon tim pengadaan maksimal 1x24 jam hari kerja",
    label_pic: "Nama Lengkap / PIC",
    label_company: "Nama Perusahaan / Instansi",
    label_client_cat: "Kategori Klien",
    cat_opt_1: "Korporasi / Industri Kuliner",
    cat_opt_2: "Katering Skala Besar",
    cat_opt_3: "Pengadaan Instansi / Program Khusus",
    cat_opt_4: "Pemilik Cabang Toko / Ritel",
    label_phone: "Nomor WhatsApp / Telepon Aktif",
    label_email: "Email Resmi Perusahaan",
    label_location: "Wilayah / Lokasi Pengiriman",
    label_volume: "Estimasi Volume / Skala Anggaran",
    label_details: "Detail Kebutuhan & Komoditas Utama",
    btn_clear: "Bersihkan",
    btn_submit_rfq: "Kirim Permintaan Penawaran (Submit RFQ)",
    btn_submit_wa: "Kirim Langsung via WhatsApp",
    contact_card_title: "Informasi Kontak & Operasional",
    contact_addr_label: "Kantor Pusat & Pusat Distribusi",
    contact_hours_label: "Jam Operasional Layanan",
    day_mon_fri: "Senin – Jumat",
    day_sat: "Sabtu",
    day_sun: "Minggu / Hari Libur: Layanan darurat khusus mitra kontrak aktif (jalur PIC khusus).",
    contact_channel_label: "Saluran Komunikasi Resmi",
    assurance_title: "Dukungan Dokumen Legalitas & Tender",
    assurance_desc:
      "Ikatandi Group siap melampirkan profil perusahaan resmi (Company Profile), dokumen legalitas usaha, serta sampel produk untuk keperluan verifikasi vendor dan pengadaan instansi.",
    footer_desc:
      "Mitra strategis rantai pasok dan pengadaan bahan baku pangan berstandar mutu tinggi untuk korporasi, industri kuliner, katering skala besar, dan instansi.",
    footer_nav: "Navigasi",
    footer_services: "Layanan Kemitraan",
    footer_s1: "Pengadaan Kontrak Korporasi & HoReCa",
    footer_s2: "Suplai Dapur Katering Skala Besar",
    footer_s3: "Pengadaan Instansi & Program Pangan",
    footer_s4: "Distribusi Grosir & Jaringan Ritel",
    footer_rights: "Seluruh Hak Cipta Dilindungi Undang-Undang.",
    modal_title: "Permintaan Penawaran Terkirim",
    modal_desc:
      "Terima kasih. Dokumen Request for Quotation (RFQ) Anda telah tercatat dalam sistem pengadaan Ikatandi Group.",
    modal_close: "Tutup & Kembali ke Beranda",
    add_rfq_btn: "+ Tambah ke Draf RFQ",
  },
  en: {
    nav_home: "Home",
    nav_about: "About Us",
    nav_advantages: "Advantages",
    nav_catalog: "Commodities",
    nav_workflow: "Procurement Flow",
    nav_contact: "Contact & RFQ",
    nav_cta: "Request a Quote (RFQ)",
    nav_login: "System Login",
    nav_dashboard: "Open Dashboard",
    hero_badge: "Integrated B2B Supply Chain & Procurement Solutions",
    hero_title: "Strategic Raw Material Partner Ensuring Seamless Operations for Your Enterprise",
    hero_subtitle:
      "Ikatandi Group delivers reliable, hygienic, and punctual food supply chain solutions—supporting large-scale kitchens, culinary industries, corporate catering, and institutional procurement across regions.",
    seg_corp: "Corporates & HoReCa",
    seg_catering: "Large-Scale Catering",
    seg_gov: "Institutions & Programs",
    hero_cta_primary: "Request a Quote (RFQ)",
    hero_cta_secondary: "Explore Product Catalog",
    card_status_label: "Operational Performance Standard",
    card_status_title: "Quality & Distribution Assurance",
    card_active: "Ready to Supply",
    stat_1: "On-Time Delivery Rate",
    stat_2: "Multi-Layer Hygienic QC",
    stat_3: "Integrated Multi-Branch Network",
    stat_4: "Audit-Ready PO & Invoicing",
    flow_mini_1: "Direct Source",
    flow_mini_2: "Sorting & QC",
    flow_mini_3: "Scheduled Fleet",
    about_kicker: "Company Profile",
    about_title: "More Than a Supplier—Your Strategic Growth Partner",
    about_p1:
      "Ikatandi Group was established to bridge the gap between quality food sources and high-demand commercial operations. Operating through an integrated branch network and direct producer partnerships, we manage food commodity distribution professionally.",
    about_p2:
      "Through standardized procurement management, we ensure absolute transparency—from source selection and strict hygienic quality control to punctual delivery in prime condition.",
    about_badge_1_title: "Standard Compliance",
    about_badge_1_desc: "Strict food safety & hygiene protocols",
    about_badge_2_title: "B2B Partnership",
    about_badge_2_desc: "Flexible & transparent contract schemes",
    vision_label: "Our Vision",
    vision_text:
      '"To become the leading raw material and food logistics group most trusted by corporations, culinary industries, and institutions in Indonesia through service excellence and supply chain integrity."',
    mission_label: "Corporate Mission",
    mission_1_title: "Guarantee Quality & Availability",
    mission_1_desc: "Provide high-quality food products with stable, scheduled stock availability.",
    mission_2_title: "Integrated Service Innovation",
    mission_2_desc: "Develop fast, transparent, and easily verifiable recording and distribution systems.",
    mission_3_title: "Long-Term Partnerships",
    mission_3_desc:
      "Build mutually beneficial relationships grounded in trust, administrative compliance, and partner satisfaction.",
    adv_kicker: "Corporate Advantages",
    adv_title: "Why Partner with Ikatandi Group?",
    adv_subtitle: "Engineered specifically to meet modern corporate governance and institutional procurement standards.",
    adv_1_title: "Standardized Quality Control",
    adv_1_desc:
      "Every commodity undergoes multi-stage sorting and quality inspection to guarantee freshness and food safety compliance.",
    adv_2_title: "Punctual Delivery Schedule",
    adv_2_desc:
      "Supported by scheduled logistics fleets and multi-branch inventory management to eliminate daily or periodic supply delays.",
    adv_3_title: "Competitive & Transparent Pricing",
    adv_3_desc:
      "Direct partnerships with primary producers allow us to offer efficient pricing structures with clear cost breakdowns.",
    adv_4_title: "Integrated Administration",
    adv_4_desc:
      "Documentation from Purchase Orders (PO) and delivery notes to invoices is systematically managed for seamless auditing.",
    cat_kicker: "Core Commodity Lines",
    cat_title: "Comprehensive Raw Material Supply Solutions",
    cat_subtitle:
      "Filter categories below to inspect supply specifications or click add to include items directly in your RFQ draft.",
    filter_all: "All Commodities",
    filter_fresh: "Fresh Produce & Protein",
    filter_staples: "Staple Foods",
    filter_dry: "Dry Goods & Packaging",
    flow_kicker: "Standard Operating Procedure",
    flow_title: "Simple and Measurable Procurement Process",
    flow_subtitle: "Four systematic steps from requirement submission to on-site handover.",
    step_1_title: "Consultation & RFQ Submission",
    step_1_desc: "Submit your commodity list (BOQ/PO), estimated volume, and preferred delivery schedule.",
    step_2_title: "Price & Stock Confirmation",
    step_2_desc: "Our procurement team prepares an official quotation detailing product specifications and contract terms.",
    step_3_title: "Sorting & Hygienic Packaging",
    step_3_desc:
      "Commodities are prepared, accurately weighed, and inspected under strict hygiene standards prior to dispatch.",
    step_4_title: "Delivery & Official Handover",
    step_4_desc: "Orders arrive on schedule at your facility accompanied by valid delivery receipts and invoices.",
    rfq_kicker: "Contact Us & Request for Quotation",
    rfq_title: "Let’s Discuss Your Procurement Requirements",
    rfq_subtitle:
      "Complete the Request for Quotation (RFQ) form below to receive an official price quote and partnership proposal from Ikatandi Group.",
    form_heading: "Request for Quotation (RFQ) Form",
    form_subheading: "Procurement team response within 1x24 business hours",
    label_pic: "Full Name / PIC",
    label_company: "Company / Institution Name",
    label_client_cat: "Client Category",
    cat_opt_1: "Corporate / Culinary Industry",
    cat_opt_2: "Large-Scale Catering",
    cat_opt_3: "Institutional / Special Program",
    cat_opt_4: "Store / Retail Chain Owner",
    label_phone: "Active WhatsApp / Phone Number",
    label_email: "Official Corporate Email",
    label_location: "Delivery Region / Location",
    label_volume: "Estimated Volume / Budget Scale",
    label_details: "Requirement Details & Key Commodities",
    btn_clear: "Clear",
    btn_submit_rfq: "Submit Request for Quotation (RFQ)",
    btn_submit_wa: "Send Directly via WhatsApp",
    contact_card_title: "Contact & Operational Information",
    contact_addr_label: "Head Office & Distribution Center",
    contact_hours_label: "Service Operational Hours",
    day_mon_fri: "Monday – Friday",
    day_sat: "Saturday",
    day_sun: "Sunday / Public Holidays: Emergency support exclusively for active contract partners (dedicated PIC line).",
    contact_channel_label: "Official Communication Channels",
    assurance_title: "Legal & Tender Documentation Support",
    assurance_desc:
      "Ikatandi Group provides official Company Profiles, business legality certificates, and product samples for vendor verification and institutional procurement.",
    footer_desc:
      "Strategic supply chain and high-standard food raw material procurement partner for corporations, culinary industries, large catering, and institutions.",
    footer_nav: "Navigation",
    footer_services: "Partnership Services",
    footer_s1: "Corporate & HoReCa Contract Supply",
    footer_s2: "Large-Scale Catering Kitchen Supply",
    footer_s3: "Institutional & Food Program Procurement",
    footer_s4: "Wholesale & Retail Network Distribution",
    footer_rights: "All Rights Reserved.",
    modal_title: "Quotation Request Submitted",
    modal_desc: "Thank you. Your Request for Quotation (RFQ) has been logged into Ikatandi Group’s procurement system.",
    modal_close: "Close & Return to Home",
    add_rfq_btn: "+ Add to RFQ Draft",
  },
};

// Data Komoditas Utama
const COMMODITIES = [
  {
    id: 1,
    category: "segar",
    badge_id: "Bahan Pangan Segar",
    badge_en: "Fresh Produce",
    title_id: "Sayuran & Buah-Buahan Segar",
    title_en: "Fresh Vegetables & Fruits",
    desc_id:
      "Sayuran daun, umbi-umbian, cabai, bawang, serta buah segar hasil panen pilihan dengan kontrol rantai dingin.",
    desc_en: "Leafy greens, root vegetables, chilies, shallots, and selected fresh fruits with cold-chain handling.",
    specs_id: "Grade A • Sortir Harian • Kemasan Krat/Karung Higienis",
    specs_en: "Grade A • Daily Sorting • Hygienic Crate/Sack Packaging",
    icon: Leaf,
  },
  {
    id: 2,
    category: "segar",
    badge_id: "Bahan Pangan Segar",
    badge_en: "Fresh Protein",
    title_id: "Daging, Unggas & Hasil Laut",
    title_en: "Meat, Poultry & Seafood",
    desc_id:
      "Daging sapi potong, ayam karkas/boneless, telur ayam negeri, serta ikan segar/beku bersertifikat halal.",
    desc_en: "Beef cuts, whole/boneless chicken, fresh eggs, and halal-certified fresh/frozen seafood.",
    specs_id: "Sertifikasi Halal • Rantai Dingin (Cold Storage) • Potongan Custom",
    specs_en: "Halal Certified • Cold Storage • Custom Cuts Available",
    icon: Beef,
  },
  {
    id: 3,
    category: "sembako",
    badge_id: "Bahan Pokok & Sembako",
    badge_en: "Staple Foods",
    title_id: "Beras Premium & Medium",
    title_en: "Premium & Medium Rice",
    desc_id:
      "Pasokan beras pulen dan pera berkualitas konsisten dalam kemasan karung 5kg, 25kg, hingga 50kg untuk dapur besar.",
    desc_en: "Consistent quality rice supplied in 5kg, 25kg, and 50kg sacks tailored for large-scale kitchens.",
    specs_id: "Kadar Air Terukur • Bebas Kutu • Stok Kontrak Bulanan",
    specs_en: "Measured Moisture • Pest-Free • Monthly Contract Stock",
    icon: Wheat,
  },
  {
    id: 4,
    category: "sembako",
    badge_id: "Bahan Pokok & Sembako",
    badge_en: "Staple Foods",
    title_id: "Minyak Goreng, Gula & Tepung",
    title_en: "Cooking Oil, Sugar & Flour",
    desc_id:
      "Minyak goreng kemasan jerigen/pouch industri, gula pasir kristal putih, serta aneka tepung terigu dan tapioka.",
    desc_en: "Industrial jerrycan/pouch cooking oil, white crystal sugar, and various wheat & tapioca flours.",
    specs_id: "SNI & BPOM • Kemasan Grosir/Industri • Harga Distributor",
    specs_en: "SNI & BPOM Certified • Bulk Packaging • Distributor Pricing",
    icon: Droplets,
  },
  {
    id: 5,
    category: "kering",
    badge_id: "Bahan Kering & Kemasan",
    badge_en: "Dry Goods & Spices",
    title_id: "Rempah-Rempah & Bumbu Dasar",
    title_en: "Spices & Culinary Seasonings",
    desc_id:
      "Rempah kering Nusantara, kecap, saus industri, kaldu, dan bumbu olahan untuk konsistensi cita rasa masakan.",
    desc_en:
      "Indonesian dried spices, soy sauces, industrial condiments, stocks, and seasonings for flavor consistency.",
    specs_id: "Kering Optimal • Masa Simpan Panjang • Kemasan Karton/Jerigen",
    specs_en: "Optimal Dryness • Long Shelf-Life • Carton/Jerrycan Packs",
    icon: Flame,
  },
  {
    id: 6,
    category: "kering",
    badge_id: "Bahan Kering & Kemasan",
    badge_en: "Packaging Supplies",
    title_id: "Kemasan Makanan & Perlengkapan Dapur",
    title_en: "Food Packaging & Kitchen Supplies",
    desc_id:
      "Food container, lunch box kertas food-grade, aluminium foil, plastik vakum, dan perlengkapan higienitas dapur.",
    desc_en: "Food containers, food-grade paper lunch boxes, aluminum foil, vacuum bags, and kitchen hygiene supplies.",
    specs_id: "Food-Grade • Ramah Lingkungan • Suplai Terjadwal",
    specs_en: "Food-Grade • Eco-Friendly Options • Scheduled Supply",
    icon: Box,
  },
];

export default function LandingPage() {
  const [lang, setLang] = useState("id");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [toastMessage, setToastMessage] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const toastTimeoutRef = useRef(null);
  const detailsRef = useRef(null);

  // Kontak Dinamis dari Database Pengguna (Users)
  const [contact, setContact] = useState({
    phone: "082312693414",
    email: "mochamirudin17899@gmail.com",
    address: "Jl. Logistik Pangan No. 45, Kawasan Niaga Terpadu, Jakarta & Jaringan Cabang Regional, Indonesia",
    company_name: "Ikatandi Group",
  });

  // Cek Status Login Pengguna
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(Boolean(localStorage.getItem("token")));

    // Tarik kontak publik dari backend
    api
      .get(E.PUBLIC.CONTACT)
      .then((res) => {
        if (res.data?.data) {
          setContact((prev) => ({
            ...prev,
            ...res.data.data,
          }));
        }
      })
      .catch(() => {
        // Fallback tetap ke default
      });
  }, []);

  const t = TRANSLATIONS[lang] || TRANSLATIONS.id;

  // Format nomor WhatsApp untuk URL wa.me
  const cleanPhone = (contact.phone || "").replace(/\D/g, "");
  const waNumber = cleanPhone.startsWith("0") ? "62" + cleanPhone.slice(1) : cleanPhone || "6282312693414";

  // State Formulir RFQ
  const [rfqForm, setRfqForm] = useState({
    picName: "",
    companyName: "",
    clientCategory: "Korporasi / Industri Kuliner",
    phone: "",
    email: "",
    location: "",
    budget: "",
    details: "",
  });

  const [formError, setFormError] = useState("");
  const [submittedModal, setSubmittedModal] = useState(null); // null | { refId, company, pic }

  // Tampilkan Notifikasi Toast
  const showToast = (msg) => {
    setToastMessage(msg);
    setToastVisible(true);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => {
      setToastVisible(false);
    }, 3200);
  };

  // Salin Teks ke Clipboard
  const handleCopy = (text, label) => {
    navigator.clipboard.writeText(text);
    showToast(lang === "id" ? `${label} berhasil disalin: ${text}` : `${label} copied: ${text}`);
  };

  // Tambah Item Komoditas langsung ke Textarea RFQ
  const handleAddToRFQ = (itemName) => {
    const current = rfqForm.details.trim();
    const prefix = lang === "id" ? "- Kebutuhan komoditas: " : "- Required commodity: ";
    const entry = `${prefix}${itemName} (Estimasi volume: ...)`;

    if (!current.includes(itemName)) {
      setRfqForm((prev) => ({
        ...prev,
        details: current ? `${current}\n${entry}` : entry,
      }));
    }

    showToast(lang === "id" ? `"${itemName}" ditambahkan ke draf RFQ` : `"${itemName}" added to RFQ draft`);

    // Smooth scroll ke section RFQ
    const el = document.getElementById("rfq");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
      setTimeout(() => {
        if (detailsRef.current) detailsRef.current.focus();
      }, 500);
    }
  };

  // Submit Formulir RFQ
  const handleSubmitRFQ = (e) => {
    e.preventDefault();
    const { picName, companyName, phone, email, location, details } = rfqForm;

    if (!picName || !companyName || !phone || !email || !location || !details) {
      setFormError(
        lang === "id"
          ? "Mohon lengkapi seluruh kolom bertanda bintang (*) sebelum mengirim penawaran."
          : "Please complete all fields marked with an asterisk (*) before submitting."
      );
      return;
    }

    setFormError("");
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const refCode = `RFQ-IKT-2026-${randomNum}`;

    setSubmittedModal({
      refId: refCode,
      company: companyName,
      pic: picName,
    });

    // Reset Form
    setRfqForm({
      picName: "",
      companyName: "",
      clientCategory: "Korporasi / Industri Kuliner",
      phone: "",
      email: "",
      location: "",
      budget: "",
      details: "",
    });
  };

  // Kirim RFQ Langsung ke WhatsApp Admin
  const handleSendViaWhatsApp = () => {
    const { picName, companyName, clientCategory, phone, email, location, budget, details } = rfqForm;

    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const refCode = `RFQ-IKT-2026-${randomNum}`;

    const text = `*PERMINTAAN PENAWARAN (RFQ) - IKATANDI GROUP*
Ref: ${refCode}

*Data Perusahaan/Klien:*
• Nama PIC: ${picName || "-"}
• Perusahaan: ${companyName || "-"}
• Kategori: ${clientCategory || "-"}
• No. HP/WA: ${phone || "-"}
• Email: ${email || "-"}

*Detail Pengadaan:*
• Lokasi Pengiriman: ${location || "-"}
• Estimasi Budget/Volume: ${budget || "-"}

*Rincian Kebutuhan Komoditas:*
${details || "-"}`;

    window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(text)}`, "_blank");
  };

  // Filter Komoditas
  const filteredCommodities =
    activeFilter === "all" ? COMMODITIES : COMMODITIES.filter((c) => c.category === activeFilter);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 antialiased selection:bg-emerald-800 selection:text-white">
      {/* ================= NAVBAR ================= */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Brand Logo */}
            <a href="#beranda" className="flex items-center gap-3 group">
              <Logo size="md" className="group-hover:scale-102 transition-transform" />
            </a>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-slate-600">
              <a href="#beranda" className="hover:text-emerald-700 transition-colors">
                {t.nav_home}
              </a>
              <a href="#tentang" className="hover:text-emerald-700 transition-colors">
                {t.nav_about}
              </a>
              <a href="#keunggulan" className="hover:text-emerald-700 transition-colors">
                {t.nav_advantages}
              </a>
              <a href="#komoditas" className="hover:text-emerald-700 transition-colors">
                {t.nav_catalog}
              </a>
              <a href="#alur" className="hover:text-emerald-700 transition-colors">
                {t.nav_workflow}
              </a>
              <a href="#rfq" className="hover:text-emerald-700 transition-colors">
                {t.nav_contact}
              </a>
            </nav>

            {/* Right Actions: Language Switcher, Portal/Login & RFQ CTA */}
            <div className="hidden md:flex items-center gap-3">
              {/* Language Switcher */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setLang("id")}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                    lang === "id" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  ID
                </button>
                <button
                  type="button"
                  onClick={() => setLang("en")}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                    lang === "en" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  EN
                </button>
              </div>

              {/* Login / Dashboard Link */}
              {isLoggedIn ? (
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-white text-slate-800 hover:bg-slate-50 transition-all"
                >
                  <LayoutDashboard size={14} className="text-teal-600" />
                  <span>{t.nav_dashboard}</span>
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-white text-slate-800 hover:bg-slate-50 transition-all"
                >
                  <LogIn size={14} className="text-slate-500" />
                  <span>{t.nav_login}</span>
                </Link>
              )}

              {/* RFQ CTA Button */}
              <a
                href="#rfq"
                className="inline-flex items-center gap-2 bg-emerald-800 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold px-4 sm:px-5 py-2.5 rounded-xl shadow-xs hover:shadow transition-all"
              >
                <span>{t.nav_cta}</span>
                <ArrowRight size={15} className="text-amber-300" />
              </a>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center gap-2 lg:hidden">
              <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 md:hidden">
                <button
                  type="button"
                  onClick={() => setLang("id")}
                  className={`px-2 py-1 text-xs font-bold rounded ${
                    lang === "id" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500"
                  }`}
                >
                  ID
                </button>
                <button
                  type="button"
                  onClick={() => setLang("en")}
                  className={`px-2 py-1 text-xs font-bold rounded ${
                    lang === "en" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500"
                  }`}
                >
                  EN
                </button>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2.5 rounded-xl text-slate-700 hover:bg-slate-100 focus:outline-none"
                aria-label="Menu"
              >
                {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-slate-200 px-4 pt-3 pb-6 space-y-2 shadow-lg">
            <a
              href="#beranda"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-800"
            >
              {t.nav_home}
            </a>
            <a
              href="#tentang"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-800"
            >
              {t.nav_about}
            </a>
            <a
              href="#keunggulan"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-800"
            >
              {t.nav_advantages}
            </a>
            <a
              href="#komoditas"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-800"
            >
              {t.nav_catalog}
            </a>
            <a
              href="#alur"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-800"
            >
              {t.nav_workflow}
            </a>
            <a
              href="#rfq"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-800"
            >
              {t.nav_contact}
            </a>
            <div className="pt-2 flex flex-col gap-2">
              {isLoggedIn ? (
                <Link
                  to="/dashboard"
                  className="w-full flex justify-center items-center gap-2 border border-slate-200 bg-slate-50 text-slate-800 font-bold px-4 py-2.5 rounded-xl text-sm"
                >
                  <LayoutDashboard size={16} className="text-teal-600" />
                  <span>{t.nav_dashboard}</span>
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="w-full flex justify-center items-center gap-2 border border-slate-200 bg-slate-50 text-slate-800 font-bold px-4 py-2.5 rounded-xl text-sm"
                >
                  <LogIn size={16} className="text-slate-500" />
                  <span>{t.nav_login}</span>
                </Link>
              )}
              <a
                href="#rfq"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex justify-center items-center gap-2 bg-emerald-800 text-white font-semibold px-4 py-3 rounded-xl text-sm"
              >
                <span>{t.nav_cta}</span>
                <ArrowRight size={16} className="text-amber-300" />
              </a>
            </div>
          </div>
        )}
      </header>

      {/* ================= HERO SECTION ================= */}
      <section
        id="beranda"
        className="relative overflow-hidden bg-gradient-to-br from-[#061020] via-[#0a192f] to-[#064e3b] text-white pt-14 pb-20 lg:pt-20 lg:pb-28"
      >
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        {/* Ambient Glows */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Column: Copy & CTA */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-amber-400 text-xs font-semibold tracking-wide uppercase">
                <ShieldCheck size={16} />
                <span>{t.hero_badge}</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.15] text-white font-display">
                {t.hero_title}
              </h1>

              <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
                {t.hero_subtitle}
              </p>

              {/* Target Segment Pills */}
              <div className="flex flex-wrap gap-2 pt-1 text-xs font-medium text-slate-200">
                <span className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 flex items-center gap-1.5">
                  <Building2 size={14} className="text-emerald-400" />
                  <span>{t.seg_corp}</span>
                </span>
                <span className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 flex items-center gap-1.5">
                  <Utensils size={14} className="text-emerald-400" />
                  <span>{t.seg_catering}</span>
                </span>
                <span className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 flex items-center gap-1.5">
                  <Landmark size={14} className="text-emerald-400" />
                  <span>{t.seg_gov}</span>
                </span>
              </div>

              {/* Primary & Secondary CTA */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-3">
                <a
                  href="#rfq"
                  className="inline-flex justify-center items-center gap-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-7 py-3.5 rounded-xl shadow-lg shadow-amber-500/20 transition-all text-sm sm:text-base"
                >
                  <FileText size={18} />
                  <span>{t.hero_cta_primary}</span>
                </a>
                <a
                  href="#komoditas"
                  className="inline-flex justify-center items-center gap-2.5 bg-white/10 hover:bg-white/15 text-white border border-white/20 font-semibold px-7 py-3.5 rounded-xl transition-all text-sm sm:text-base"
                >
                  <PackageSearch size={18} className="text-emerald-400" />
                  <span>{t.hero_cta_secondary}</span>
                </a>
              </div>
            </div>

            {/* Right Column: Supply Chain Trust Dashboard Card */}
            <div className="lg:col-span-5">
              <div className="bg-white/5 backdrop-blur-md border border-white/12 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
                <div className="flex items-center justify-between border-b border-white/10 pb-5 mb-6">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-amber-400 font-semibold">
                      {t.card_status_label}
                    </p>
                    <h2 className="font-bold text-lg text-white mt-0.5">
                      {t.card_status_title}
                    </h2>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>{t.card_active}</span>
                  </span>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-[#061020]/70 border border-white/10 rounded-2xl p-4">
                    <div className="text-2xl sm:text-3xl font-extrabold text-amber-400">99.4%</div>
                    <div className="text-xs text-slate-300 mt-1 font-medium">{t.stat_1}</div>
                  </div>
                  <div className="bg-[#061020]/70 border border-white/10 rounded-2xl p-4">
                    <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400">100%</div>
                    <div className="text-xs text-slate-300 mt-1 font-medium">{t.stat_2}</div>
                  </div>
                  <div className="bg-[#061020]/70 border border-white/10 rounded-2xl p-4">
                    <div className="text-xl sm:text-2xl font-extrabold text-white">Multi-Hub</div>
                    <div className="text-xs text-slate-300 mt-1 font-medium">{t.stat_3}</div>
                  </div>
                  <div className="bg-[#061020]/70 border border-white/10 rounded-2xl p-4">
                    <div className="text-xl sm:text-2xl font-extrabold text-white">Audit-Ready</div>
                    <div className="text-xs text-slate-300 mt-1 font-medium">{t.stat_4}</div>
                  </div>
                </div>

                {/* Mini Supply Chain Flow Visual */}
                <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                  <div className="flex items-center justify-between text-xs text-slate-300 font-medium">
                    <div className="flex flex-col items-center text-center gap-1.5">
                      <div className="w-9 h-9 rounded-full bg-emerald-800/80 flex items-center justify-center text-emerald-300">
                        <Sprout size={18} />
                      </div>
                      <span>{t.flow_mini_1}</span>
                    </div>
                    <ChevronRight size={16} className="text-slate-500" />
                    <div className="flex flex-col items-center text-center gap-1.5">
                      <div className="w-9 h-9 rounded-full bg-emerald-800/80 flex items-center justify-center text-emerald-300">
                        <ClipboardCheck size={18} />
                      </div>
                      <span>{t.flow_mini_2}</span>
                    </div>
                    <ChevronRight size={16} className="text-slate-500" />
                    <div className="flex flex-col items-center text-center gap-1.5">
                      <div className="w-9 h-9 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400">
                        <Truck size={18} />
                      </div>
                      <span>{t.flow_mini_3}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= TENTANG KAMI, VISI & MISI ================= */}
      <section id="tentang" className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 items-start">
            {/* Left: Company Profile */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 text-emerald-800 font-bold text-xs uppercase tracking-widest">
                <span className="w-8 h-0.5 bg-emerald-800"></span>
                <span>{t.about_kicker}</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0a192f] leading-tight">
                {t.about_title}
              </h2>
              <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
                {t.about_p1}
              </p>
              <p className="text-slate-600 text-base leading-relaxed">
                {t.about_p2}
              </p>

              <div className="grid grid-cols-2 gap-4 pt-3">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800 shrink-0">
                    <Award size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#0a192f] text-sm">{t.about_badge_1_title}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{t.about_badge_1_desc}</p>
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-amber-100 text-amber-800 shrink-0">
                    <Handshake size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#0a192f] text-sm">{t.about_badge_2_title}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{t.about_badge_2_desc}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Visi & Misi Cards */}
            <div className="lg:col-span-6 space-y-6">
              {/* Visi Card */}
              <div className="rounded-3xl bg-gradient-to-br from-[#0a192f] to-[#102a43] text-white p-7 sm:p-8 shadow-xl relative overflow-hidden">
                <div className="absolute right-4 top-4 opacity-10">
                  <Compass size={96} />
                </div>
                <span className="inline-block px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider mb-3">
                  {t.vision_label}
                </span>
                <p className="text-lg sm:text-xl font-bold leading-relaxed text-white">
                  {t.vision_text}
                </p>
              </div>

              {/* Misi Card */}
              <div className="rounded-3xl bg-emerald-50/70 border border-emerald-200/80 p-7 sm:p-8">
                <span className="inline-block px-3 py-1 rounded-full bg-emerald-800 text-white text-xs font-bold uppercase tracking-wider mb-5">
                  {t.mission_label}
                </span>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-7 h-7 rounded-full bg-emerald-800 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      1
                    </div>
                    <div>
                      <h4 className="font-bold text-[#0a192f] text-sm sm:text-base">{t.mission_1_title}</h4>
                      <p className="text-sm text-slate-600 mt-0.5">{t.mission_1_desc}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-7 h-7 rounded-full bg-emerald-800 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      2
                    </div>
                    <div>
                      <h4 className="font-bold text-[#0a192f] text-sm sm:text-base">{t.mission_2_title}</h4>
                      <p className="text-sm text-slate-600 mt-0.5">{t.mission_2_desc}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-7 h-7 rounded-full bg-emerald-800 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      3
                    </div>
                    <div>
                      <h4 className="font-bold text-[#0a192f] text-sm sm:text-base">{t.mission_3_title}</h4>
                      <p className="text-sm text-slate-600 mt-0.5">{t.mission_3_desc}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= KEUNGGULAN UTAMA ================= */}
      <section id="keunggulan" className="py-20 bg-slate-100/80 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-emerald-800 font-bold text-xs uppercase tracking-widest">{t.adv_kicker}</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0a192f] mt-2">
              {t.adv_title}
            </h2>
            <p className="text-slate-600 mt-3 text-base">{t.adv_subtitle}</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/80 hover:shadow-md hover:border-emerald-300 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-800 group-hover:bg-emerald-800 group-hover:text-white flex items-center justify-center mb-5 transition-colors">
                <ShieldCheck size={24} />
              </div>
              <h3 className="font-bold text-lg text-[#0a192f] mb-2">{t.adv_1_title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{t.adv_1_desc}</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/80 hover:shadow-md hover:border-emerald-300 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-800 group-hover:bg-emerald-800 group-hover:text-white flex items-center justify-center mb-5 transition-colors">
                <Clock size={24} />
              </div>
              <h3 className="font-bold text-lg text-[#0a192f] mb-2">{t.adv_2_title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{t.adv_2_desc}</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/80 hover:shadow-md hover:border-emerald-300 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-800 group-hover:bg-emerald-800 group-hover:text-white flex items-center justify-center mb-5 transition-colors">
                <BadgePercent size={24} />
              </div>
              <h3 className="font-bold text-lg text-[#0a192f] mb-2">{t.adv_3_title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{t.adv_3_desc}</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/80 hover:shadow-md hover:border-emerald-300 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-800 group-hover:bg-emerald-800 group-hover:text-white flex items-center justify-center mb-5 transition-colors">
                <FileSpreadsheet size={24} />
              </div>
              <h3 className="font-bold text-lg text-[#0a192f] mb-2">{t.adv_4_title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{t.adv_4_desc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= LINI KOMODITAS UTAMA ================= */}
      <section id="komoditas" className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
            <div>
              <span className="text-emerald-800 font-bold text-xs uppercase tracking-widest">{t.cat_kicker}</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0a192f] mt-2">
                {t.cat_title}
              </h2>
              <p className="text-slate-600 mt-2 max-w-2xl">{t.cat_subtitle}</p>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setActiveFilter("all")}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  activeFilter === "all"
                    ? "bg-[#0a192f] text-white shadow-xs"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {t.filter_all}
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter("segar")}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  activeFilter === "segar"
                    ? "bg-[#0a192f] text-white shadow-xs"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {t.filter_fresh}
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter("sembako")}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  activeFilter === "sembako"
                    ? "bg-[#0a192f] text-white shadow-xs"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {t.filter_staples}
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter("kering")}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  activeFilter === "kering"
                    ? "bg-[#0a192f] text-white shadow-xs"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {t.filter_dry}
              </button>
            </div>
          </div>

          {/* Catalog Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCommodities.map((item) => {
              const IconComp = item.icon;
              const badge = lang === "id" ? item.badge_id : item.badge_en;
              const title = lang === "id" ? item.title_id : item.title_en;
              const desc = lang === "id" ? item.desc_id : item.desc_en;
              const specs = lang === "id" ? item.specs_id : item.specs_en;

              return (
                <div
                  key={item.id}
                  className="bg-slate-50 rounded-2xl p-6 border border-slate-200/90 hover:bg-white hover:shadow-lg hover:border-emerald-300 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                        {badge}
                      </span>
                      <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-[#0a192f] shadow-xs">
                        <IconComp size={18} className="text-emerald-700" />
                      </div>
                    </div>
                    <h3 className="font-bold text-lg text-[#0a192f] mb-2">{title}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed mb-4">{desc}</p>
                  </div>
                  <div className="pt-4 border-t border-slate-200/80 space-y-3">
                    <p className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                      <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                      <span>{specs}</span>
                    </p>
                    <button
                      type="button"
                      onClick={() => handleAddToRFQ(title)}
                      className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-[#0a192f] text-[#0a192f] hover:text-white border border-slate-300 hover:border-[#0a192f] font-semibold text-xs transition-all flex items-center justify-center gap-1.5"
                    >
                      <span>{t.add_rfq_btn}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= ALUR PENGADAAN ================= */}
      <section id="alur" className="py-20 bg-[#0a192f] text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-amber-400 font-bold text-xs uppercase tracking-widest">{t.flow_kicker}</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">
              {t.flow_title}
            </h2>
            <p className="text-slate-300 mt-3 text-base">{t.flow_subtitle}</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            <div className="bg-white/5 border border-white/12 rounded-2xl p-6 relative">
              <div className="flex items-center justify-between mb-5">
                <span className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 font-extrabold text-lg flex items-center justify-center">
                  01
                </span>
                <MessageSquarePlus size={24} className="text-amber-400" />
              </div>
              <h3 className="font-bold text-lg text-white mb-2">{t.step_1_title}</h3>
              <p className="text-sm text-slate-300 leading-relaxed">{t.step_1_desc}</p>
            </div>

            <div className="bg-white/5 border border-white/12 rounded-2xl p-6 relative">
              <div className="flex items-center justify-between mb-5">
                <span className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-extrabold text-lg flex items-center justify-center">
                  02
                </span>
                <FileCheck2 size={24} className="text-emerald-400" />
              </div>
              <h3 className="font-bold text-lg text-white mb-2">{t.step_2_title}</h3>
              <p className="text-sm text-slate-300 leading-relaxed">{t.step_2_desc}</p>
            </div>

            <div className="bg-white/5 border border-white/12 rounded-2xl p-6 relative">
              <div className="flex items-center justify-between mb-5">
                <span className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-extrabold text-lg flex items-center justify-center">
                  03
                </span>
                <PackageCheck size={24} className="text-emerald-400" />
              </div>
              <h3 className="font-bold text-lg text-white mb-2">{t.step_3_title}</h3>
              <p className="text-sm text-slate-300 leading-relaxed">{t.step_3_desc}</p>
            </div>

            <div className="bg-white/5 border border-white/12 rounded-2xl p-6 relative">
              <div className="flex items-center justify-between mb-5">
                <span className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 font-extrabold text-lg flex items-center justify-center">
                  04
                </span>
                <Truck size={24} className="text-amber-400" />
              </div>
              <h3 className="font-bold text-lg text-white mb-2">{t.step_4_title}</h3>
              <p className="text-sm text-slate-300 leading-relaxed">{t.step_4_desc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= HUBUNGI KAMI & FORMULIR RFQ ================= */}
      <section id="rfq" className="py-20 lg:py-28 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-emerald-800 font-bold text-xs uppercase tracking-widest">{t.rfq_kicker}</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0a192f] mt-2">
              {t.rfq_title}
            </h2>
            <p className="text-slate-600 mt-3 text-base">{t.rfq_subtitle}</p>
          </div>

          <div className="grid lg:grid-cols-12 gap-8 lg:gap-10 items-start">
            {/* Left Column (7 cols): Interactive RFQ Form */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-10 shadow-lg border border-slate-200/80">
              <div className="flex items-center justify-between border-b border-slate-100 pb-5 mb-6">
                <div>
                  <h3 className="font-bold text-xl text-[#0a192f]">{t.form_heading}</h3>
                  <p className="text-xs text-slate-500 mt-1">{t.form_subheading}</p>
                </div>
                <span className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                  B2B Official
                </span>
              </div>

              <form onSubmit={handleSubmitRFQ} className="space-y-5" noValidate>
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                      <span>{t.label_pic}</span> <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Budi Santoso"
                      value={rfqForm.picName}
                      onChange={(e) => setRfqForm({ ...rfqForm, picName: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                      <span>{t.label_company}</span> <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="PT / CV / Nama Instansi"
                      value={rfqForm.companyName}
                      onChange={(e) => setRfqForm({ ...rfqForm, companyName: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Kategori Klien */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    <span>{t.label_client_cat}</span> <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid sm:grid-cols-2 gap-2.5">
                    {[
                      { val: "Korporasi / Industri Kuliner", label: t.cat_opt_1 },
                      { val: "Katering Skala Besar", label: t.cat_opt_2 },
                      { val: "Pengadaan Instansi / Program Khusus", label: t.cat_opt_3 },
                      { val: "Pemilik Cabang Toko / Ritel", label: t.cat_opt_4 },
                    ].map((opt) => (
                      <label
                        key={opt.val}
                        className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                          rfqForm.clientCategory === opt.val
                            ? "bg-emerald-50 border-emerald-600 font-semibold"
                            : "bg-slate-50/50 border-slate-200 hover:border-emerald-400"
                        }`}
                      >
                        <input
                          type="radio"
                          name="clientCategory"
                          value={opt.val}
                          checked={rfqForm.clientCategory === opt.val}
                          onChange={(e) => setRfqForm({ ...rfqForm, clientCategory: e.target.value })}
                          className="text-emerald-700 focus:ring-emerald-600"
                        />
                        <span className="text-xs sm:text-sm text-slate-800">{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                      <span>{t.label_phone}</span> <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="0812-xxxx-xxxx"
                      value={rfqForm.phone}
                      onChange={(e) => setRfqForm({ ...rfqForm, phone: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                      <span>{t.label_email}</span> <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="procurement@perusahaan.com"
                      value={rfqForm.email}
                      onChange={(e) => setRfqForm({ ...rfqForm, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                      <span>{t.label_location}</span> <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Kota / Kabupaten Tujuan"
                      value={rfqForm.location}
                      onChange={(e) => setRfqForm({ ...rfqForm, location: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                      <span>{t.label_volume}</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: 500 kg/minggu atau Rp 50 Jt/bln"
                      value={rfqForm.budget}
                      onChange={(e) => setRfqForm({ ...rfqForm, budget: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Detail Kebutuhan */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      <span>{t.label_details}</span> <span className="text-rose-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setRfqForm({ ...rfqForm, details: "" })}
                      className="text-xs text-slate-400 hover:text-rose-600 transition-colors"
                    >
                      {t.btn_clear}
                    </button>
                  </div>
                  <textarea
                    ref={detailsRef}
                    rows={4}
                    required
                    placeholder="Tuliskan rincian komoditas yang dibutuhkan (misal: Beras premium, ayam potong, sayuran segar, minyak goreng) serta frekuensi pengiriman..."
                    value={rfqForm.details}
                    onChange={(e) => setRfqForm({ ...rfqForm, details: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 outline-none transition-all"
                  ></textarea>
                </div>

                {/* Error Box */}
                {formError && (
                  <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
                    <AlertCircle size={16} className="shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    type="submit"
                    className="flex-1 flex justify-center items-center gap-2 bg-emerald-800 hover:bg-emerald-700 text-white font-bold py-3.5 px-6 rounded-xl shadow-md hover:shadow-lg transition-all text-sm"
                  >
                    <Send size={16} className="text-amber-400" />
                    <span>{t.btn_submit_rfq}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSendViaWhatsApp}
                    className="flex justify-center items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 px-5 rounded-xl shadow-md transition-all text-sm"
                    title="Kirim via WhatsApp langsung"
                  >
                    <MessageCircle size={18} />
                    <span>WhatsApp</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Right Column (5 cols): Contact & Operational Information */}
            <div className="lg:col-span-5 space-y-6">
              {/* Main Office & Distribution Card */}
              <div className="bg-[#0a192f] text-white rounded-3xl p-7 sm:p-8 shadow-xl">
                <h3 className="font-bold text-xl text-white mb-6 flex items-center gap-2.5">
                  <Building size={20} className="text-amber-400" />
                  <span>{t.contact_card_title}</span>
                </h3>

                <div className="space-y-6">
                  {/* Address */}
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                      <MapPin size={20} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        {t.contact_addr_label}
                      </h4>
                      <p className="text-sm text-slate-200 mt-1 leading-relaxed">
                        {contact.address}
                      </p>
                    </div>
                  </div>

                  {/* Operational Hours */}
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                      <Clock size={20} />
                    </div>
                    <div className="w-full">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                        {t.contact_hours_label}
                      </h4>
                      <ul className="space-y-1.5 text-sm text-slate-200">
                        <li className="flex justify-between border-b border-white/10 pb-1">
                          <span>{t.day_mon_fri}</span>
                          <span className="font-semibold text-white">08.00 – 17.00 WIB</span>
                        </li>
                        <li className="flex justify-between border-b border-white/10 pb-1">
                          <span>{t.day_sat}</span>
                          <span className="font-semibold text-white">08.00 – 14.00 WIB</span>
                        </li>
                        <li className="pt-1 text-xs text-amber-400 flex items-start gap-1.5">
                          <Check size={14} className="shrink-0 mt-0.5" />
                          <span>{t.day_sun}</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* Official Channels (Dinamis dari Database User) */}
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                      <Headset size={20} />
                    </div>
                    <div className="space-y-2.5 w-full">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        {t.contact_channel_label}
                      </h4>

                      {/* Dynamic Email */}
                      <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                        <div>
                          <p className="text-[11px] text-slate-400">Email Resmi & RFQ</p>
                          <a
                            href={`mailto:${contact.email}`}
                            className="text-sm font-semibold text-white hover:text-amber-300 transition-colors break-all"
                          >
                            {contact.email}
                          </a>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopy(contact.email, "Email")}
                          className="p-2 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                          title="Salin Email"
                        >
                          <Copy size={16} />
                        </button>
                      </div>

                      {/* Dynamic WhatsApp */}
                      <div className="p-3 rounded-xl bg-emerald-900/60 border border-emerald-600/40 flex items-center justify-between">
                        <div>
                          <p className="text-[11px] text-emerald-300">WhatsApp Bisnis (B2B)</p>
                          <a
                            href={`https://wa.me/${waNumber}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-bold text-white hover:text-amber-300 transition-colors flex items-center gap-1.5"
                          >
                            <span>{contact.phone}</span>
                            <ExternalLink size={13} className="text-emerald-400" />
                          </a>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleCopy(contact.phone, "Nomor WhatsApp")}
                            className="p-2 rounded-lg hover:bg-white/10 text-emerald-300 hover:text-white transition-colors"
                            title="Salin Nomor"
                          >
                            <Copy size={16} />
                          </button>
                          <a
                            href={`https://wa.me/${waNumber}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
                            title="Chat Langsung"
                          >
                            <MessageCircle size={16} />
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* B2B Assurance Note */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <Handshake size={22} />
                </div>
                <div>
                  <h4 className="font-bold text-[#0a192f] text-sm">{t.assurance_title}</h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{t.assurance_desc}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="bg-[#061020] text-slate-400 border-t border-white/10 pt-16 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-12 gap-10 pb-12 border-b border-white/10">
            <div className="md:col-span-5 space-y-4">
              <div className="flex items-center gap-3">
                <Logo size="md" light={true} />
              </div>
              <p className="text-sm text-slate-400 leading-relaxed max-w-sm">{t.footer_desc}</p>
              <div className="pt-2">
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Kontak Langsung:</p>
                <div className="flex flex-col gap-1 mt-1 text-xs text-slate-300">
                  <span>WhatsApp: {contact.phone}</span>
                  <span>Email: {contact.email}</span>
                </div>
              </div>
            </div>

            <div className="md:col-span-3 space-y-3">
              <h4 className="font-bold text-white text-sm uppercase tracking-wider">{t.footer_nav}</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#beranda" className="hover:text-white transition-colors">
                    {t.nav_home}
                  </a>
                </li>
                <li>
                  <a href="#tentang" className="hover:text-white transition-colors">
                    {t.nav_about}
                  </a>
                </li>
                <li>
                  <a href="#keunggulan" className="hover:text-white transition-colors">
                    {t.nav_advantages}
                  </a>
                </li>
                <li>
                  <a href="#komoditas" className="hover:text-white transition-colors">
                    {t.nav_catalog}
                  </a>
                </li>
                <li>
                  <a href="#alur" className="hover:text-white transition-colors">
                    {t.nav_workflow}
                  </a>
                </li>
                <li>
                  <Link to="/login" className="text-amber-400 hover:text-amber-300 transition-colors font-medium">
                    &rarr; Portal Login Sistem
                  </Link>
                </li>
              </ul>
            </div>

            <div className="md:col-span-4 space-y-3">
              <h4 className="font-bold text-white text-sm uppercase tracking-wider">{t.footer_services}</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#rfq" className="hover:text-white transition-colors">
                    {t.footer_s1}
                  </a>
                </li>
                <li>
                  <a href="#rfq" className="hover:text-white transition-colors">
                    {t.footer_s2}
                  </a>
                </li>
                <li>
                  <a href="#rfq" className="hover:text-white transition-colors">
                    {t.footer_s3}
                  </a>
                </li>
                <li>
                  <a href="#rfq" className="hover:text-white transition-colors">
                    {t.footer_s4}
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
            <p>
              &copy; {new Date().getFullYear()} Ikatandi Group. <span>{t.footer_rights}</span>
            </p>
            <div className="flex items-center gap-6">
              <a href={`mailto:${contact.email}`} className="hover:text-slate-300 transition-colors">
                {contact.email}
              </a>
              <span>Indonesia</span>
            </div>
          </div>
        </div>
      </footer>

      {/* ================= MODAL KONFIRMASI RFQ ================= */}
      {submittedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#061020]/80 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full p-7 sm:p-8 shadow-2xl border border-slate-200 transform transition-all animate-in fade-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="font-extrabold text-2xl text-[#0a192f] text-center">{t.modal_title}</h3>
            <p className="text-sm text-slate-600 text-center mt-2 leading-relaxed">{t.modal_desc}</p>

            <div className="my-6 bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2.5 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Nomor Referensi RFQ:</span>
                <span className="font-mono font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded text-xs">
                  {submittedModal.refId}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Perusahaan / Instansi:</span>
                <span className="font-semibold text-[#0a192f] text-right">{submittedModal.company}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">PIC Kontak:</span>
                <span className="font-semibold text-[#0a192f] text-right">{submittedModal.pic}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Estimasi Respon:</span>
                <span className="font-semibold text-amber-700">Maks. 1x24 Jam Kerja</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSubmittedModal(null)}
              className="w-full bg-[#0a192f] hover:bg-[#102a43] text-white font-bold py-3.5 rounded-xl transition-all text-sm"
            >
              {t.modal_close}
            </button>
          </div>
        </div>
      )}

      {/* ================= TOAST NOTIFICATION ================= */}
      {toastVisible && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 bg-[#0a192f] text-white text-xs sm:text-sm font-medium px-4 py-3 rounded-xl shadow-xl border border-white/10 animate-in slide-in-from-bottom-2 fade-in">
          <Check size={16} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
