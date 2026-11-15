import CrudPage from "@/components/CrudPage";
import { API_ENDPOINTS as E } from "@/utils/endpoints";
import { fileUrl } from "@/utils/format";

const img = (f) =>
  f ? (
    <img
      src={fileUrl(f)}
      alt=""
      className="h-9 w-9 rounded-lg border border-slate-200 object-contain bg-white"
    />
  ) : (
    <span className="text-slate-300">-</span>
  );

export default function Suppliers() {
  return (
    <CrudPage
      title="Toko / Supplier"
      list={E.SUPPLIERS.LIST}
      detail={E.SUPPLIERS.DETAIL}
      columns={[
        { key: "logo", label: "Logo", render: (r) => img(r.logo) },
        {
          key: "name",
          label: "Supplier & PIC",
          render: (r) => (
            <div>
              <div className="font-bold text-slate-900">{r.name}</div>
              {r.pic_name && (
                <div className="text-xs font-medium text-slate-500">
                  PIC: <span className="text-slate-700">{r.pic_name}</span>
                </div>
              )}
              {r.nib && (
                <div className="text-[11px] text-slate-400 font-mono">
                  NIB: {r.nib}
                </div>
              )}
            </div>
          ),
        },
        {
          key: "bank_account_no",
          label: "Rekening Bank",
          render: (r) =>
            r.bank_account_no ? (
              <div className="text-xs">
                <span className="font-bold text-teal-800">
                  {r.bank_name || "Bank"}
                </span>
                <span className="mx-1 text-slate-400">•</span>
                <span className="font-mono font-semibold text-slate-900">
                  {r.bank_account_no}
                </span>
                {r.bank_account_name && (
                  <div className="text-[11px] text-slate-500">
                    a.n {r.bank_account_name}
                  </div>
                )}
              </div>
            ) : (
              <span className="text-xs text-slate-400">-</span>
            ),
        },
        {
          key: "phone",
          label: "No. Telepon",
          render: (r) => (
            <span className="text-xs font-medium text-slate-700">
              {r.phone || "-"}
            </span>
          ),
        },
        {
          key: "address",
          label: "Alamat",
          render: (r) => (
            <span className="line-clamp-2 text-xs text-slate-600 max-w-[200px]" title={r.address}>
              {r.address || "-"}
            </span>
          ),
        },
        {
          key: "signature",
          label: "TTD",
          render: (r) => img(r.signature),
        },
        {
          key: "stamp",
          label: "Stempel",
          render: (r) => img(r.stamp),
        },
      ]}
      fields={[
        { name: "name", label: "Nama Supplier", required: true },
        { name: "nib", label: "NIB" },
        { name: "pic_name", label: "Nama PIC" },
        { name: "phone", label: "Nomor Telepon" },
        {
          name: "bank_name",
          label: "Nama Bank",
          half: true,
          placeholder: "Contoh: BNI, BCA, Mandiri",
        },
        {
          name: "bank_account_no",
          label: "Nomor Rekening",
          half: true,
          placeholder: "Contoh: 1915241475",
        },
        {
          name: "bank_account_name",
          label: "Nama Pemilik Rekening",
          helper: "Akan otomatis terisi di form SPM",
        },
        { name: "address", label: "Alamat", type: "textarea", rows: 2 },
        { name: "notes", label: "Catatan", type: "textarea", rows: 2 },
        {
          name: "logo",
          label: "Logo Toko (untuk nota)",
          type: "file",
          half: true,
        },
        {
          name: "signature",
          label: "Tanda Tangan (untuk nota)",
          type: "file",
          half: true,
        },
        {
          name: "stamp",
          label: "Stempel Toko (untuk nota)",
          type: "file",
          half: true,
        },
      ]}
    />
  );
}
