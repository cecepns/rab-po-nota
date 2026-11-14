import CrudPage from "@/components/CrudPage";
import { API_ENDPOINTS as E } from "@/utils/endpoints";
import { rupiah } from "@/utils/format";

export default function Materials() {
  return (
    <CrudPage
      title="Bahan Baku"
      list={E.MATERIALS.LIST}
      detail={E.MATERIALS.DETAIL}
      columns={[
        { key: "name", label: "Nama Bahan" },
        { key: "unit", label: "Satuan", render: (r) => r.unit || "-" },
        {
          key: "price",
          label: "Harga Terakhir",
          render: (r) => (r.price > 0 ? rupiah(r.price) : "-"),
        },
        {
          key: "default_supplier_name",
          label: "Supplier Default",
          render: (r) => r.default_supplier_name || "-",
        },
      ]}
      fields={[
        { name: "name", label: "Nama Bahan Baku", required: true },
        { name: "unit", label: "Satuan (kg, liter, dll)" },
        { name: "price", label: "Harga Standar / Terakhir", type: "number" },
        {
          name: "default_supplier_id",
          label: "Supplier Default",
          type: "select",
          options: { endpoint: E.SUPPLIERS.LIST, label: "name" },
        },
      ]}
    />
  );
}
