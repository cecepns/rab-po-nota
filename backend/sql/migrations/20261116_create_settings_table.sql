-- Migration: Buat tabel settings untuk pengaturan kontak website & profil perusahaan
-- Tanggal: 16 November 2026

CREATE TABLE IF NOT EXISTS settings (
  `key` VARCHAR(50) PRIMARY KEY,
  `value` TEXT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO settings (`key`, `value`) VALUES
  ('phone', '082312693414'),
  ('email', 'mochamirudin17899@gmail.com'),
  ('company_name', 'Ikatandi Group'),
  ('address', 'Jl. Logistik Pangan No. 45, Kawasan Niaga Terpadu, Jakarta & Jaringan Cabang Regional, Indonesia')
ON DUPLICATE KEY UPDATE `key`=`key`;
