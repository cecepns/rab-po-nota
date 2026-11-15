CREATE DATABASE IF NOT EXISTS rab_po_nota CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE rab_po_nota;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS suppliers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  nib VARCHAR(60) NULL,
  pic_name VARCHAR(120) NULL,
  phone VARCHAR(30) NULL,
  bank_name VARCHAR(60) NULL,
  bank_account_no VARCHAR(60) NULL,
  bank_account_name VARCHAR(120) NULL,
  address VARCHAR(255) NULL,
  notes TEXT NULL,
  logo VARCHAR(120) NULL,
  signature VARCHAR(120) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS customers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  phone VARCHAR(30) NULL,
  address VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS pos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  po_no VARCHAR(60) NOT NULL UNIQUE,
  date DATE NOT NULL,
  supplier_id INT NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'unpaid',
  payment_method VARCHAR(60) NULL DEFAULT 'Transfer Bank (VA)',
  notes TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
);
CREATE TABLE IF NOT EXISTS rab_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  date DATE NOT NULL,
  customer_id INT NOT NULL,
  supplier_id INT NOT NULL,
  item_name VARCHAR(150) NOT NULL,
  qty DECIMAL(12,2) NOT NULL,
  unit VARCHAR(30) NULL,
  price DECIMAL(14,2) NOT NULL,
  total DECIMAL(16,2) AS (qty * price) STORED,
  po_id INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_date (date), INDEX idx_supplier (supplier_id), INDEX idx_customer (customer_id),
  FOREIGN KEY (customer_id) REFERENCES customers(id),
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
  FOREIGN KEY (po_id) REFERENCES pos(id) ON DELETE SET NULL
);
CREATE TABLE IF NOT EXISTS notas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nota_no VARCHAR(60) NOT NULL UNIQUE,
  date DATE NOT NULL,
  supplier_id INT NOT NULL,
  customer_id INT NULL,
  po_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_po_id (po_id),
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
  FOREIGN KEY (po_id) REFERENCES pos(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS nota_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nota_id INT NOT NULL,
  item_name VARCHAR(150) NOT NULL,
  qty DECIMAL(12,2) NOT NULL,
  unit VARCHAR(30) NULL,
  price DECIMAL(14,2) NOT NULL,
  total DECIMAL(16,2) AS (qty * price) STORED,
  FOREIGN KEY (nota_id) REFERENCES notas(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS materials (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL UNIQUE,
  unit VARCHAR(30) NULL,
  price DECIMAL(14,2) NOT NULL DEFAULT 0,
  default_supplier_id INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (default_supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL
);

-- Sample data (user admin dibuat otomatis oleh server.js dari .env)
INSERT INTO suppliers (name,address,phone) VALUES
 ('TOKO FARSYHA KENCANA','Serang, Banten','0800000001'),
 ('TOKO RANGGA','Serang, Banten','0800000002'),
 ('TOKO GEMOY','Serang, Banten','0800000003');
INSERT INTO customers (name,phone,address) VALUES ('SPPG Contoh 1','0810000001','Serang'),('SPPG Contoh 2','0810000002','Cilegon');
INSERT INTO rab_items (date,customer_id,supplier_id,item_name,qty,unit,price) VALUES
 (CURDATE(),1,1,'Beras putih (premium)',150,'kg',15400),
 (CURDATE(),1,2,'Wortel',42,'kg',19000),
 (CURDATE(),2,3,'Minyak goreng sawit',50,'liter',23000);
INSERT IGNORE INTO materials (name, unit, price, default_supplier_id) VALUES
 ('Beras putih (premium)', 'kg', 15400, 1),
 ('Wortel', 'kg', 19000, 2),
 ('Minyak goreng sawit', 'liter', 23000, 3);
