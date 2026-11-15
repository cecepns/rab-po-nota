-- Migration: Tambah kolom code & category pada tabel materials
ALTER TABLE materials ADD COLUMN IF NOT EXISTS code VARCHAR(30) NULL AFTER id;
ALTER TABLE materials ADD COLUMN IF NOT EXISTS category VARCHAR(100) NULL AFTER name;
