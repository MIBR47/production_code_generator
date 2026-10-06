export type SupplierSerialized = {
    id: number;
    name: string;
    address: string | null;
    contact: string | null;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
};

export type CreateSupplierInput = {
    name: string;
    address: string | null;
    contact: string | null;
};

export type UpdateSupplierInput = {
    id: number;
    name: string;
    address: string | null;
    contact: string | null;
};

export type SupplierActionResult = {
    success: boolean;
    message: string;
    supplier?: SupplierSerialized;
};