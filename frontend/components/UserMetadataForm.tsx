import { useState } from "react";

export default function UserMetadataForm({
  onRegister,
}: {
  onRegister: (email: string, name: string, institution: string) => Promise<void>;
}) {
  const [form, setForm] = useState({ email: "", name: "", institution: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await onRegister(form.email, form.name, form.institution);
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 bg-card p-2 rounded border border-border">
      <p className="font-bold">Register your metadata:</p>
      <input
        type="email"
        placeholder="Email"
        value={form.email}
        onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
        required
        className="p-1 border rounded"
      />
      <input
        type="text"
        placeholder="Name"
        value={form.name}
        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
        required
        className="p-1 border rounded"
      />
      <input
        type="text"
        placeholder="Institution"
        value={form.institution}
        onChange={e => setForm(f => ({ ...f, institution: e.target.value }))}
        required
        className="p-1 border rounded"
      />
      <button
        type="submit"
        className="rounded cursor-pointer p-2 transition-opacity bg-primary hover:opacity-75 text-background"
        disabled={loading}
      >
        {loading ? "Registering..." : "Register"}
      </button>
    </form>
  );
}
