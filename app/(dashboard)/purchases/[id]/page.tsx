"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { AlertCircle, ArrowLeft, Loader2 } from "lucide-react";
import { getPurchaseOrderById } from "@/actions/purchases";
import { PurchaseOrderSerialized } from "@/components/purchases/types";
import PurchaseDetailPage from "@/components/purchases/PurchaseDetailPage";
// import PurchaseDetailPage from "@/components/purchases/PurchaseDetailPage";

export default function PurchaseOrderRoutePage() {
    const params = useParams<{ id: string }>();
    const id = Number(params.id);
    const [purchaseOrder, setPurchaseOrder] = useState<PurchaseOrderSerialized | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        const loadPurchaseOrder = async () => {
            if (!Number.isInteger(id) || id <= 0) {
                setError("Nomor Purchase Order tidak valid.");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);
                const result = await getPurchaseOrderById(id);
                if (!cancelled) setPurchaseOrder(result);
            } catch (error) {
                console.error("Error loading Purchase Order:", error);
                if (!cancelled) setError("Gagal memuat detail Purchase Order.");
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        loadPurchaseOrder();
        return () => { cancelled = true; };
    }, [id]);

    if (loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center gap-3 text-sm text-slate-500">
                <Loader2 className="h-5 w-5 animate-spin text-[#0E5EA2]" />
                Memuat Purchase Order...
            </div>
        );
    }

    if (error || !purchaseOrder) {
        return (
            <main className="min-h-screen bg-slate-50 p-6">
                <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                    <AlertCircle className="mx-auto mb-3 h-9 w-9 text-amber-500" />
                    <h1 className="text-lg font-semibold text-slate-900">Purchase Order tidak ditemukan</h1>
                    <p className="mt-1 text-sm text-slate-500">{error || "Data PO yang kamu cari tidak tersedia."}</p>
                    <Link href="/purchases" className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#0E5EA2] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-sky-800">
                        <ArrowLeft className="h-4 w-4" />
                        Kembali ke Purchases
                    </Link>
                </div>
            </main>
        );
    }

    return <PurchaseDetailPage purchaseOrder={purchaseOrder} />;
}
