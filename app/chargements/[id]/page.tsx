"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import {motion} from "framer-motion";



type Client = {
    nom: string;
};

type Transporteur = {
    nom: string;
};

type ChargementData = {
    id: number;
    creation: string;
    client_id: {
        nom: string;
    };
    transporteur_id: {
        nom: string;
    };
};

type ProduitData = {
    produit_id: {
        id: number;
        nom: string;
    };
    quantite: number;
};

type ChargementDetails = {
    id: number;
    client: string;
    transporteur: string;
    date: string;
    produits: {
        id: number;
        nom: string;
        quantite: number;
    }[];
};


/**
 * Composant affichant les détails d'un chargement spécifique via son id
 * @component
 * @example
 */
export default function ChargementDetails() {
    const router = useRouter();
    const { id } = useParams<{ id: string }>();
    const [chargement, setChargement] = useState<ChargementDetails | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        fetchChargementDetails(Number(id));
    }, [id]);




    /**
     * Récupère les détails d'un chargement et ses produits associés depuis Supabase
     * @async
     * @param {number} chargementId - Identifiant du chargement à récupérer
     * @throws {Error} En cas d'erreur de récupération des données
     */
    async function fetchChargementDetails(chargementId: number) {
        try {
            setLoading(true);

            // Récupère les informations de base du chargement
            const { data: chargementData, error: chargementError } = await supabase
                .from("chargements")
                .select("id, creation, client_id(nom), transporteur_id(nom)")
                .eq("id", chargementId)
                .single<ChargementData>();

            if (chargementError) throw chargementError;


            // Récupère les produits associés au chargement
            const { data: produitsData, error: produitsError } = await supabase
                .from("chargement_produits")
                .select("produit_id(id, nom), quantite")
                .eq("chargement_id", chargementId)
                .returns<ProduitData[]>();

            if (produitsError) throw produitsError;


            // Formate les données pour l'affichage
            const details: ChargementDetails = {
                id: chargementData.id,
                client: chargementData.client_id.nom,
                transporteur: chargementData.transporteur_id.nom,
                date: new Date(chargementData.creation).toLocaleDateString("fr-FR"),
                produits: produitsData.map((p) => ({
                    id: p.produit_id.id,
                    nom: p.produit_id.nom,
                    quantite: p.quantite,
                })),
            };

            setChargement(details);
        } catch (err) {
            console.error("Erreur:", err);
            router.push("/chargements");
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!chargement) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <p className="text-gray-600">Chargement non trouvé.</p>
            </div>
        );
    }

    const produitVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0 },
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen bg-gray-50 p-6"
        >
            <motion.div className="max-w-4xl mx-auto">
                {/* En-tête */}
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-xl shadow-lg p-6 mb-8"
                >
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800 mb-2">
                                Chargement #{chargement.id}
                            </h1>
                            <p className="text-gray-600">
                                Créé le <span className="font-medium">{chargement.date}</span>
                            </p>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                            onClick={() => router.push(`/chargements`)}
                        >
                            Retour
                        </motion.button>
                    </div>

                    {/* Infos client/transporteur */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-sm font-medium text-gray-500 mb-1">Client</p>
                            <p className="text-lg font-semibold text-gray-800">{chargement.client}</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-sm font-medium text-gray-500 mb-1">Transporteur</p>
                            <p className="text-lg font-semibold text-gray-800">{chargement.transporteur}</p>
                        </div>
                    </div>
                </motion.div>

                {/* Liste des produits */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-xl shadow-lg p-6"
                >
                    <motion.h2
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-xl font-bold text-gray-800 mb-6"
                    >
                        Produits
                    </motion.h2>
                    <div className="space-y-6">
                        {chargement.produits.map((produit, index) => (
                            <motion.div
                                key={produit.id}
                                variants={produitVariants}
                                initial="hidden"
                                animate="visible"
                                transition={{
                                    delay: 0.1 * index,
                                    duration: 0.5,
                                    ease: "easeOut"
                                }}
                                className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-gray-50 rounded-lg"
                            >
                                {/* Image du produit */}
                                <div className="relative w-32 h-32 flex-shrink-0">
                                    <Image
                                        src={`/images/${produit.nom.toLowerCase().replace(/\s+/g, "-")}.jpg`}
                                        alt={produit.nom}
                                        fill
                                        className="object-contain rounded-lg"
                                        onError={(e) => {
                                            e.currentTarget.src = "/images/placeholder.png";
                                        }}
                                    />
                                </div>

                                {/* Infos du produit */}
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-1">{produit.nom}</h3>
                                    <p className="text-gray-600">
                                        Quantité: <span className="font-medium">{produit.quantite}</span>
                                    </p>
                                </div>

                                {/* Badge de quantité */}
                                <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full font-bold text-lg">
                                    {produit.quantite}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </motion.div>
        </motion.div>
    );
}
