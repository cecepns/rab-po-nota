import CrudPage from "@/components/CrudPage";
import { API_ENDPOINTS as E } from "@/utils/endpoints";
import { rupiah, today } from "@/utils/format";

export default function Rab() {
  return (
    <CrudPage
      title="RAB Harian"
      list={E.RAB.LIST}
      detail={E.RAB.DETAIL}
      initial={{ date: today() }}
      columns={[
        { key: "date", label: "Tanggal" },
        { key: "customer_name", label: "Pelanggan" },
        { key: "supplier_name", label: "Supplier" },
        { key: "item_name", label: "Bahan" },
        { key: "qty", label: "Qty", render: (r) => `${+r.qty} ${r.unit || ""}` },
        { key: "price", label: "Harga", render: (r) => rupiah(r.price) },
        { key: "total", label: "Jumlah", render: (r) => <b>{rupiah(r.total)}</b> },
        { key: "po_no", label: "PO", render: (r) => r.po_no || <span className="text-amber-600">Belum</span> },
      ]}
      fields={[
        { name: "date", label: "Tanggal", type: "date", required: true },
        { name: "customer_id", label: "Pelanggan", type: "select", required: true, options: { endpoint: E.CUSTOMERS.LIST, label: "name" } },
        { name: "supplier_id", label: "Toko / Supplier", type: "select", required: true, options: { endpoint: E.SUPPLIERS.LIST, label: "name" } },
        { name: "item_name", label: "Nama Bahan", required: true },
        { name: "qty", label: "Qty", type: "number", required: true },
        { name: "unit", label: "Satuan" },
        { name: "price", label: "Harga Satuan", type: "number", required: true },
      ]}
    />
  );
}
