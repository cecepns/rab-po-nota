-- ==============================================================================
-- Migration: Tambah Kolom PIC, NIB, Rekening Bank, dan Catatan pada Tabel Suppliers
-- Tanggal: 14 November 2026
-- Database: rab_po_nota
-- ==============================================================================

USE rab_po_nota;

-- 1. Tambah kolom NIB (Nomor Induk Berusaha)
ALTER TABLE suppliers ADD COLUMN nib VARCHAR(60) NULL AFTER name;

-- 2. Tambah kolom Nama PIC (Person in Charge)
ALTER TABLE suppliers ADD COLUMN pic_name VARCHAR(120) NULL AFTER nib;

-- 3. Tambah kolom Nama Bank
ALTER TABLE suppliers ADD COLUMN bank_name VARCHAR(60) NULL AFTER phone;

-- 4. Tambah kolom Nomor Rekening
ALTER TABLE suppliers ADD COLUMN bank_account_no VARCHAR(60) NULL AFTER bank_name;

-- 5. Tambah kolom Nama Pemilik Rekening
ALTER TABLE suppliers ADD COLUMN bank_account_name VARCHAR(120) NULL AFTER bank_account_no;

-- 6. Tambah kolom Catatan
ALTER TABLE suppliers ADD COLUMN notes TEXT NULL AFTER address;
