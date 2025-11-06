"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function NouveauChargement() {

    const router = useRouter();

    type Client = { id: number; nom: string }
    type Transporteur = { id: number; nom: string }
    type Produit = { id: number; nom: string }

    const [clients, setClients] = useState<Client[]>([]);
    const [transports, setTransports] = useState<Transporteur[]>([]);
    const [produitsList, setProduitsList] = useState<Produit[]>([]);

    const [clientId, setClientId] = useState("");
    const [transporteurId, setTransporteurId] = useState("");

    const [produits, setProduits] = useState([
        { produit_id: "", quantite: 1 }
    ]);






    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        const { data: c } = await supabase.from("clients").select("*");
        const { data: t } = await supabase.from("transports").select("*");
        const { data: p } = await supabase.from("produits").select("*");

        setClients(c || []);
        setTransports(t || []);
        setProduitsList(p || []);
    }

    function addProduit() {
        setProduits([...produits, { produit_id: "", quantite: 1 }]);
    }

    function updateProduit(index: number, key: string, value: any) {
        const updated = [...produits];
        // @ts-ignore
        updated[index][key] = value;
        setProduits(updated);
    }

    async function submit() {
        const { data, error } = await supabase.from("chargements")
            .insert({
                client_id: clientId,
                transporteur_id: transporteurId,
                creation: new Date().toISOString()
            })
            .select("id")
            .single();

        if (error) {
            console.error("Erreur :", error);
            return alert(error.message);
        }
        const chargementId = data.id;
        for (const p of produits) {
            await supabase.from("chargement_produits").insert({
                chargement_id: chargementId,
                produit_id: p.produit_id,
                quantite: p.quantite,
            });
        }
        alert("Sauvegardé !");
        router.push("/chargements");
    }

    return (
        <div>
            <h1>Nouveau chargement</h1>

            <div>
                <label>Client :</label>
                <select onChange={(e) => setClientId(e.target.value)}>
                    <option>Choisir...</option>
                    {clients.map((c: any) => (
                        <option key={c.id} value={c.id}>{c.nom}</option>
                    ))}
                </select>
            </div>

            <div>
                <label>Transporteur :</label>
                <select onChange={(e) => setTransporteurId(e.target.value)}>
                    <option>Choisir...</option>
                    {transports.map((t: any) => (
                        <option key={t.id} value={t.id}>{t.nom}</option>
                    ))}
                </select>
            </div>

            <h2>Produits</h2>

            {produits.map((p, i) => (
                <div key={i}>
                    <select onChange={(e) => updateProduit(i, "produit_id", e.target.value)}>
                        <option>Choisir un produit</option>
                        {produitsList.map((prod: any) => (
                            <option key={prod.id} value={prod.id}>{prod.nom}</option>
                        ))}
                    </select>
                    <input type="number" value={p.quantite} onChange={(e) => updateProduit(i, "quantite", e.target.value)}/>
                </div>
            ))}

            <button onClick={addProduit}>
                Ajouter un produit
            </button>

            <button onClick={submit}>
                Enregistrer
            </button>
        </div>
    );
}
