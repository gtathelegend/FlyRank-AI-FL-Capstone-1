export default function AdminToast({ toast }) {
  if (!toast) return null;
  const color = toast.type === "error" ? "bg-red-600" : "bg-emerald-600";

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className={`${color} text-white px-4 py-3 rounded-lg shadow-lg`}>
        {toast.message}
      </div>
    </div>
  );
}
