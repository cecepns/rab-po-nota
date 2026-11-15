-- Migration: Tambah kolom stamp (stempel toko) pada tabel suppliers
-- Tanggal: 15 November 2026

ALTER TABLE suppliers ADD COLUMN stamp VARCHAR(120) NULL AFTER signature;
