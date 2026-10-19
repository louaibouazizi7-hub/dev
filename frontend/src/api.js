const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

async function call(path, options) {
  const res = await fetch(API + path, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      typeof err.detail === "string" ? err.detail : "Erreur " + res.status
    );
  }
  return res.status === 204 ? null : res.json();
}

export const api = {
  url: API,
  lister: (q = "") => call("/produits" + (q ? `?q=${encodeURIComponent(q)}` : "")),
  consulter: (id) => call(`/produits/${id}`),
  ajouter: (p) => call("/produits", { method: "POST", body: JSON.stringify(p) }),
  modifier: (id, p) => call(`/produits/${id}`, { method: "PUT", body: JSON.stringify(p) }),
  supprimer: (id) => call(`/produits/${id}`, { method: "DELETE" }),
};
