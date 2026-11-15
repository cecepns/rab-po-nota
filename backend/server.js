require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const {
  PORT = 5000,
  DB_HOST = 'localhost',
  DB_USER = 'root',
  DB_PASS = '',
  DB_NAME = 'rab_po_nota',
  JWT_SECRET,
  ADMIN_USER = 'admin',
  ADMIN_PASS = 'admin123',
} = process.env;

if (!JWT_SECRET) {
  console.error('JWT_SECRET wajib diisi di .env');
  process.exit(1);
}

const UPLOAD_DIR = path.join(__dirname, 'uploads-rab-po-nota');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const db = mysql.createPool({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASS,
  database: DB_NAME,
  connectionLimit: 10,
  dateStrings: true,
});

const upload = multer({
  storage: multer.diskStorage({
    destination: UPLOAD_DIR,
    filename: (_, f, cb) =>
      cb(
        null,
        crypto.randomUUID() + path.extname(f.originalname).toLowerCase(),
      ),
  }),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_, f, cb) => {
    const ok = /^image\/(png|jpe?g|webp)$/.test(f.mimetype);
    cb(
      ok
        ? null
        : Object.assign(new Error('Hanya gambar png/jpg/webp (maks 2MB)'), {
          status: 400,
        }),
      ok,
    );
  },
});

const app = express();
app.use(cors(), express.json(), express.urlencoded({ extended: true }));
app.use(
  '/uploads',
  cors(),
  express.static(UPLOAD_DIR, {
    setHeaders: (res) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    },
  })
);

// ---------- helpers ----------
const wrap = (fn) => (req, res, next) => fn(req, res, next).catch(next);
const fail = (status, message) =>
  Object.assign(new Error(message), { status });
const clean = (v) => (typeof v === 'string' ? v.trim().replace(/[<>]/g, '') : v);

const auth = (req, res, next) => {
  try {
    req.user = jwt.verify(
      (req.headers.authorization || '').replace('Bearer ', ''),
      JWT_SECRET,
    );
    next();
  } catch {
    next(fail(401, 'Sesi berakhir, silakan login ulang'));
  }
};

const ok = (res, data, pagination) =>
  res.json({ success: true, data, ...(pagination && { pagination }) });

const fileFields = (req, res, next) => {
  upload.any()(req, res, (err) => {
    if (err) return next(err);
    if (Array.isArray(req.files)) {
      const filesObj = {};
      for (const file of req.files) {
        if (!filesObj[file.fieldname]) filesObj[file.fieldname] = [];
        filesObj[file.fieldname].push(file);
      }
      req.files = filesObj;
    }
    next();
  });
};

// ---------- resource config (generic CRUD + pagination/search/sort/filter) ----------
const R = {
  suppliers: {
    table: 'suppliers',
    from: 'suppliers t',
    select: 't.*',
    cols: [
      'name',
      'nib',
      'pic_name',
      'phone',
      'bank_name',
      'bank_account_no',
      'bank_account_name',
      'address',
      'notes',
    ],
    files: ['logo', 'signature', 'stamp'],
    req: ['name'],
    search: [
      't.name',
      't.phone',
      't.pic_name',
      't.bank_account_no',
      't.bank_name',
      't.bank_account_name',
    ],
    sort: ['id', 'name'],
  },
  customers: {
    table: 'customers',
    from: 'customers t',
    select: 't.*',
    cols: ['name', 'phone', 'address'],
    req: ['name'],
    search: ['t.name', 't.phone'],
    sort: ['id', 'name'],
  },
  materials: {
    table: 'materials',
    from: 'materials t LEFT JOIN suppliers s ON s.id=t.default_supplier_id',
    select: 't.*, s.name default_supplier_name',
    cols: ['code', 'name', 'category', 'unit', 'price', 'default_supplier_id'],
    req: ['name'],
    num: ['price'],
    search: ['t.code', 't.name', 't.category', 't.unit'],
    sort: ['id', 'code', 'name', 'price'],
  },
  rab: {
    table: 'rab_items',
    cols: [
      'date',
      'customer_id',
      'supplier_id',
      'item_name',
      'qty',
      'unit',
      'price',
    ],
    req: ['date', 'customer_id', 'supplier_id', 'item_name', 'qty', 'price'],
    num: ['qty', 'price'],
    from: 'rab_items t LEFT JOIN customers c ON c.id=t.customer_id LEFT JOIN suppliers s ON s.id=t.supplier_id LEFT JOIN pos p ON p.id=t.po_id',
    select: 't.*, c.name customer_name, s.name supplier_name, p.po_no',
    search: ['t.item_name', 'c.name', 's.name'],
    filters: ['date', 'customer_id', 'supplier_id', 'po_id'],
    sort: ['id', 'date', 'item_name', 'total'],
  },
  pos: {
    table: 'pos',
    from: 'pos t LEFT JOIN suppliers s ON s.id=t.supplier_id',
    select:
      't.*, s.name supplier_name, (SELECT COALESCE(SUM(total),0) FROM rab_items WHERE po_id=t.id) total, (SELECT id FROM notas WHERE po_id=t.id LIMIT 1) nota_id, (SELECT COUNT(*) FROM rab_items WHERE po_id=t.id) item_count',
    search: ['t.po_no', 's.name', 't.payment_method', 't.notes', 't.status'],
    filters: ['date', 'supplier_id', 'status'],
    sort: ['id', 'date', 'po_no'],
    upd: ['status', 'payment_method', 'notes', 'date'],
  },
  notas: {
    table: 'notas',
    readOnly: true,
    from: 'notas t LEFT JOIN suppliers s ON s.id=t.supplier_id LEFT JOIN customers c ON c.id=t.customer_id LEFT JOIN pos p ON p.id=t.po_id',
    select:
      't.*, s.name supplier_name, COALESCE(c.name, (SELECT GROUP_CONCAT(DISTINCT c2.name SEPARATOR ", ") FROM rab_items r JOIN customers c2 ON c2.id=r.customer_id WHERE r.po_id=p.id)) customer_name, p.po_no, (SELECT COALESCE(SUM(total),0) FROM nota_items WHERE nota_id=t.id) total',
    search: ['t.nota_no', 's.name', 'p.po_no', 'c.name'],
    filters: ['date', 'supplier_id', 'customer_id'],
    sort: ['id', 'date', 'nota_no'],
  },
};

const resource = (req, res, next) => {
  req.c = R[req.params.r];
  req.c ? next() : next(fail(404, 'Resource tidak ditemukan'));
};

const values = (c, req) => {
  const o = {};
  c.cols?.forEach((k) => {
    if (req.body[k] !== undefined) {
      const v = clean(req.body[k]);
      o[k] = v === '' ? null : v;
    }
  });
  c.files?.forEach((f) => {
    const x = req.files?.[f]?.[0];
    if (x) {
      o[f] = x.filename;
    } else if (req.body[f] === '__delete__') {
      o[f] = null;
    }
  });
  return o;
};

const validate = (c, o, partial) => {
  (c.req || []).forEach((k) => {
    if ((!partial || k in o) && o[k] == null) {
      throw fail(400, `Field ${k} wajib diisi`);
    }
  });
  (c.num || []).forEach((k) => {
    if (
      k in o &&
      (isNaN(o[k]) || +o[k] < 0 || (k === 'qty' && +o[k] <= 0))
    ) {
      throw fail(400, `Field ${k} tidak valid`);
    }
  });
};

// ---------- auth ----------
app.post(
  '/api/auth/login',
  wrap(async (req, res) => {
    const [[u]] = await db.query('SELECT * FROM users WHERE username=?', [
      clean(req.body.username) || '',
    ]);
    if (!u || !(await bcrypt.compare(req.body.password || '', u.password))) {
      throw fail(401, 'Username atau password salah');
    }
    ok(res, {
      token: jwt.sign({ id: u.id, username: u.username }, JWT_SECRET, {
        expiresIn: '12h',
      }),
      user: { username: u.username },
    });
  }),
);

app.get('/api/auth/profile', auth, (req, res) => ok(res, req.user));

// ---------- users management ----------
app.get(
  '/api/users',
  auth,
  wrap(async (req, res) => {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = [10, 25, 50, 100].includes(+req.query.limit)
      ? +req.query.limit
      : 10;
    const search = clean(req.query.search) || '';
    const where = search ? 'WHERE username LIKE ?' : '';
    const args = search ? [`%${search}%`] : [];

    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) total FROM users ${where}`,
      args,
    );
    const [rows] = await db.query(
      `SELECT id, username, created_at FROM users ${where} ORDER BY id ASC LIMIT ? OFFSET ?`,
      [...args, limit, (page - 1) * limit],
    );
    ok(res, rows, {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    });
  }),
);

app.post(
  '/api/users',
  auth,
  wrap(async (req, res) => {
    const username = clean(req.body.username);
    const password = req.body.password;
    if (!username) throw fail(400, 'Username wajib diisi');
    if (!password || password.length < 4) {
      throw fail(400, 'Password minimal 4 karakter');
    }

    const [[existing]] = await db.query(
      'SELECT id FROM users WHERE username=?',
      [username],
    );
    if (existing) throw fail(409, 'Username sudah digunakan');

    const hash = await bcrypt.hash(password, 10);
    const [r] = await db.query(
      'INSERT INTO users (username, password) VALUES (?, ?)',
      [username, hash],
    );
    ok(res, { id: r.insertId, username });
  }),
);

app.put(
  '/api/users/:id',
  auth,
  wrap(async (req, res) => {
    const id = +req.params.id;
    const username = clean(req.body.username);
    const password = req.body.password;
    if (!username) throw fail(400, 'Username wajib diisi');

    const [[existing]] = await db.query(
      'SELECT id FROM users WHERE username=? AND id!=?',
      [username, id],
    );
    if (existing) throw fail(409, 'Username sudah digunakan user lain');

    if (password) {
      if (password.length < 4) throw fail(400, 'Password minimal 4 karakter');
      const hash = await bcrypt.hash(password, 10);
      await db.query(
        'UPDATE users SET username=?, password=? WHERE id=?',
        [username, hash, id],
      );
    } else {
      await db.query('UPDATE users SET username=? WHERE id=?', [username, id]);
    }
    ok(res, true);
  }),
);

app.delete(
  '/api/users/:id',
  auth,
  wrap(async (req, res) => {
    const id = +req.params.id;
    if (req.user.id === id) {
      throw fail(400, 'Tidak dapat menghapus akun Anda sendiri yang sedang aktif');
    }

    const [[{ count }]] = await db.query('SELECT COUNT(*) count FROM users');
    if (count <= 1) {
      throw fail(400, 'Tidak dapat menghapus user terakhir di sistem');
    }

    await db.query('DELETE FROM users WHERE id=?', [id]);
    ok(res, true);
  }),
);

// ---------- RAB Batch (Multi-Item & Multi-Customer Input) ----------
app.post(
  '/api/rab/batch',
  auth,
  wrap(async (req, res) => {
    const { date, customer_id, customer_ids, items } = req.body;
    if (!date) {
      throw fail(400, 'Tanggal RAB wajib diisi');
    }

    // Mendukung multi pelanggan dari header atau per baris item
    let cIds = [];
    if (Array.isArray(customer_ids) && customer_ids.length > 0) {
      cIds = customer_ids.map(Number).filter(Boolean);
    } else if (customer_id) {
      cIds = [+customer_id].filter(Boolean);
    }

    if (!Array.isArray(items) || items.length === 0) {
      throw fail(400, 'Daftar item RAB minimal 1 baris');
    }

    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      let totalInserted = 0;

      for (const it of items) {
        const item_name = clean(it.item_name);
        const supplier_id = +it.supplier_id;
        const qty = +it.qty;
        const unit = clean(it.unit) || '';
        const price = +it.price;

        if (!item_name) throw fail(400, 'Nama bahan/uraian wajib diisi');
        if (!supplier_id) {
          throw fail(400, `Supplier untuk "${item_name}" wajib dipilih`);
        }
        if (isNaN(qty) || qty <= 0) {
          throw fail(400, `Qty untuk "${item_name}" tidak valid`);
        }
        if (isNaN(price) || price < 0) {
          throw fail(400, `Harga untuk "${item_name}" tidak valid`);
        }

        // Simpan ke rab_items untuk pelanggan terpilih (per baris atau dari header)
        let targetCustomers = [];
        if (Array.isArray(it.customer_ids) && it.customer_ids.length > 0) {
          targetCustomers = it.customer_ids.map((id) => +id).filter(Boolean);
        } else if (it.customer_id) {
          targetCustomers = [+it.customer_id].filter(Boolean);
        } else if (cIds.length) {
          targetCustomers = cIds;
        }

        if (!targetCustomers.length) {
          throw fail(400, `Pelanggan untuk "${item_name}" wajib dipilih`);
        }

        for (const cId of targetCustomers) {
          await conn.query(
            'INSERT INTO rab_items (date, customer_id, supplier_id, item_name, qty, unit, price) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [date, cId, supplier_id, item_name, qty, unit, price],
          );
          totalInserted++;
        }

        // Auto-save / update ke master data bahan baku (materials)
        await conn.query(
          `INSERT INTO materials (name, unit, price, default_supplier_id)
           VALUES (?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
             unit = VALUES(unit),
             price = VALUES(price),
             default_supplier_id = VALUES(default_supplier_id)`,
          [item_name, unit, price, supplier_id],
        );
      }

      await conn.commit();
      ok(res, { count: totalInserted });
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      conn.release();
    }
  }),
);

// ---------- PO / Nota / Report ----------
app.get(
  '/api/pos/rab-preview',
  auth,
  wrap(async (req, res) => {
    const { date } = req.query;
    if (!date) throw fail(400, 'Parameter date wajib diisi');

    const [items] = await db.query(
      `SELECT r.*, s.name supplier_name, c.name customer_name
       FROM rab_items r
       LEFT JOIN suppliers s ON s.id=r.supplier_id
       LEFT JOIN customers c ON c.id=r.customer_id
       WHERE r.date=? AND r.po_id IS NULL
       ORDER BY r.supplier_id, r.id`,
      [date],
    );
    ok(res, items);
  }),
);

app.post(
  '/api/pos/batch-create',
  auth,
  wrap(async (req, res) => {
    const { date, payment_method, notes, items } = req.body;
    if (!date) throw fail(400, 'Tanggal wajib diisi');
    if (!Array.isArray(items) || !items.length) {
      throw fail(400, 'Pilih setidaknya 1 item dari RAB untuk dibuatkan PO');
    }

    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      // Kelompokkan item berdasarkan supplier_id
      const bySupplier = {};
      for (const it of items) {
        const suppId = it.supplier_id;
        if (!suppId) throw fail(400, `Item "${it.item_name}" belum memiliki supplier`);
        if (!bySupplier[suppId]) bySupplier[suppId] = [];
        bySupplier[suppId].push(it);
      }

      const createdPos = [];

      for (const [suppId, suppItems] of Object.entries(bySupplier)) {
        const [[{ n }]] = await conn.query(
          'SELECT COUNT(*) n FROM pos WHERE date=? AND supplier_id=?',
          [date, suppId],
        );
        const po_no = `PO/${date.replace(/-/g, '')}/${suppId}-${n + 1}`;
        const [r] = await conn.query('INSERT INTO pos SET ?', [
          {
            po_no,
            date,
            supplier_id: suppId,
            status: 'unpaid',
            payment_method: payment_method || 'Transfer Bank (VA)',
            notes: notes || null,
          },
        ]);

        const poId = r.insertId;

        // Update rab_items dengan po_id dan perbarui data jika ada penyesuaian
        for (const it of suppItems) {
          await conn.query(
            'UPDATE rab_items SET po_id=?, supplier_id=?, qty=?, price=? WHERE id=?',
            [poId, suppId, it.qty, it.price, it.id],
          );
        }

        createdPos.push({ id: poId, po_no, supplier_id: suppId, count: suppItems.length });
      }

      await conn.commit();
      ok(res, { success: true, count: createdPos.length, pos: createdPos });
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      conn.release();
    }
  }),
);

app.post(
  '/api/pos/:id/pay',
  auth,
  wrap(async (req, res) => {
    const [[po]] = await db.query('SELECT id, status FROM pos WHERE id=?', [
      req.params.id,
    ]);
    if (!po) throw fail(404, 'PO tidak ditemukan');

    const nextStatus = po.status === 'paid' ? 'unpaid' : 'paid';
    await db.query('UPDATE pos SET status=? WHERE id=?', [nextStatus, po.id]);
    ok(res, { status: nextStatus, message: nextStatus === 'paid' ? 'Status diubah: Sudah Dibayar' : 'Status diubah: Belum Dibayar' });
  }),
);

app.get(
  '/api/pos/:id/items',
  auth,
  wrap(async (req, res) => {
    const [items] = await db.query(
      `SELECT r.*, c.name customer_name, s.name supplier_name
       FROM rab_items r
       LEFT JOIN customers c ON c.id=r.customer_id
       LEFT JOIN suppliers s ON s.id=r.supplier_id
       WHERE r.po_id=?
       ORDER BY r.id`,
      [req.params.id],
    );
    ok(res, items);
  }),
);

app.post(
  '/api/pos/generate',
  auth,
  wrap(async (req, res) => {
    const { date, supplier_id } = req.body;
    if (!date || !supplier_id) throw fail(400, 'Tanggal dan supplier wajib diisi');

    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();
      const [lines] = await conn.query(
        'SELECT id FROM rab_items WHERE date=? AND supplier_id=? AND po_id IS NULL FOR UPDATE',
        [date, supplier_id],
      );
      if (!lines.length) {
        throw fail(
          400,
          'Tidak ada item RAB yang belum masuk PO untuk tanggal & supplier ini',
        );
      }
      const [[{ n }]] = await conn.query(
        'SELECT COUNT(*) n FROM pos WHERE date=? AND supplier_id=?',
        [date, supplier_id],
      );
      const po_no = `PO/${date.replace(/-/g, '')}/${supplier_id}-${n + 1}`;
      const [r] = await conn.query('INSERT INTO pos SET ?', [
        { po_no, date, supplier_id },
      ]);
      await conn.query('UPDATE rab_items SET po_id=? WHERE id IN (?)', [
        r.insertId,
        lines.map((l) => l.id),
      ]);
      await conn.commit();
      ok(res, { id: r.insertId, po_no });
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      conn.release();
    }
  }),
);

app.post(
  '/api/notas/generate',
  auth,
  wrap(async (req, res) => {
    const [[po]] = await db.query('SELECT * FROM pos WHERE id=?', [
      req.body.po_id,
    ]);
    if (!po) throw fail(404, 'PO tidak ditemukan');

    const [existingNotas] = await db.query('SELECT id FROM notas WHERE po_id=?', [
      po.id,
    ]);
    if (existingNotas.length) throw fail(409, 'Nota untuk PO ini sudah ada');

    // Ambil daftar customer unik yang ada pada PO ini
    const [customers] = await db.query(
      'SELECT DISTINCT customer_id FROM rab_items WHERE po_id=? AND customer_id IS NOT NULL',
      [po.id],
    );

    const baseNo = po.po_no.replace('PO/', 'NT/');
    const createdIds = [];

    if (customers.length <= 1) {
      // 1 Customer atau tanpa customer: Buat 1 nota
      const custId = customers.length ? customers[0].customer_id : null;
      const [r] = await db.query('INSERT INTO notas SET ?', [
        { nota_no: baseNo, date: po.date, supplier_id: po.supplier_id, po_id: po.id, customer_id: custId },
      ]);
      await db.query(
        'INSERT INTO nota_items (nota_id,item_name,qty,unit,price) SELECT ?,item_name,SUM(qty),unit,price FROM rab_items WHERE po_id=? GROUP BY item_name,unit,price',
        [r.insertId, po.id],
      );
      createdIds.push(r.insertId);
    } else {
      // Lebih dari 1 customer: Buat nota masing-masing per customer beserta item belanjaannya
      for (let i = 0; i < customers.length; i++) {
        const custId = customers[i].customer_id;
        const notaNo = `${baseNo}-${i + 1}`;
        const [r] = await db.query('INSERT INTO notas SET ?', [
          { nota_no: notaNo, date: po.date, supplier_id: po.supplier_id, po_id: po.id, customer_id: custId },
        ]);
        await db.query(
          'INSERT INTO nota_items (nota_id,item_name,qty,unit,price) SELECT ?,item_name,SUM(qty),unit,price FROM rab_items WHERE po_id=? AND customer_id=? GROUP BY item_name,unit,price',
          [r.insertId, po.id, custId],
        );
        createdIds.push(r.insertId);
      }
    }

    ok(res, { id: createdIds[0], ids: createdIds });
  }),
);

app.get(
  '/api/notas/:id/detail',
  auth,
  wrap(async (req, res) => {
    const [[nota]] = await db.query(
      `SELECT n.*, s.name supplier_name, s.address supplier_address, s.phone supplier_phone, s.notes supplier_notes, s.pic_name, s.bank_name, s.bank_account_no, s.bank_account_name, s.logo, s.signature, s.stamp, p.po_no,
        COALESCE(c_direct.name, (SELECT GROUP_CONCAT(DISTINCT c.name SEPARATOR ', ') FROM rab_items r JOIN customers c ON c.id=r.customer_id WHERE r.po_id=p.id)) customer_name,
        COALESCE(c_direct.address, (SELECT GROUP_CONCAT(DISTINCT c.address SEPARATOR ', ') FROM rab_items r JOIN customers c ON c.id=r.customer_id WHERE r.po_id=p.id)) customer_address
       FROM notas n
       JOIN suppliers s ON s.id=n.supplier_id
       LEFT JOIN customers c_direct ON c_direct.id=n.customer_id
       LEFT JOIN pos p ON p.id=n.po_id
       WHERE n.id=?`,
      [req.params.id],
    );
    if (!nota) throw fail(404, 'Nota tidak ditemukan');

    const [items] = await db.query(
      'SELECT * FROM nota_items WHERE nota_id=? ORDER BY id',
      [nota.id],
    );

    // Ambil daftar customer yang ada pada PO terkait
    const [customers] = await db.query(
      `SELECT DISTINCT c.id, c.name, c.address 
       FROM rab_items r 
       JOIN customers c ON c.id=r.customer_id 
       WHERE r.po_id=?`,
      [nota.po_id],
    );

    // Rincian item per customer dari rab_items jika nota lama belum terpisah
    let customerItems = [];
    if (customers.length > 1) {
      const [rItems] = await db.query(
        `SELECT r.customer_id, r.item_name, r.unit, r.price, SUM(r.qty) qty, SUM(r.total) total
         FROM rab_items r
         WHERE r.po_id=?
         GROUP BY r.customer_id, r.item_name, r.unit, r.price`,
        [nota.po_id],
      );
      customerItems = rItems;
    }

    ok(res, { ...nota, items, customers, customer_items: customerItems });
  }),
);

app.put(
  '/api/nota-items/:id',
  auth,
  wrap(async (req, res) => {
    const { qty, price } = req.body;
    if (isNaN(qty) || isNaN(price) || +qty <= 0 || +price < 0) {
      throw fail(400, 'Qty/harga tidak valid');
    }
    await db.query('UPDATE nota_items SET qty=?, price=? WHERE id=?', [
      qty,
      price,
      req.params.id,
    ]);
    ok(res, true);
  }),
);

app.get(
  '/api/report/summary',
  auth,
  wrap(async (req, res) => {
    const from = req.query.from || '1970-01-01';
    const to = req.query.to || '2999-12-31';
    const [rows] = await db.query(
      `SELECT s.id, s.name,
        COALESCE((SELECT SUM(total) FROM rab_items WHERE supplier_id=s.id AND date BETWEEN ? AND ?),0) rab_total,
        COALESCE((SELECT SUM(total) FROM rab_items WHERE supplier_id=s.id AND po_id IS NOT NULL AND date BETWEEN ? AND ?),0) po_total,
        COALESCE((SELECT SUM(ni.total) FROM nota_items ni JOIN notas n ON n.id=ni.nota_id WHERE n.supplier_id=s.id AND n.date BETWEEN ? AND ?),0) nota_total
       FROM suppliers s ORDER BY s.name`,
      [from, to, from, to, from, to],
    );
    ok(res, rows);
  }),
);

// ---------- generic CRUD (taruh paling akhir) ----------
app.get(
  '/api/:r',
  auth,
  resource,
  wrap(async (req, res) => {
    const { c, query: q } = req;
    const page = Math.max(1, parseInt(q.page) || 1);
    const isAll = q.all === '1' || q.all === 'true' || +q.limit === -1;
    const limit = isAll
      ? 100000
      : [10, 25, 50, 100, 250, 500, 1000].includes(+q.limit)
        ? +q.limit
        : 10;
    const where = [];
    const args = [];

    if (q.search) {
      where.push(
        '(' + c.search.map((s) => `${s} LIKE ?`).join(' OR ') + ')',
      );
      c.search.forEach(() => args.push(`%${q.search}%`));
    }

    // Filter rentang tanggal jika ada query 'from' atau 'to'
    if (q.from && c.filters?.includes('date')) {
      where.push('t.date >= ?');
      args.push(q.from);
    }
    if (q.to && c.filters?.includes('date')) {
      where.push('t.date <= ?');
      args.push(q.to);
    }

    (c.filters || []).forEach((f) => {
      // Lewati 'date' jika sudah menggunakan rentang from/to
      if (f === 'date' && (q.from || q.to)) return;
      if (q[f]) {
        where.push(`t.${f}=?`);
        args.push(q[f]);
      }
    });

    const w = where.length ? 'WHERE ' + where.join(' AND ') : '';
    const sort = c.sort.includes(q.sort) ? q.sort : 'id';
    const dir = q.order === 'asc' ? 'ASC' : 'DESC';

    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) total FROM ${c.from} ${w}`,
      args,
    );
    const [rows] = await db.query(
      `SELECT ${c.select} FROM ${c.from} ${w} ORDER BY t.${sort} ${dir} LIMIT ? OFFSET ?`,
      [...args, limit, (page - 1) * limit],
    );
    ok(res, rows, {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    });
  }),
);

app.post(
  '/api/:r',
  auth,
  resource,
  fileFields,
  wrap(async (req, res) => {
    if (req.c.readOnly) throw fail(405, 'Gunakan endpoint generate');
    const o = values(req.c, req);
    validate(req.c, o);
    const [r] = await db.query(`INSERT INTO ${req.c.table} SET ?`, [o]);

    // Jika input manual ke rab, otomatis simpan/update ke master materials
    if (req.params.r === 'rab' && o.item_name) {
      await db.query(
        `INSERT INTO materials (name, unit, price, default_supplier_id)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           unit = COALESCE(VALUES(unit), unit),
           price = COALESCE(VALUES(price), price),
           default_supplier_id = COALESCE(VALUES(default_supplier_id), default_supplier_id)`,
        [o.item_name, o.unit || null, o.price || 0, o.supplier_id || null],
      );
    }

    ok(res, { id: r.insertId });
  }),
);

app.put(
  '/api/:r/:id',
  auth,
  resource,
  fileFields,
  wrap(async (req, res) => {
    if (req.c.readOnly) throw fail(405, 'Tidak diizinkan');
    const o = values(req.c, req);
    validate(req.c, o, true);
    if (!Object.keys(o).length) throw fail(400, 'Tidak ada data diubah');
    await db.query(`UPDATE ${req.c.table} SET ? WHERE id=?`, [o, req.params.id]);

    // Jika update data rab, update juga ke master materials
    if (req.params.r === 'rab' && o.item_name) {
      await db.query(
        `INSERT INTO materials (name, unit, price, default_supplier_id)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           unit = COALESCE(VALUES(unit), unit),
           price = COALESCE(VALUES(price), price),
           default_supplier_id = COALESCE(VALUES(default_supplier_id), default_supplier_id)`,
        [o.item_name, o.unit || null, o.price || 0, o.supplier_id || null],
      );
    }

    ok(res, true);
  }),
);

app.delete(
  '/api/:r/:id',
  auth,
  resource,
  wrap(async (req, res) => {
    await db.query(`DELETE FROM ${req.c.table} WHERE id=?`, [req.params.id]);
    ok(res, true);
  }),
);

app.use((e, req, res, next) => {
  const sql = e.code && String(e.code).startsWith('ER_');
  const status =
    e.status || (e.name === 'MulterError' ? 400 : sql ? 409 : 500);
  if (status === 500 || sql) console.error(e);
  res.status(status).json({
    success: false,
    message: sql
      ? 'Data tidak valid atau masih dipakai data lain'
      : status === 500
        ? 'Terjadi kesalahan server'
        : e.message,
  });
});

(async () => {
  // Pastikan kolom baru di suppliers (PIC, NIB, Rekening Bank, Catatan) tersedia
  try {
    const [supplierCols] = await db.query(`
      SELECT COLUMN_NAME FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'suppliers'
    `);
    const existingColNames = (supplierCols || []).map((c) => c.COLUMN_NAME);

    const supplierColsToAdd = [
      { name: 'nib', sql: 'ALTER TABLE suppliers ADD COLUMN nib VARCHAR(60) NULL AFTER name' },
      { name: 'pic_name', sql: 'ALTER TABLE suppliers ADD COLUMN pic_name VARCHAR(120) NULL AFTER nib' },
      { name: 'bank_name', sql: 'ALTER TABLE suppliers ADD COLUMN bank_name VARCHAR(60) NULL AFTER phone' },
      { name: 'bank_account_no', sql: 'ALTER TABLE suppliers ADD COLUMN bank_account_no VARCHAR(60) NULL AFTER bank_name' },
      { name: 'bank_account_name', sql: 'ALTER TABLE suppliers ADD COLUMN bank_account_name VARCHAR(120) NULL AFTER bank_account_no' },
      { name: 'notes', sql: 'ALTER TABLE suppliers ADD COLUMN notes TEXT NULL AFTER address' },
      { name: 'stamp', sql: 'ALTER TABLE suppliers ADD COLUMN stamp VARCHAR(120) NULL AFTER signature' },
    ];

    for (const col of supplierColsToAdd) {
      if (!existingColNames.includes(col.name)) {
        await db.query(col.sql);
      }
    }
  } catch (err) {
    console.error('Migration suppliers warning:', err.message);
  }

  // Pastikan kolom customer_id di notas tersedia & po_id bisa multi-nota per PO
  try {
    try {
      await db.query(`ALTER TABLE notas ADD COLUMN customer_id INT NULL AFTER supplier_id`);
    } catch (e) {
      if (e.code !== 'ER_DUP_FIELDNAME') console.warn('Add customer_id to notas:', e.message);
    }

    // Tambah indeks non-unique pada po_id agar FK tetap aman saat index unik di-drop
    try {
      await db.query(`ALTER TABLE notas ADD INDEX idx_notas_po_id (po_id)`);
    } catch (_) {}

    // Hapus indeks UNIQUE standalone pada po_id jika ada agar bisa buat nota terpisah per pelanggan
    try {
      const [indexes] = await db.query(`
        SELECT INDEX_NAME, NON_UNIQUE FROM information_schema.STATISTICS
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'notas' AND COLUMN_NAME = 'po_id' AND NON_UNIQUE = 0
      `);
      for (const idx of indexes) {
        if (idx.INDEX_NAME && idx.INDEX_NAME !== 'PRIMARY' && idx.INDEX_NAME !== 'idx_notas_po_id') {
          try {
            await db.query(`ALTER TABLE notas DROP INDEX \`${idx.INDEX_NAME}\``);
          } catch (_) {}
        }
      }
    } catch (_) {
      try {
        await db.query(`ALTER TABLE notas DROP INDEX \`po_id\``);
      } catch (_) {}
    }
  } catch (err) {
    console.error('Migration notas warning:', err.message);
  }

  // Pastikan kolom status, payment_method, notes di tabel pos tersedia
  try {
    try {
      await db.query(`ALTER TABLE pos ADD COLUMN status VARCHAR(30) NOT NULL DEFAULT 'unpaid' AFTER supplier_id`);
    } catch (e) {
      if (e.code !== 'ER_DUP_FIELDNAME') console.warn('Add status to pos:', e.message);
    }
    try {
      await db.query(`ALTER TABLE pos ADD COLUMN payment_method VARCHAR(60) NULL AFTER status`);
    } catch (e) {
      if (e.code !== 'ER_DUP_FIELDNAME') console.warn('Add payment_method to pos:', e.message);
    }
    try {
      await db.query(`ALTER TABLE pos ADD COLUMN notes TEXT NULL AFTER payment_method`);
    } catch (e) {
      if (e.code !== 'ER_DUP_FIELDNAME') console.warn('Add notes to pos:', e.message);
    }
  } catch (err) {
    console.error('Migration pos warning:', err.message);
  }

  // Pastikan tabel materials tersedia
  await db.query(`
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

  try {
    await db.query(`ALTER TABLE materials ADD COLUMN code VARCHAR(30) NULL AFTER id`);
  } catch (e) {
    if (e.code !== 'ER_DUP_FIELDNAME') console.warn('Add code to materials:', e.message);
  }
  try {
    await db.query(`ALTER TABLE materials ADD COLUMN category VARCHAR(100) NULL AFTER name`);
  } catch (e) {
    if (e.code !== 'ER_DUP_FIELDNAME') console.warn('Add category to materials:', e.message);
  }

  // Populasikan data awal materials dari rab_items yang sudah ada
  await db.query(`
    INSERT IGNORE INTO materials (name, unit, price, default_supplier_id)
    SELECT item_name, unit, price, supplier_id FROM rab_items ORDER BY id DESC
  `);

  const [[{ n }]] = await db.query('SELECT COUNT(*) n FROM users');
  if (!n) {
    await db.query('INSERT INTO users SET ?', [
      {
        username: ADMIN_USER,
        password: await bcrypt.hash(ADMIN_PASS, 10),
      },
    ]);
  }
  app.listen(PORT, () => console.log(`API jalan di :${PORT}`));
})();
