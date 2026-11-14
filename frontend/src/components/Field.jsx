import { useEffect, useState, useRef, useCallback } from "react";
import AsyncSelect from "react-select/async";
import { api } from "@/utils/api";
import { fileUrl } from "@/utils/format";

const selectStyles = {
  control: (base, state) => ({
    ...base,
    borderRadius: "0.75rem",
    borderColor: state.isFocused ? "#0f766e" : "#e2e8f0",
    boxShadow: state.isFocused ? "0 0 0 3px rgba(15, 118, 110, 0.15)" : "none",
    "&:hover": {
      borderColor: state.isFocused ? "#0f766e" : "#cbd5e1",
    },
    padding: "1px 2px",
    backgroundColor: "#ffffff",
    fontSize: "0.875rem",
    minHeight: "42px",
  }),
  menu: (base) => ({
    ...base,
    borderRadius: "0.75rem",
    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
    border: "1px solid #f1f5f9",
    zIndex: 9999,
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? "#0f766e"
      : state.isFocused
      ? "#f0fdfa"
      : "#ffffff",
    color: state.isSelected ? "#ffffff" : "#1e293b",
    fontSize: "0.875rem",
    cursor: "pointer",
    padding: "8px 12px",
  }),
  placeholder: (base) => ({
    ...base,
    color: "#94a3b8",
    fontSize: "0.875rem",
  }),
  singleValue: (base) => ({
    ...base,
    color: "#0f172a",
    fontWeight: 600,
    fontSize: "0.875rem",
  }),
};

// type: text | number | date | select | file ; select memakai options {endpoint,label}
export default function Field({ field, value, onChange }) {
  const [selectedOption, setSelectedOption] = useState(null);
  const timerRef = useRef(null);

  // Sync selectedOption when value prop changes (e.g. form edit mode)
  useEffect(() => {
    if (field.type !== "select" || !field.options) return;

    if (!value) {
      setSelectedOption(null);
      return;
    }

    if (selectedOption && (selectedOption.value === value || selectedOption.value === +value)) {
      return;
    }

    // Load initial match
    api
      .get(field.options.endpoint, { params: { limit: 100 } })
      .then((res) => {
        const items = res.data?.data || [];
        const match = items.find((o) => o.id === value || o.id === +value);
        if (match) {
          setSelectedOption({
            value: match.id,
            label: match[field.options.label || "name"],
            data: match,
          });
        }
      })
      .catch(() => {});
  }, [value, field.options, field.type]);

  // Debounced API search (1 second delay on user keystroke)
  const loadOptions = useCallback(
    (inputValue, callback) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      // Initial load without typing
      if (!inputValue || !inputValue.trim()) {
        api
          .get(field.options.endpoint, { params: { limit: 50 } })
          .then((res) => {
            const items = res.data?.data || [];
            const opts = items.map((o) => ({
              value: o.id,
              label: o[field.options.label || "name"],
              data: o,
            }));
            callback(opts);
          })
          .catch(() => callback([]));
        return;
      }

      // Debounce 1000ms (1 second) when typing search query
      timerRef.current = setTimeout(async () => {
        try {
          const res = await api.get(field.options.endpoint, {
            params: { search: inputValue.trim(), limit: 50 },
          });
          const items = res.data?.data || [];
          const opts = items.map((o) => ({
            value: o.id,
            label: o[field.options.label || "name"],
            data: o,
          }));
          callback(opts);
        } catch {
          callback([]);
        }
      }, 1000);
    },
    [field.options]
  );

  const common = { className: "input", required: field.required };
  let input;

  if (field.type === "select") {
    input = (
      <div className="relative">
        <AsyncSelect
          cacheOptions
          defaultOptions
          loadOptions={loadOptions}
          value={selectedOption}
          onChange={(opt) => {
            setSelectedOption(opt);
            onChange(opt ? opt.value : "");
          }}
          isClearable={!field.required}
          styles={selectStyles}
          placeholder={field.placeholder || "Pilih..."}
          noOptionsMessage={() => "Data tidak ditemukan"}
          loadingMessage={() => "Memuat..."}
        />
        {/* Hidden native input for HTML5 required form validation */}
        {field.required && (
          <input
            tabIndex={-1}
            autoComplete="off"
            style={{
              opacity: 0,
              width: 0,
              height: 0,
              position: "absolute",
              pointerEvents: "none",
            }}
            value={value ?? ""}
            onChange={() => {}}
            required={field.required}
          />
        )}
      </div>
    );
  } else if (field.type === "file") {
    const isFileInstance = value instanceof File;
    const previewSrc = isFileInstance
      ? URL.createObjectURL(value)
      : typeof value === "string" && value
      ? fileUrl(value)
      : null;

    input = (
      <div className="space-y-2">
        {previewSrc && (
          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/80 p-2.5">
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xs flex items-center justify-center p-0.5">
              <img
                src={previewSrc}
                alt="Preview"
                className="h-full w-full object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>
            <div className="flex-1 min-w-0 text-xs">
              <p className="font-semibold text-slate-800 truncate">
                {isFileInstance ? value.name : value}
              </p>
              <p className="text-[11px] text-teal-600 font-medium">
                {isFileInstance ? "File baru dipilih" : "File saat ini terpasang"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onChange(null)}
              className="rounded-lg px-2.5 py-1 text-xs text-rose-500 hover:bg-rose-50 font-medium transition"
              title="Hapus file ini"
            >
              Hapus
            </button>
          </div>
        )}

        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="input !py-1.5 text-xs file:mr-3 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 cursor-pointer"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              onChange(e.target.files[0]);
            }
          }}
        />
      </div>
    );
  } else if (field.type === "textarea") {
    input = (
      <textarea
        {...common}
        rows={field.rows || 3}
        value={value ?? ""}
        placeholder={field.placeholder || ""}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  } else {
    input = (
      <input
        {...common}
        type={field.type || "text"}
        step={field.type === "number" ? "any" : undefined}
        value={value ?? ""}
        placeholder={field.placeholder || ""}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }

  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-slate-700">
        {field.label}
        {field.required && <span className="text-rose-500"> *</span>}
      </span>
      {input}
      {field.helper && (
        <span className="mt-1 block text-[11px] text-slate-400">
          {field.helper}
        </span>
      )}
    </label>
  );
}
