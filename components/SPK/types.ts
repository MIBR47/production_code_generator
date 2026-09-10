import { Decimal } from "@/src/generated/prisma/internal/prismaNamespace";

export interface SaleItemSerialized {
    id: number;
    quantity: number;
    unit_price: number | string;
    subtotal: number | string;
    tax_price: number | string;
    product: {
        product_name: string;
        product_type: string;
    };
    tax: {
        name: string;
        rate: Decimal;
    };
}

export interface SaleSerialized {
    id: number;
    no_spk: string | null;
    no_po: string | null;
    spk_date: string;
    expated_date: string;
    spk_type: string;
    sales_person: string | null;
    total_amount: number | string;
    ecatalog: string;
    status: string;
    remarks: string | null;
    customer: {
        name: string;
        contact?: string | null;
    };
    user?: {
        name: string;
    } | null;
    sale_items: SaleItemSerialized[];
}
export interface CustomerOption {
    id: number;
    name: string;
}

export interface ProductOption {
    id: number;
    product_name: string;
    price?: number | string | Decimal | null; // Menerima null/undefined jika belum ada harga
}

export interface TaxOption {
    id: number;
    name: string;
    rate: Decimal | number; // Menerima Decimal dari Prisma
}

export interface ItemRow {
    product_id: number | "";
    tax_id: number | "";
    quantity: number;
    unit_price: number | "";
}
