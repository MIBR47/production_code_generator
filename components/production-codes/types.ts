import { Customer, Prisma } from "@/src/generated/prisma/client";

// Re-export tipe Customer agar bisa di-import langsung dari types.ts
export type { Customer };

// ==========================================
// 1. Prisma Payload Types (Relasi Spesifik)
// ==========================================

/**
 * Tipe Product lengkap dengan relasi array `product_codes`
 */
export type ProductWithCodes = Prisma.ProductGetPayload<{
    include: {
        product_codes: true;
    };
}>;

/**
 * Tipe Production_code lengkap dengan seluruh relasinya
 */
export type ProductionCodeWithRelations = Prisma.Production_codeGetPayload<{
    include: {
        product: true;
        product_code: true;
        customer: true;
        user: true;
    };
}>;

// ==========================================
// 2. Draft Item
// ==========================================

export interface DraftItem {
    tempId: string;
    productId: number;
    productName: string;
    productType: string;
    productCodeId: number;
    productCode: string;
    customerId: number;
    customerName: string;
    productionNumber: number;
    batch: string;
    spk: string;
    remarks: string;
    outDate: string;
    recipient: string;
    isDraft: boolean;
}

// ==========================================
// 3. Main Table Props (Bebas 'any')
// ==========================================

export interface ProductionTableProps {
    data: ProductionCodeWithRelations[];
    products: ProductWithCodes[];
    customers: Customer[];
}