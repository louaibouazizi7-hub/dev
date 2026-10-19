import { useEffect, useState } from "react";
import { api } from "./api.js";

const VIDE = { nom: "", description: "", prix: "", quantite: "", categorie: "" };

export default function App() {
  const [produits, setProduits] = useState([]);
  const [recherche, setRecherche] = useState("");
  const [form, setForm] = useState(VIDE);
  const [editId, setEditId] = useState(null); // null = ajout, sinon modification
  const [detail, setDetail] = useState(null);
  const [erreur, setErreur] = useState("");

  async function charger(q = recherche) {
    try {
      setErreur("");
      setProduits(await api.lister(q));
    } catch {
      setErreur(`Impossible de joindre le backend (${api.url}). Est-il lancé ?`);
    }
  }

  useEffect(() => { charger(""); }, []);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function envoyer(e) {
    e.preventDefault();
    const data = { ...form, prix: Number(form.prix), quantite: Number(form.quantite || 0) };
    try {
      if (editId) await api.modifier(editId, data);
      else await api.ajouter(data);
      annuler();
      charger();
    } catch (err) {
      setErreur(err.message);
    }
  }

  function annuler() {
    setForm(VIDE);
    setEditId(null);
  }

  function modifier(p) {
    setEditId(p.id);
    setForm({ nom: p.nom, description: p.description, prix: p.prix, quantite: p.quantite, categorie: p.categorie });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function supprimer(p) {
    if (!confirm(`Supprimer « ${p.nom} » ?`)) return;
    try {
      await api.supprimer(p.id);
      if (detail?.id === p.id) setDetail(null);
      charger();
    } catch (err) {
      setErreur(err.message);
    }
  }

  async function voir(id) {
    try {
      setDetail(await api.consulter(id));
    } catch (err) {
      setErreur(err.message);
    }
  }

  return (
    <div className="page">
      <header>
        <h1>Passion Projet <small>· gestion des produits</small></h1>
        <div className="ports">
          <span>Frontend :3000</span>
          <span>Backend :8000</span>
          <span>MongoDB :27017</span>
        </div>
      </header>

      {erreur && <div className="erreur">{erreur}</div>}

      <section className="carte">
        <h2>{editId ? "Modifier le produit" : "Ajouter un produit"}</h2>
        <form onSubmit={envoyer} className="form">
          <input name="nom" placeholder="Nom *" value={form.nom} onChange={change} required />
          <input name="categorie" placeholder="Catégorie" value={form.categorie} onChange={change} />
          <input name="prix" type="number" step="0.01" min="0" placeholder="Prix *" value={form.prix} onChange={change} required />
          <input name="quantite" type="number" min="0" placeholder="Quantité" value={form.quantite} onChange={change} />
          <textarea name="description" placeholder="Description" value={form.description} onChange={change} />
          <div className="actions">
            <button type="submit" className="primaire">{editId ? "Enregistrer" : "Ajouter"}</button>
            {editId && <button type="button" onClick={annuler}>Annuler</button>}
          </div>
        </form>
      </section>

      {detail && (
        <section className="carte detail">
          <h2>{detail.nom}</h2>
          <p>{detail.description || "Pas de description."}</p>
          <p><b>Prix :</b> {detail.prix} DT · <b>Stock :</b> {detail.quantite} · <b>Catégorie :</b> {detail.categorie || "—"}</p>
          <small>id : {detail.id}</small><br />
          <button onClick={() => setDetail(null)}>Fermer</button>
        </section>
      )}

      <section className="carte">
        <div className="entete">
          <h2>Liste des produits ({produits.length})</h2>
          <input
            placeholder="Rechercher…"
            value={recherche}
            onChange={(e) => { setRecherche(e.target.value); charger(e.target.value); }}
          />
        </div>
        <div className="tableau">
          <table>
            <thead>
              <tr><th>Nom</th><th>Catégorie</th><th>Prix</th><th>Stock</th><th></th></tr>
            </thead>
            <tbody>
              {produits.map((p) => (
                <tr key={p.id}>
                  <td>{p.nom}</td>
                  <td>{p.categorie || "—"}</td>
                  <td>{p.prix} DT</td>
                  <td>{p.quantite}</td>
                  <td className="actions">
                    <button onClick={() => voir(p.id)}>Voir</button>
                    <button onClick={() => modifier(p)}>Modifier</button>
                    <button className="danger" onClick={() => supprimer(p)}>Supprimer</button>
                  </td>
                </tr>
              ))}
              {produits.length === 0 && (
                <tr><td colSpan="5" className="vide">Aucun produit.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
