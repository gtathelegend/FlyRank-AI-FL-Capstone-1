export default function AdminFormSelect({ label, options, ...props }) {
  return (
    <label className="flex flex-col gap-2 text-sm text-slate-700">
      <span className="font-medium">{label}</span>
      <select
        {...props}
        className="rounded-md border border-slate-300 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-slate-700"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
