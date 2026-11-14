import toast from "react-hot-toast";

// Konfirmasi berbasis toast -> Promise<boolean>
export const confirmToast = (message) =>
  new Promise((resolve) => {
    toast(
      (t) => (
        <div className="space-y-2">
          <p className="text-sm font-medium">{message}</p>
          <div className="flex justify-end gap-2">
            <button className="btn-ghost !py-1" onClick={() => { toast.dismiss(t.id); resolve(false); }}>Batal</button>
            <button className="btn-danger !py-1" onClick={() => { toast.dismiss(t.id); resolve(true); }}>Ya, lanjut</button>
          </div>
        </div>
      ),
      { duration: Infinity }
    );
  });
