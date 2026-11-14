import CrudPage from "@/components/CrudPage";
import { API_ENDPOINTS as E } from "@/utils/endpoints";
import { fileUrl } from "@/utils/format";

const img = (f) => (f ? <img src={fileUrl(f)} alt="" className="h-9 w-9 rounded object-contain" /> : "-");

export default function Suppliers() {
  return (
    <CrudPage
      title="Toko / Supplier"
      list={E.SUPPLIERS.LIST}
      detail={E.SUPPLIERS.DETAIL}
      columns={[
        { key: "logo", label: "Logo", render: (r) => img(r.logo) },
        { key: "name", label: "Nama Toko" },
        { key: "address", label: "Alamat" },
        { key: "phone", label: "Telp" },
        { key: "signature", label: "Tanda Tangan", render: (r) => img(r.signature) },
      ]}
      fields={[
        { name: "name", label: "Nama Toko", required: true },
        { name: "address", label: "Alamat" },
        { name: "phone", label: "Telepon" },
        { name: "logo", label: "Logo Toko (untuk nota)", type: "file" },
        { name: "signature", label: "Tanda Tangan (untuk nota)", type: "file" },
      ]}
    />
  );
}
