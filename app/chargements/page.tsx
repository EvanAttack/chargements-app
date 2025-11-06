// app/chargements/page.tsx
"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function ChargementsPage() {

    type Chargement = {
        id: number;
        creation: string;
        clients: { nom: string }[];
        transports: { nom: string }[];
    };




    const [chargements, setChargements] = useState<Chargement[]>([]);

    useEffect(() => {
        fetchChargements();
    });

    async function fetchChargements() {
        const { data, error } = await supabase.from("chargements").select("id, clients(nom), transports(nom), creation");

        if (error) console.error(error);
        else setChargements(data);
    }

    return (
        <div>
            <h1 >Liste des chargements</h1>

            <Link
                href="/nouveau"
            >
                Nouveau chargement
            </Link>

            <table>
                <thead>
                <tr>
                    <th>ID</th>
                    <th>Client</th>
                    <th>Transporteur</th>
                    <th>Date</th>
                </tr>
                </thead>
                <tbody>
                {chargements.map((c: any) => (
                    <tr key={c.id}>
                        <td>{c.id}</td>
                        <td>{c.clients.nom}</td>
                        <td>{c.transports.nom}</td>
                        <td>{c.creation}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}
