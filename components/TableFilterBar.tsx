"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
} from "@/components/ui/select";
import {
    Download,
    Plus,
    RotateCcw,
    X,
} from "lucide-react";

export interface FilterCategoryOption {
    value: string;
    label: string;
}

export interface TableFilter {
    id: number;
    category: string;
    value: string;
}

interface TableFilterBarProps {
    categoryOptions: FilterCategoryOption[];

    // =========================
    // SINGLE FILTER (lama)
    // =========================
    filterCategory?: string;
    setFilterCategory?: (val: string) => void;

    search?: string;
    setSearch?: (val: string) => void;

    // =========================
    // MULTI FILTER (baru)
    // =========================
    filters?: TableFilter[];

    onAddFilter?: () => void;
    onRemoveFilter?: (id: number) => void;

    onCategoryChange?: (
        id: number,
        category: string
    ) => void;

    onValueChange?: (
        id: number,
        value: string
    ) => void;

    // =========================
    // SEARCH
    // =========================
    searchPlaceholder?: string;

    // =========================
    // DATE
    // =========================
    isDateSearch?: boolean;

    startDate?: string;
    setStartDate?: (val: string) => void;

    endDate?: string;
    setEndDate?: (val: string) => void;

    dateFilterLabel?: string;

    // =========================
    // ACTION
    // =========================
    selectedCount?: number;

    onExport?: () => void;
    exportLabel?: string;

    onOpenCreateModal?: () => void;
    createLabel?: string;

    // =========================
    // QUICK DATE
    // =========================
    onToday?: () => void;
    onThisWeek?: () => void;
    onThisMonth?: () => void;

    showQuickDateButtons?: boolean;
}

export function TableFilterBar({
    categoryOptions,

    // Single filter
    filterCategory,
    setFilterCategory,
    search = "",
    setSearch,

    // Multi filter
    filters,
    onAddFilter,
    onRemoveFilter,
    onCategoryChange,
    onValueChange,

    searchPlaceholder = "Ketik kata kunci pencarian...",
    isDateSearch = false,

    startDate,
    setStartDate,

    endDate,
    setEndDate,

    dateFilterLabel = "Filter Tanggal:",

    selectedCount = 0,

    onExport,
    exportLabel = "Export Excel",

    onOpenCreateModal,
    createLabel = "Tambah Data",

    onToday,
    onThisWeek,
    onThisMonth,

    showQuickDateButtons = true,
}: TableFilterBarProps) {

    const isMultiFilter = filters !== undefined;

    const selectedCategory = categoryOptions.find(
        (option) => option.value === filterCategory
    );

    return (
        <div className="rounded-xl border bg-card p-4 text-card-foreground shadow-sm space-y-3">

            {/* ========================= */}
            {/* FILTER + ACTION */}
            {/* ========================= */}
            <div className="flex flex-wrap justify-between items-start gap-3">

                <div className="flex-1 min-w-[280px] space-y-2">

                    {/* ========================= */}
                    {/* MULTI FILTER */}
                    {/* ========================= */}
                    {isMultiFilter ? (
                        <>
                            {filters.map((filter) => {
                                const selected = categoryOptions.find(
                                    (option) =>
                                        option.value === filter.category
                                );

                                const isDate =
                                    filter.category === "spk_date";

                                return (
                                    <div
                                        key={filter.id}
                                        className="flex flex-wrap items-center gap-2"
                                    >
                                        {/* CATEGORY */}
                                        <Select
                                            value={filter.category}
                                            onValueChange={(val) => {
                                                onCategoryChange?.(
                                                    filter.id,
                                                    val ??
                                                    categoryOptions[0]
                                                        ?.value ??
                                                    ""
                                                );
                                            }}
                                        >
                                            <SelectTrigger className="h-10 w-[220px] rounded-lg border-input bg-white text-black shadow-sm">
                                                <span className="truncate text-sm">
                                                    {selected?.label ??
                                                        "Pilih Kategori"}
                                                </span>
                                            </SelectTrigger>

                                            <SelectContent
                                                sideOffset={4}
                                                align="start"
                                                className="w-[220px] max-h-[320px] overflow-y-auto"
                                            >
                                                {categoryOptions.map((opt) => (
                                                    <SelectItem
                                                        key={opt.value}
                                                        value={opt.value}
                                                        className="h-9 text-sm cursor-pointer"
                                                    >
                                                        {opt.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>

                                        {/* VALUE */}
                                        <Input
                                            type={
                                                isDate
                                                    ? "date"
                                                    : "text"
                                            }
                                            placeholder={
                                                isDate
                                                    ? ""
                                                    : searchPlaceholder
                                            }
                                            value={filter.value}
                                            onChange={(e) =>
                                                onValueChange?.(
                                                    filter.id,
                                                    e.target.value
                                                )
                                            }
                                            className="w-64"
                                        />

                                        {/* REMOVE */}
                                        {filters.length > 1 && (
                                            <Button
                                                type="button"
                                                size="icon"
                                                variant="outline"
                                                onClick={() =>
                                                    onRemoveFilter?.(
                                                        filter.id
                                                    )
                                                }
                                                className="text-red-500 hover:text-red-600"
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                );
                            })}

                            {/* ADD FILTER */}
                            {onAddFilter && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={onAddFilter}
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Tambah Filter
                                </Button>
                            )}
                        </>
                    ) : (
                        /* ========================= */
                        /* SINGLE FILTER LAMA */
                        /* ========================= */
                        <div className="flex flex-wrap items-center gap-2">

                            <Select
                                value={filterCategory}
                                onValueChange={(val) => {
                                    setFilterCategory?.(
                                        val ??
                                        categoryOptions[0]
                                            ?.value ??
                                        "all"
                                    );

                                    setSearch?.("");
                                }}
                            >
                                <SelectTrigger className="h-10 w-[220px] rounded-lg border-input bg-white text-black shadow-sm">
                                    <span className="truncate text-sm">
                                        {selectedCategory?.label ?? "Pilih Kategori"}
                                    </span>
                                </SelectTrigger>

                                <SelectContent
                                    sideOffset={4}
                                    align="start"
                                    className="w-[220px] max-h-[320px] overflow-y-auto"
                                >
                                    {categoryOptions.map((opt) => (
                                        <SelectItem
                                            key={opt.value}
                                            value={opt.value}
                                            className="h-9 text-sm cursor-pointer"
                                        >
                                            {opt.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Input
                                type={
                                    isDateSearch
                                        ? "date"
                                        : "text"
                                }
                                placeholder={
                                    isDateSearch
                                        ? ""
                                        : searchPlaceholder
                                }
                                value={search}
                                onChange={(e) =>
                                    setSearch?.(e.target.value)
                                }
                                className="w-64"
                            />
                        </div>
                    )}
                </div>

                {/* ========================= */}
                {/* ACTION BUTTONS */}
                {/* ========================= */}
                <div className="flex items-center gap-2">

                    {onExport && (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onExport}
                            disabled={selectedCount === 0}
                            className="bg-[#85BC49] text-white hover:bg-[#80B547] hover:text-white border-none"
                        >
                            <Download className="mr-2 h-4 w-4" />

                            {exportLabel}

                            {selectedCount > 0 &&
                                ` (${selectedCount})`}
                        </Button>
                    )}

                    {onOpenCreateModal && (
                        <Button
                            type="button"
                            onClick={onOpenCreateModal}
                            className="bg-[#0E5EA2] hover:bg-[#0B4A82] text-white"
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            {createLabel}
                        </Button>
                    )}
                </div>
            </div>

            {/* ========================= */}
            {/* DATE RANGE */}
            {/* ========================= */}
            {setStartDate && setEndDate && (
                <>
                    <hr />

                    <div className="flex flex-wrap items-center justify-between gap-3 text-sm">

                        <div className="flex flex-wrap items-center gap-2">

                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                {dateFilterLabel}
                            </span>

                            <div className="flex items-center gap-2 border rounded-lg px-3 py-1.5 bg-white">

                                <input
                                    type="date"
                                    value={startDate || ""}
                                    onChange={(e) =>
                                        setStartDate(
                                            e.target.value
                                        )
                                    }
                                    className="bg-transparent text-sm focus:outline-none cursor-pointer"
                                />

                                <span className="text-muted-foreground font-medium">
                                    s/d
                                </span>

                                <input
                                    type="date"
                                    value={endDate || ""}
                                    onChange={(e) =>
                                        setEndDate(
                                            e.target.value
                                        )
                                    }
                                    className="bg-transparent text-sm focus:outline-none cursor-pointer"
                                />
                            </div>

                            {/* QUICK DATE */}
                            {showQuickDateButtons &&
                                (onToday ||
                                    onThisWeek ||
                                    onThisMonth) && (
                                    <div className="flex items-center gap-1.5 ml-1">

                                        {onToday && (
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="secondary"
                                                onClick={
                                                    onToday
                                                }
                                            >
                                                Hari Ini
                                            </Button>
                                        )}

                                        {onThisWeek && (
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="secondary"
                                                onClick={
                                                    onThisWeek
                                                }
                                            >
                                                Minggu Ini
                                            </Button>
                                        )}

                                        {onThisMonth && (
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="secondary"
                                                onClick={
                                                    onThisMonth
                                                }
                                            >
                                                Bulan Ini
                                            </Button>
                                        )}
                                    </div>
                                )}
                        </div>

                        {/* RESET DATE */}
                        {(startDate || endDate) && (
                            <Button
                                type="button"
                                size="sm"
                                variant="destructive"
                                onClick={() => {
                                    setStartDate("");
                                    setEndDate("");
                                }}
                            >
                                <RotateCcw className="mr-1 h-3 w-3" />
                                Reset Filter
                            </Button>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}