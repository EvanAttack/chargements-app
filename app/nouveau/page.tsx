"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {motion} from "framer-motion";




/**
 * Composant pour la création d'un nouveau chargement.
 * Permet de sélectionner un client, un transporteur et une liste de produits avec leurs quantités.
 * @component
 * @example
 * return <NouveauChargement />
 */
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


    /**
     * Récupère les listes de clients, transporteurs et produits depuis la base de données.
     * @async
     */
    async function fetchData() {
        const { data: c } = await supabase.from("clients").select("*");
        const { data: t } = await supabase.from("transports").select("*");
        const { data: p } = await supabase.from("produits").select("*");

        setClients(c || []);
        setTransports(t || []);
        setProduitsList(p || []);
    }

    /**
     * Ajoute un nouveau produit au formulaire.
     */
    function addProduit() {
        setProduits([...produits, { produit_id: "", quantite: 1 }]);
    }


    /**
     * Supprime un produit du formulaire.
     * @param {number} index - id du produit à supprimer
     */
    function removeProduit(index: number) {
        const updatedProduits = produits.filter((_, i) => i !== index);
        setProduits(updatedProduits);
    }


    /**
     * Met à jour un produit dans le formulaire.
     */
    function updateProduit(index: number, key: string, value: any) {
        const updated = [...produits];
        // @ts-ignore
        updated[index][key] = value;
        setProduits(updated);
    }


    /**
     * Soumet le formulaire pour créer un nouveau chargement.
     * @async
     * @throws {Error} En cas d'erreur lors de la création du chargement ou des produits associés
     */
    async function submit() {
        try {
            const { data, error } = await supabase.from("chargements")
                .insert({
                    client_id: clientId,
                    transporteur_id: transporteurId,
                    creation: new Date().toISOString()
                })
                .select("id")
                .single();

            if (error) {
                throw new Error(error.message);
            }

            const chargementId = data.id;
            for (const p of produits) {
                const { error: produitError } = await supabase.from("chargement_produits").insert({
                    chargement_id: chargementId,
                    produit_id: p.produit_id,
                    quantite: p.quantite,
                });
                if (produitError) throw new Error(produitError.message);
            }

            toast.success("Chargement créé avec succès !", {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });

            setTimeout(() => {
                router.push("/chargements");
            }, 3000);

        } catch (err) {
            toast.error("Une erreur est survenue", {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
        }
    }

    /**
     * Redirige vers la liste des chargements.
     */
    async function back() {
        router.push("/chargements");
    }

    return (
            <div className="min-h-screen bg-gray-50 p-6">
                <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
                <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-8">Nouveau chargement</h1>

                    <div className="space-y-6">
                        {/* Client */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
                            <select
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-800"
                                onChange={(e) => setClientId(e.target.value)}
                                value={clientId}
                            >
                                <option value="">Choisir un client</option>
                                {clients.map((c) => (
                                    <option key={c.id} value={c.id}>{c.nom}</option>
                                ))}
                            </select>
                        </div>

                        {/* Transporteur */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Transporteur</label>
                            <select
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-800"
                                onChange={(e) => setTransporteurId(e.target.value)}
                                value={transporteurId}
                            >
                                <option value="">Choisir un transporteur</option>
                                {transports.map((t) => (
                                    <option key={t.id} value={t.id}>
                                        {t.nom}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Produits */}
                        <div>
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">Produits</h2>
                            {produits.map((p, i) => (
                                <div key={i} className="flex items-center space-x-4 mb-4">
                                    <select
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-800"
                                        onChange={(e) => updateProduit(i, "produit_id", e.target.value)}
                                        value={p.produit_id}
                                    >
                                        <option value="">Choisir un produit</option>
                                        {produitsList.map((prod) => (
                                            <option key={prod.id} value={prod.id}>
                                                {prod.nom}
                                            </option>
                                        ))}
                                    </select>
                                    <input
                                        type="number"
                                        className="w-20 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-800"
                                        value={p.quantite}
                                        onChange={(e) => updateProduit(i, "quantite", e.target.value)}
                                        min="1"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeProduit(i)}
                                        className="text-red-500 hover:text-red-700 font-medium"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={addProduit}
                                className="flex items-center text-blue-600 hover:text-blue-800 font-medium"
                            >
                                Ajouter un produit
                            </button>

                        </div>

                        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                type="button"
                                onClick={back}
                                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                            >
                                Annuler
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                type="button"
                                onClick={submit}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition"
                            >
                                Enregistrer
                            </motion.button>
                        </div>
                    </div>
                </div>
            </div>
    );
}
