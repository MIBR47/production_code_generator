"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";

interface EditableCellProps {
    value: string | number;
    type?: "text" | "number" | "date";
    className?: string;
    onSave: (newValue: string | number) => Promise<void>;
}

export function EditableCell({
    value,
    type = "text",
    className = "",
    onSave,
}: EditableCellProps) {
    const [currentValue, setCurrentValue] = useState(value);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setCurrentValue(value);
    }, [value]);

    const handleBlurOrSubmit = async () => {
        if (currentValue === value) return; // Tidak ada perubahan
        setIsLoading(true);
        try {
            await onSave(currentValue);
        } catch (err) {
            setCurrentValue(value); // Rollback jika error
        } finally {
            setIsLoading(false);
        }
    };
    const formatCurrency = (amount: number | string) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0,
        }).format(Number(amount));
    };

    return (
        <div className="relative group">
            <Input
                type={type}
                value={currentValue}
                disabled={isLoading}
                onChange={(e) => setCurrentValue(e.target.value)}
                onBlur={handleBlurOrSubmit}
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        e.currentTarget.blur();
                    }
                }}
                className={`h-8 px-2 py-1 text-xs transition-all border-transparent hover:border-slate-300 focus:border-[#0E5EA2] focus:bg-white bg-transparent ${isLoading ? "opacity-50" : ""
                    } ${className}`}
            />
        </div>
    );
}