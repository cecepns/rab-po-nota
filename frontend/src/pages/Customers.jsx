import CrudPage from "@/components/CrudPage";
import { API_ENDPOINTS as E } from "@/utils/endpoints";

export default function Customers() {
  return (
    <CrudPage
      title="Pelanggan"
      list={E.CUSTOMERS.LIST}
      detail={E.CUSTOMERS.DETAIL}
      columns={[{ key: "name", label: "Nama" }, { key: "phone", label: "Telp" }, { key: "address", label: "Alamat" }]}
      fields={[
        { name: "name", label: "Nama Pelanggan", required: true },
        { name: "phone", label: "Telepon" },
        { name: "address", label: "Alamat" },
      ]}
    />
  );
}
