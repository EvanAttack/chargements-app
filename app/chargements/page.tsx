// app/chargements/page.tsx
"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import {useRouter, useSearchParams} from "next/navigation";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


export default function ChargementsPage() {

    type Chargement = {
        id: number;
        creation: string;
        clients: { nom: string };
        transports: { nom: string };
    };




    const router = useRouter();
    const [chargements, setChargements] = useState<Chargement[]>([]);

    const searchParams = useSearchParams();

    useEffect(() => {
        const successMessage = searchParams.get("success");
        if (successMessage) {
            toast.success(successMessage, {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });

        }
        fetchChargements();
    }, [searchParams]);

    async function fetchChargements() {
        const { data, error } = await supabase.from("chargements").select("id, clients(nom), transports(nom), creation").returns<Chargement[]>();

        if (error) console.error(error);
        else setChargements(data);
    }

    async function deleteChargement(id: number) {
        try {
            const {error} = await supabase
                .from("chargements")
                .delete()
                .eq("id", id);

            if (error) throw error;

            toast.success("Chargement supprimé avec succès !", {
                position: "top-right",
                autoClose: 3000,
            });
            await fetchChargements();

        } catch (err) {
            console.error("Erreur lors de la suppression:", err);
            toast.error(`Une erreur est survenue`, {
                position: "top-right",
                autoClose: 5000,
            });
        }
    }

    function back() {
        router.push("/chargements");
    }



    return (


            <div className="min-h-screen bg-gray-50 p-6">
                <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
                <div className="max-w-6xl mx-auto">
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-800">Liste des chargements</h1>
                        <Link
                            href="/nouveau"
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md"
                        >
                            Nouveau chargement
                        </Link>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-100">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transporteur</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                            {chargements.map((chargement) => (
                                <tr key={chargement.id} className="hover:bg-gray-50 transition duration-150">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{chargement.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{chargement.clients.nom}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{chargement.transports.nom}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{chargement.creation}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button
                                            onClick={() => router.push(`/chargements/${chargement.id}`)}
                                            className="text-indigo-600 hover:text-indigo-900 mr-2"
                                        >
                                            Voir
                                        </button>
                                        <button className="text-red-600 hover:text-red-900" onClick={() => deleteChargement(chargement.id)} >Supprimer</button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
    );
}
