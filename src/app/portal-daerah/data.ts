export type IconKey =
  | "Users2"
  | "Heart"
  | "BookOpen"
  | "Leaf"
  | "Users"
  | "Fish"
  | "Wrench"
  | "Camera"
  | "TrendingUp"
  | "Wifi";

export interface Dataset {
  id: number;
  judul: string;
  dinas: string;
  bidang: string;
  topik: string;
  tahunMulai: number;
  tahunAkhir: number;
  diperbarui: string;
  tanggalUpdate: string;
  dilihat: number;
  deskripsi: string;
  icon: IconKey;
  iconBg: string;
  iconColor: string;
  columns: string[];
  rows: Record<string, string | number>[];
}

export const DINAS_LIST = [
  "Dinas Kependudukan dan Pencatatan Sipil",
  "Dinas Kesehatan",
  "Dinas Pendidikan dan Kebudayaan",
  "Dinas Pertanian dan Ketahanan Pangan",
  "Dinas Sosial",
  "Dinas Kelautan dan Perikanan",
  "Dinas Pekerjaan Umum dan Penataan Ruang",
  "Dinas Pariwisata dan Ekonomi Kreatif",
  "Badan Perencanaan Pembangunan Daerah (BAPPEDA)",
  "Dinas Komunikasi dan Informatika",
];

export const TOPIK_LIST = [
  "Kependudukan",
  "Kesehatan",
  "Pendidikan",
  "Pertanian",
  "Sosial",
  "Perikanan",
  "Infrastruktur",
  "Pariwisata",
  "Keuangan",
  "Komunikasi",
];

export const DATASETS: Dataset[] = [
  {
    id: 1,
    judul: "Jumlah Penduduk per Kecamatan di Kabupaten Toli-Toli Tahun 2025",
    dinas: "Dinas Kependudukan dan Pencatatan Sipil",
    bidang: "Bidang Pemanfaatan Data dan Inovasi",
    topik: "Kependudukan",
    tahunMulai: 2025,
    tahunAkhir: 2025,
    diperbarui: "2 minggu yang lalu",
    tanggalUpdate: "22 Juli 2025",
    dilihat: 312,
    deskripsi:
      "Dataset ini berisi informasi tentang jumlah penduduk yang terdaftar per kecamatan di Kabupaten Toli-Toli pada tahun 2025, dirinci berdasarkan jenis kelamin.",
    icon: "Users2",
    iconBg: "#DBEAFE",
    iconColor: "#1D6FCA",
    columns: ["Kecamatan", "Laki-Laki", "Perempuan", "Total"],
    rows: [
      { Kecamatan: "Baolan", "Laki-Laki": 28456, Perempuan: 27893, Total: 56349 },
      { Kecamatan: "Galang", "Laki-Laki": 7234, Perempuan: 7012, Total: 14246 },
      { Kecamatan: "Dondo", "Laki-Laki": 6123, Perempuan: 5987, Total: 12110 },
      { Kecamatan: "Dampal Selatan", "Laki-Laki": 5420, Perempuan: 5231, Total: 10651 },
      { Kecamatan: "Tolitoli Utara", "Laki-Laki": 5231, Perempuan: 5089, Total: 10320 },
      { Kecamatan: "Dampal Utara", "Laki-Laki": 4823, Perempuan: 4695, Total: 9518 },
      { Kecamatan: "Lampasio", "Laki-Laki": 4567, Perempuan: 4423, Total: 8990 },
      { Kecamatan: "Basidondo", "Laki-Laki": 3876, Perempuan: 3742, Total: 7618 },
      { Kecamatan: "Ogodeide", "Laki-Laki": 3421, Perempuan: 3312, Total: 6733 },
      { Kecamatan: "Tinabogan", "Laki-Laki": 2943, Perempuan: 2867, Total: 5810 },
    ],
  },
  {
    id: 2,
    judul: "Fasilitas Kesehatan per Kecamatan di Kabupaten Toli-Toli Tahun 2025",
    dinas: "Dinas Kesehatan",
    bidang: "Bidang Pelayanan Kesehatan",
    topik: "Kesehatan",
    tahunMulai: 2025,
    tahunAkhir: 2025,
    diperbarui: "1 bulan yang lalu",
    tanggalUpdate: "5 Juli 2025",
    dilihat: 287,
    deskripsi:
      "Dataset ini berisi data jumlah fasilitas kesehatan meliputi Puskesmas, Puskesmas Pembantu (Pustu), dan Posyandu per kecamatan di Kabupaten Toli-Toli tahun 2025.",
    icon: "Heart",
    iconBg: "#FEE2E2",
    iconColor: "#DC2626",
    columns: ["Kecamatan", "Puskesmas", "Pustu", "Posyandu", "Dokter", "Perawat"],
    rows: [
      { Kecamatan: "Baolan", Puskesmas: 3, Pustu: 8, Posyandu: 42, Dokter: 18, Perawat: 56 },
      { Kecamatan: "Galang", Puskesmas: 1, Pustu: 5, Posyandu: 18, Dokter: 4, Perawat: 14 },
      { Kecamatan: "Dondo", Puskesmas: 1, Pustu: 4, Posyandu: 22, Dokter: 3, Perawat: 11 },
      { Kecamatan: "Dampal Selatan", Puskesmas: 1, Pustu: 3, Posyandu: 16, Dokter: 2, Perawat: 9 },
      { Kecamatan: "Tolitoli Utara", Puskesmas: 1, Pustu: 4, Posyandu: 19, Dokter: 3, Perawat: 10 },
      { Kecamatan: "Dampal Utara", Puskesmas: 1, Pustu: 3, Posyandu: 14, Dokter: 2, Perawat: 8 },
      { Kecamatan: "Lampasio", Puskesmas: 1, Pustu: 3, Posyandu: 13, Dokter: 2, Perawat: 7 },
      { Kecamatan: "Basidondo", Puskesmas: 1, Pustu: 2, Posyandu: 11, Dokter: 2, Perawat: 6 },
      { Kecamatan: "Ogodeide", Puskesmas: 1, Pustu: 2, Posyandu: 10, Dokter: 1, Perawat: 5 },
      { Kecamatan: "Tinabogan", Puskesmas: 1, Pustu: 2, Posyandu: 9, Dokter: 1, Perawat: 5 },
    ],
  },
  {
    id: 3,
    judul: "Data Sekolah dan Murid per Kecamatan di Kabupaten Toli-Toli Tahun 2025",
    dinas: "Dinas Pendidikan dan Kebudayaan",
    bidang: "Bidang Pembinaan Pendidikan Dasar",
    topik: "Pendidikan",
    tahunMulai: 2025,
    tahunAkhir: 2025,
    diperbarui: "3 minggu yang lalu",
    tanggalUpdate: "15 Juli 2025",
    dilihat: 198,
    deskripsi:
      "Dataset ini berisi informasi jumlah sekolah (SD dan SMP), guru, dan murid per kecamatan di Kabupaten Toli-Toli tahun 2025.",
    icon: "BookOpen",
    iconBg: "#FEF3C7",
    iconColor: "#D97706",
    columns: ["Kecamatan", "SD", "SMP", "Guru SD", "Guru SMP", "Murid SD", "Murid SMP"],
    rows: [
      { Kecamatan: "Baolan", SD: 34, SMP: 12, "Guru SD": 312, "Guru SMP": 187, "Murid SD": 7823, "Murid SMP": 4231 },
      { Kecamatan: "Galang", SD: 12, SMP: 4, "Guru SD": 98, "Guru SMP": 54, "Murid SD": 2341, "Murid SMP": 1123 },
      { Kecamatan: "Dondo", SD: 14, SMP: 4, "Guru SD": 112, "Guru SMP": 61, "Murid SD": 2567, "Murid SMP": 1298 },
      { Kecamatan: "Dampal Selatan", SD: 11, SMP: 3, "Guru SD": 87, "Guru SMP": 45, "Murid SD": 1987, "Murid SMP": 934 },
      { Kecamatan: "Tolitoli Utara", SD: 12, SMP: 3, "Guru SD": 91, "Guru SMP": 49, "Murid SD": 2102, "Murid SMP": 978 },
      { Kecamatan: "Dampal Utara", SD: 9, SMP: 3, "Guru SD": 74, "Guru SMP": 41, "Murid SD": 1654, "Murid SMP": 823 },
      { Kecamatan: "Lampasio", SD: 8, SMP: 2, "Guru SD": 65, "Guru SMP": 34, "Murid SD": 1456, "Murid SMP": 712 },
      { Kecamatan: "Basidondo", SD: 7, SMP: 2, "Guru SD": 58, "Guru SMP": 30, "Murid SD": 1234, "Murid SMP": 598 },
      { Kecamatan: "Ogodeide", SD: 6, SMP: 2, "Guru SD": 51, "Guru SMP": 27, "Murid SD": 1089, "Murid SMP": 521 },
      { Kecamatan: "Tinabogan", SD: 5, SMP: 2, "Guru SD": 43, "Guru SMP": 23, "Murid SD": 876, "Murid SMP": 432 },
    ],
  },
  {
    id: 4,
    judul: "Luas Panen dan Produksi Tanaman Pangan di Kabupaten Toli-Toli Tahun 2025",
    dinas: "Dinas Pertanian dan Ketahanan Pangan",
    bidang: "Bidang Tanaman Pangan",
    topik: "Pertanian",
    tahunMulai: 2025,
    tahunAkhir: 2025,
    diperbarui: "1 bulan yang lalu",
    tanggalUpdate: "10 Juli 2025",
    dilihat: 143,
    deskripsi:
      "Dataset ini berisi informasi luas panen (hektar) dan produksi (ton) komoditas tanaman pangan di Kabupaten Toli-Toli pada tahun 2025.",
    icon: "Leaf",
    iconBg: "#DCFCE7",
    iconColor: "#16A34A",
    columns: ["Komoditas", "Luas Panen (Ha)", "Produksi (Ton)", "Produktivitas (Ton/Ha)"],
    rows: [
      { Komoditas: "Padi Sawah", "Luas Panen (Ha)": 12456, "Produksi (Ton)": 56123, "Produktivitas (Ton/Ha)": 4.51 },
      { Komoditas: "Padi Ladang", "Luas Panen (Ha)": 3421, "Produksi (Ton)": 8934, "Produktivitas (Ton/Ha)": 2.61 },
      { Komoditas: "Jagung", "Luas Panen (Ha)": 5678, "Produksi (Ton)": 18234, "Produktivitas (Ton/Ha)": 3.21 },
      { Komoditas: "Ubi Kayu", "Luas Panen (Ha)": 1234, "Produksi (Ton)": 17123, "Produktivitas (Ton/Ha)": 13.87 },
      { Komoditas: "Ubi Jalar", "Luas Panen (Ha)": 567, "Produksi (Ton)": 5234, "Produktivitas (Ton/Ha)": 9.23 },
      { Komoditas: "Kacang Tanah", "Luas Panen (Ha)": 312, "Produksi (Ton)": 398, "Produktivitas (Ton/Ha)": 1.28 },
      { Komoditas: "Kedelai", "Luas Panen (Ha)": 234, "Produksi (Ton)": 287, "Produktivitas (Ton/Ha)": 1.23 },
    ],
  },
  {
    id: 5,
    judul: "Data Penerima Bantuan Sosial di Kabupaten Toli-Toli Tahun 2025",
    dinas: "Dinas Sosial",
    bidang: "Bidang Perlindungan dan Jaminan Sosial",
    topik: "Sosial",
    tahunMulai: 2025,
    tahunAkhir: 2025,
    diperbarui: "Beberapa minggu yang lalu",
    tanggalUpdate: "18 Juli 2025",
    dilihat: 256,
    deskripsi:
      "Dataset ini berisi data penerima program bantuan sosial pemerintah per kecamatan di Kabupaten Toli-Toli tahun 2025, meliputi PKH, BPNT, dan BST.",
    icon: "Users",
    iconBg: "#EDE9FE",
    iconColor: "#7C3AED",
    columns: ["Kecamatan", "PKH (KK)", "BPNT (KK)", "BST (KK)", "Total Penerima (KK)"],
    rows: [
      { Kecamatan: "Baolan", "PKH (KK)": 2341, "BPNT (KK)": 3456, "BST (KK)": 1234, "Total Penerima (KK)": 5987 },
      { Kecamatan: "Galang", "PKH (KK)": 678, "BPNT (KK)": 923, "BST (KK)": 356, "Total Penerima (KK)": 1678 },
      { Kecamatan: "Dondo", "PKH (KK)": 745, "BPNT (KK)": 1023, "BST (KK)": 389, "Total Penerima (KK)": 1823 },
      { Kecamatan: "Dampal Selatan", "PKH (KK)": 567, "BPNT (KK)": 789, "BST (KK)": 312, "Total Penerima (KK)": 1401 },
      { Kecamatan: "Tolitoli Utara", "PKH (KK)": 612, "BPNT (KK)": 834, "BST (KK)": 323, "Total Penerima (KK)": 1478 },
      { Kecamatan: "Dampal Utara", "PKH (KK)": 489, "BPNT (KK)": 667, "BST (KK)": 278, "Total Penerima (KK)": 1201 },
      { Kecamatan: "Lampasio", "PKH (KK)": 423, "BPNT (KK)": 578, "BST (KK)": 241, "Total Penerima (KK)": 1034 },
      { Kecamatan: "Basidondo", "PKH (KK)": 378, "BPNT (KK)": 512, "BST (KK)": 213, "Total Penerima (KK)": 912 },
      { Kecamatan: "Ogodeide", "PKH (KK)": 334, "BPNT (KK)": 456, "BST (KK)": 189, "Total Penerima (KK)": 812 },
      { Kecamatan: "Tinabogan", "PKH (KK)": 289, "BPNT (KK)": 398, "BST (KK)": 167, "Total Penerima (KK)": 712 },
    ],
  },
  {
    id: 6,
    judul: "Produksi Perikanan Tangkap per Kecamatan di Kabupaten Toli-Toli Tahun 2025",
    dinas: "Dinas Kelautan dan Perikanan",
    bidang: "Bidang Perikanan Tangkap",
    topik: "Perikanan",
    tahunMulai: 2025,
    tahunAkhir: 2025,
    diperbarui: "Beberapa bulan yang lalu",
    tanggalUpdate: "15 Juni 2025",
    dilihat: 178,
    deskripsi:
      "Dataset ini berisi data volume produksi dan nilai produksi perikanan tangkap per kecamatan pesisir di Kabupaten Toli-Toli tahun 2025.",
    icon: "Fish",
    iconBg: "#CCFBF1",
    iconColor: "#0D9488",
    columns: ["Kecamatan", "Volume (Ton)", "Nilai Produksi (Rp Juta)", "Nelayan (Orang)", "Armada (Unit)"],
    rows: [
      { Kecamatan: "Baolan", "Volume (Ton)": 4523, "Nilai Produksi (Rp Juta)": 54276, "Nelayan (Orang)": 2341, "Armada (Unit)": 678 },
      { Kecamatan: "Galang", "Volume (Ton)": 2134, "Nilai Produksi (Rp Juta)": 25608, "Nelayan (Orang)": 1123, "Armada (Unit)": 312 },
      { Kecamatan: "Dondo", "Volume (Ton)": 1876, "Nilai Produksi (Rp Juta)": 22512, "Nelayan (Orang)": 987, "Armada (Unit)": 278 },
      { Kecamatan: "Dampal Selatan", "Volume (Ton)": 1654, "Nilai Produksi (Rp Juta)": 19848, "Nelayan (Orang)": 867, "Armada (Unit)": 243 },
      { Kecamatan: "Tolitoli Utara", "Volume (Ton)": 1423, "Nilai Produksi (Rp Juta)": 17076, "Nelayan (Orang)": 756, "Armada (Unit)": 212 },
      { Kecamatan: "Dampal Utara", "Volume (Ton)": 1234, "Nilai Produksi (Rp Juta)": 14808, "Nelayan (Orang)": 645, "Armada (Unit)": 187 },
    ],
  },
  {
    id: 7,
    judul: "Data Kondisi Jalan per Ruas di Kabupaten Toli-Toli Tahun 2025",
    dinas: "Dinas Pekerjaan Umum dan Penataan Ruang",
    bidang: "Bidang Bina Marga",
    topik: "Infrastruktur",
    tahunMulai: 2025,
    tahunAkhir: 2025,
    diperbarui: "2 bulan yang lalu",
    tanggalUpdate: "5 Juni 2025",
    dilihat: 134,
    deskripsi:
      "Dataset ini berisi data panjang ruas jalan kabupaten beserta kondisinya (baik, sedang, rusak ringan, rusak berat) per kecamatan di Kabupaten Toli-Toli tahun 2025.",
    icon: "Wrench",
    iconBg: "#FFEDD5",
    iconColor: "#EA580C",
    columns: ["Kecamatan", "Panjang Total (Km)", "Kondisi Baik (Km)", "Kondisi Sedang (Km)", "Rusak Ringan (Km)", "Rusak Berat (Km)"],
    rows: [
      { Kecamatan: "Baolan", "Panjang Total (Km)": 145.6, "Kondisi Baik (Km)": 89.3, "Kondisi Sedang (Km)": 32.1, "Rusak Ringan (Km)": 15.4, "Rusak Berat (Km)": 8.8 },
      { Kecamatan: "Galang", "Panjang Total (Km)": 87.3, "Kondisi Baik (Km)": 45.6, "Kondisi Sedang (Km)": 21.3, "Rusak Ringan (Km)": 12.4, "Rusak Berat (Km)": 8.0 },
      { Kecamatan: "Dondo", "Panjang Total (Km)": 92.1, "Kondisi Baik (Km)": 43.2, "Kondisi Sedang (Km)": 23.4, "Rusak Ringan (Km)": 15.3, "Rusak Berat (Km)": 10.2 },
      { Kecamatan: "Dampal Selatan", "Panjang Total (Km)": 76.4, "Kondisi Baik (Km)": 31.2, "Kondisi Sedang (Km)": 18.9, "Rusak Ringan (Km)": 16.1, "Rusak Berat (Km)": 10.2 },
      { Kecamatan: "Tolitoli Utara", "Panjang Total (Km)": 68.9, "Kondisi Baik (Km)": 28.7, "Kondisi Sedang (Km)": 17.3, "Rusak Ringan (Km)": 13.4, "Rusak Berat (Km)": 9.5 },
      { Kecamatan: "Dampal Utara", "Panjang Total (Km)": 65.2, "Kondisi Baik (Km)": 24.3, "Kondisi Sedang (Km)": 15.6, "Rusak Ringan (Km)": 14.2, "Rusak Berat (Km)": 11.1 },
      { Kecamatan: "Lampasio", "Panjang Total (Km)": 58.7, "Kondisi Baik (Km)": 19.4, "Kondisi Sedang (Km)": 13.2, "Rusak Ringan (Km)": 14.5, "Rusak Berat (Km)": 11.6 },
      { Kecamatan: "Basidondo", "Panjang Total (Km)": 54.3, "Kondisi Baik (Km)": 15.6, "Kondisi Sedang (Km)": 12.1, "Rusak Ringan (Km)": 14.3, "Rusak Berat (Km)": 12.3 },
      { Kecamatan: "Ogodeide", "Panjang Total (Km)": 47.8, "Kondisi Baik (Km)": 12.3, "Kondisi Sedang (Km)": 10.4, "Rusak Ringan (Km)": 13.2, "Rusak Berat (Km)": 11.9 },
      { Kecamatan: "Tinabogan", "Panjang Total (Km)": 43.1, "Kondisi Baik (Km)": 10.1, "Kondisi Sedang (Km)": 8.9, "Rusak Ringan (Km)": 12.4, "Rusak Berat (Km)": 11.7 },
    ],
  },
  {
    id: 8,
    judul: "Kunjungan Wisatawan ke Destinasi Wisata di Kabupaten Toli-Toli Tahun 2025",
    dinas: "Dinas Pariwisata dan Ekonomi Kreatif",
    bidang: "Bidang Destinasi Pariwisata",
    topik: "Pariwisata",
    tahunMulai: 2025,
    tahunAkhir: 2025,
    diperbarui: "1 bulan yang lalu",
    tanggalUpdate: "8 Juli 2025",
    dilihat: 89,
    deskripsi:
      "Dataset ini berisi data jumlah kunjungan wisatawan nusantara dan mancanegara ke destinasi wisata di Kabupaten Toli-Toli tahun 2025.",
    icon: "Camera",
    iconBg: "#E0F2FE",
    iconColor: "#0284C7",
    columns: ["Destinasi Wisata", "Jenis", "Wisnus (Orang)", "Wisman (Orang)", "Total (Orang)"],
    rows: [
      { "Destinasi Wisata": "Pantai Lalos", Jenis: "Wisata Bahari", "Wisnus (Orang)": 12456, "Wisman (Orang)": 234, "Total (Orang)": 12690 },
      { "Destinasi Wisata": "Pantai Tambun", Jenis: "Wisata Bahari", "Wisnus (Orang)": 8934, "Wisman (Orang)": 123, "Total (Orang)": 9057 },
      { "Destinasi Wisata": "Air Terjun Solonsa", Jenis: "Wisata Alam", "Wisnus (Orang)": 6723, "Wisman (Orang)": 67, "Total (Orang)": 6790 },
      { "Destinasi Wisata": "Pantai Kabonga", Jenis: "Wisata Bahari", "Wisnus (Orang)": 5431, "Wisman (Orang)": 89, "Total (Orang)": 5520 },
      { "Destinasi Wisata": "Danau Towuti Tolitoli", Jenis: "Wisata Alam", "Wisnus (Orang)": 4123, "Wisman (Orang)": 45, "Total (Orang)": 4168 },
      { "Destinasi Wisata": "Museum Daerah Toli-Toli", Jenis: "Wisata Budaya", "Wisnus (Orang)": 3456, "Wisman (Orang)": 56, "Total (Orang)": 3512 },
    ],
  },
  {
    id: 9,
    judul: "Realisasi APBD Kabupaten Toli-Toli Tahun Anggaran 2025",
    dinas: "Badan Perencanaan Pembangunan Daerah (BAPPEDA)",
    bidang: "Bidang Pendanaan Pembangunan",
    topik: "Keuangan",
    tahunMulai: 2025,
    tahunAkhir: 2025,
    diperbarui: "3 minggu yang lalu",
    tanggalUpdate: "14 Juli 2025",
    dilihat: 421,
    deskripsi:
      "Dataset ini berisi informasi realisasi Anggaran Pendapatan dan Belanja Daerah (APBD) Kabupaten Toli-Toli tahun anggaran 2025.",
    icon: "TrendingUp",
    iconBg: "#D1FAE5",
    iconColor: "#059669",
    columns: ["Uraian", "Anggaran (Rp)", "Realisasi (Rp)", "Persentase (%)"],
    rows: [
      { Uraian: "Pendapatan Daerah", "Anggaran (Rp)": 1234567890000, "Realisasi (Rp)": 1012345678000, "Persentase (%)": 82.0 },
      { Uraian: "  PAD", "Anggaran (Rp)": 89012345000, "Realisasi (Rp)": 67890123000, "Persentase (%)": 76.3 },
      { Uraian: "  Pendapatan Transfer", "Anggaran (Rp)": 1098234567000, "Realisasi (Rp)": 912345678000, "Persentase (%)": 83.1 },
      { Uraian: "  Lain-lain Pendapatan Sah", "Anggaran (Rp)": 47320978000, "Realisasi (Rp)": 32109877000, "Persentase (%)": 67.8 },
      { Uraian: "Belanja Daerah", "Anggaran (Rp)": 1356789012000, "Realisasi (Rp)": 987654321000, "Persentase (%)": 72.8 },
      { Uraian: "  Belanja Operasi", "Anggaran (Rp)": 876543210000, "Realisasi (Rp)": 654321098000, "Persentase (%)": 74.6 },
      { Uraian: "  Belanja Modal", "Anggaran (Rp)": 356789012000, "Realisasi (Rp)": 234567890000, "Persentase (%)": 65.7 },
      { Uraian: "  Belanja Tak Terduga", "Anggaran (Rp)": 23456790000, "Realisasi (Rp)": 9876543000, "Persentase (%)": 42.1 },
      { Uraian: "Pembiayaan", "Anggaran (Rp)": 122221122000, "Realisasi (Rp)": 98765432000, "Persentase (%)": 80.8 },
    ],
  },
  {
    id: 10,
    judul: "Data Infrastruktur Telekomunikasi per Kecamatan di Kabupaten Toli-Toli Tahun 2025",
    dinas: "Dinas Komunikasi dan Informatika",
    bidang: "Bidang Teknologi Informasi dan Komunikasi",
    topik: "Komunikasi",
    tahunMulai: 2025,
    tahunAkhir: 2025,
    diperbarui: "Beberapa minggu yang lalu",
    tanggalUpdate: "20 Juli 2025",
    dilihat: 167,
    deskripsi:
      "Dataset ini berisi data infrastruktur telekomunikasi meliputi jumlah menara BTS, titik wifi publik, dan cakupan jaringan internet per kecamatan di Kabupaten Toli-Toli tahun 2025.",
    icon: "Wifi",
    iconBg: "#EEF2FF",
    iconColor: "#4F46E5",
    columns: ["Kecamatan", "Menara BTS", "Wifi Publik", "Desa Terjangkau 4G", "Desa Terjangkau 3G", "Desa Blankspot"],
    rows: [
      { Kecamatan: "Baolan", "Menara BTS": 34, "Wifi Publik": 18, "Desa Terjangkau 4G": 12, "Desa Terjangkau 3G": 5, "Desa Blankspot": 1 },
      { Kecamatan: "Galang", "Menara BTS": 12, "Wifi Publik": 4, "Desa Terjangkau 4G": 6, "Desa Terjangkau 3G": 8, "Desa Blankspot": 3 },
      { Kecamatan: "Dondo", "Menara BTS": 14, "Wifi Publik": 5, "Desa Terjangkau 4G": 7, "Desa Terjangkau 3G": 9, "Desa Blankspot": 4 },
      { Kecamatan: "Dampal Selatan", "Menara BTS": 8, "Wifi Publik": 2, "Desa Terjangkau 4G": 3, "Desa Terjangkau 3G": 7, "Desa Blankspot": 5 },
      { Kecamatan: "Tolitoli Utara", "Menara BTS": 9, "Wifi Publik": 3, "Desa Terjangkau 4G": 4, "Desa Terjangkau 3G": 8, "Desa Blankspot": 4 },
      { Kecamatan: "Dampal Utara", "Menara BTS": 7, "Wifi Publik": 2, "Desa Terjangkau 4G": 2, "Desa Terjangkau 3G": 6, "Desa Blankspot": 6 },
      { Kecamatan: "Lampasio", "Menara BTS": 6, "Wifi Publik": 1, "Desa Terjangkau 4G": 1, "Desa Terjangkau 3G": 5, "Desa Blankspot": 7 },
      { Kecamatan: "Basidondo", "Menara BTS": 5, "Wifi Publik": 1, "Desa Terjangkau 4G": 1, "Desa Terjangkau 3G": 4, "Desa Blankspot": 8 },
      { Kecamatan: "Ogodeide", "Menara BTS": 4, "Wifi Publik": 1, "Desa Terjangkau 4G": 0, "Desa Terjangkau 3G": 4, "Desa Blankspot": 9 },
      { Kecamatan: "Tinabogan", "Menara BTS": 3, "Wifi Publik": 0, "Desa Terjangkau 4G": 0, "Desa Terjangkau 3G": 3, "Desa Blankspot": 10 },
    ],
  },
];
