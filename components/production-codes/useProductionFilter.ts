import { useState, useMemo, useEffect } from "react";
import { DraftItem } from "./types";

export function useProductionFilter(data: any[], draftItems: DraftItem[]) {
    const [search, setSearch] = useState("");
    const [filterCategory, setFilterCategory] = useState("all");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(20);

    useEffect(() => {
        setCurrentPage(1);
    }, [search, filterCategory, startDate, endDate, itemsPerPage]);

    const combinedAndSortedData = useMemo(() => {
        const query = search.toLowerCase().trim();

        // Helper untuk memformat tanggal ke ISO (YYYY-MM-DD)
        const formatDateToISO = (dateStr: string | Date | null | undefined) => {
            if (!dateStr) return "";
            try {
                return new Date(dateStr).toISOString().split("T")[0];
            } catch {
                return String(dateStr);
            }
        };

        const isWithinCreatedRange = (createdAtStr: string | Date | null | undefined) => {
            if (!startDate && !endDate) return true;
            if (!createdAtStr) return false;

            const dateVal = formatDateToISO(createdAtStr);
            if (startDate && dateVal < startDate) return false;
            if (endDate && dateVal > endDate) return false;
            return true;
        };

        const matchDbItem = (item: any) => {
            if (!isWithinCreatedRange(item.created_at)) return false;
            if (!query) return true;

            const outCodeDateStr = formatDateToISO(item.out_code_date);

            const fields: Record<string, string | undefined> = {
                productName: item.product?.product_name,
                productType: item.product?.product_type,
                productCode: item.product_code?.product_code,
                customerName: item.customer?.name,
                batch: item.batch,
                spk: item.spk,
                recipient: item.item_code_recipient || item.recipient,
                remarks: item.remarks,
                status: item.status ?? "Tersimpan",
                out_code_date: outCodeDateStr,
            };

            if (filterCategory === "all") {
                return Object.values(fields).some((val) =>
                    val?.toLowerCase().includes(query)
                );
            }

            return fields[filterCategory]?.toLowerCase().includes(query) ?? false;
        };

        const matchDraftItem = (item: DraftItem) => {
            if (!query) return true;

            const outCodeDateStr = formatDateToISO(item.outDate);

            const fields: Record<string, string | undefined> = {
                productName: item.productName,
                productType: item.productType,
                productCode: item.productCode,
                customerName: item.customerName,
                batch: item.batch,
                spk: item.spk,
                recipient: item.recipient,
                remarks: item.remarks,
                status: "Draft",
                out_code_date: outCodeDateStr,
            };

            if (filterCategory === "all") {
                return Object.values(fields).some((val) =>
                    val?.toLowerCase().includes(query)
                );
            }

            return fields[filterCategory]?.toLowerCase().includes(query) ?? false;
        };

        const filteredDb = data.filter(matchDbItem);
        const filteredDrafts = draftItems.filter(matchDraftItem);

        return [
            ...filteredDb.map((item) => ({ ...item, isDraft: false })),
            ...filteredDrafts,
        ].sort((a, b) => {
            const prodA = a.isDraft ? a.productId : a.product?.id;
            const prodB = b.isDraft ? b.productId : b.product?.id;
            if (prodA !== prodB) return prodA - prodB;

            const codeA = a.isDraft
                ? a.productCodeId
                : a.product_code?.id || a.product_code_id;
            const codeB = b.isDraft
                ? b.productCodeId
                : b.product_code?.id || b.product_code_id;
            if (codeA !== codeB) return codeA - codeB;

            const numA = a.isDraft
                ? a.productionNumber
                : Number(a.production_number) || 0;
            const numB = b.isDraft
                ? b.productionNumber
                : Number(b.production_number) || 0;
            return numA - numB;
        });
    }, [data, draftItems, search, filterCategory, startDate, endDate]);

    const totalItems = combinedAndSortedData.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return combinedAndSortedData.slice(start, start + itemsPerPage);
    }, [combinedAndSortedData, currentPage, itemsPerPage]);

    // Quick Date Filter Presets
    const setTodayFilter = () => {
        const today = new Date().toISOString().split("T")[0];
        setStartDate(today);
        setEndDate(today);
    };

    const setThisWeekFilter = () => {
        const now = new Date();
        const dayOfWeek = now.getDay();
        const distanceToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        const monday = new Date(now);
        monday.setDate(now.getDate() - distanceToMonday);
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);

        setStartDate(monday.toISOString().split("T")[0]);
        setEndDate(sunday.toISOString().split("T")[0]);
    };

    const setThisMonthFilter = () => {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
            .toISOString()
            .split("T")[0];
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
            .toISOString()
            .split("T")[0];
        setStartDate(firstDay);
        setEndDate(lastDay);
    };

    return {
        search,
        setSearch,
        filterCategory,
        setFilterCategory,
        startDate,
        setStartDate,
        endDate,
        setEndDate,
        currentPage,
        setCurrentPage,
        itemsPerPage,
        setItemsPerPage,
        paginatedData,
        combinedAndSortedData,
        totalItems,
        totalPages,
        setTodayFilter,
        setThisWeekFilter,
        setThisMonthFilter,
    };
}