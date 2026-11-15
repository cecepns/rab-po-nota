-- ==============================================================================
-- Migration: Tambah Kolom PO (status, payment_method, notes)
--            & Kolom NOTAS (customer_id & perbaikan multi-nota per PO)
-- Tanggal: 15 November 2026
-- Database: rab_po_nota
-- ==============================================================================

USE rab_po_nota;

-- ------------------------------------------------------------------------------
-- 1. TABEL POS: Tambahkan kolom status, payment_method, dan notes
-- ------------------------------------------------------------------------------
ALTER TABLE pos 
  ADD COLUMN status VARCHAR(30) NOT NULL DEFAULT 'unpaid' AFTER supplier_id,
  ADD COLUMN payment_method VARCHAR(60) NULL DEFAULT 'Transfer Bank (VA)' AFTER status,
  ADD COLUMN notes TEXT NULL AFTER payment_method;

-- ------------------------------------------------------------------------------
-- 2. TABEL NOTAS: Tambahkan kolom customer_id
-- ------------------------------------------------------------------------------
ALTER TABLE notas 
  ADD COLUMN customer_id INT NULL AFTER supplier_id;

-- Tambah foreign key untuk customer_id ke tabel customers (opsional)
ALTER TABLE notas 
  ADD CONSTRAINT fk_notas_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL;

-- ------------------------------------------------------------------------------
-- 3. TABEL NOTAS: Hapus UNIQUE constraint pada po_id
--    (Agar 1 PO yang memiliki beberapa pelanggan bisa dibuatkan nota terpisah per pelanggan)
-- ------------------------------------------------------------------------------
-- Langkah A: Tambah indeks biasa (non-unique) pada po_id terlebih dahulu
-- agar Foreign Key yang sudah ada tidak error (Error 1553).
ALTER TABLE notas ADD INDEX idx_notas_po_id (po_id);

-- Langkah B: Hapus indeks UNIQUE po_id (nama default indeks uniknya adalah 'po_id')
ALTER TABLE notas DROP INDEX po_id;
