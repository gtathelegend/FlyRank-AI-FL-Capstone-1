export default function AdminStatusBadge({ status }) {
  const styles = {
    published: "bg-green-100 text-green-700",
    draft:     "bg-yellow-100 text-yellow-700",
    archived:  "bg-slate-100 text-slate-500",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${styles[status] || styles.draft}`}>
      {status || "draft"}
    </span>
  );
}
