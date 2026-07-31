export default function AdminFormInput({ label, ...props }) {
  return (
    <label className="flex flex-col gap-2 text-sm text-slate-700">
      <span className="font-medium">{label}</span>
      <input
        {...props}
        className="rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-700"
      />
    </label>
  );
}
