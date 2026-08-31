import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Download, Plus, RotateCcw } from "lucide-react";

interface TableFilterBarProps {
    filterCategory: string;
    setFilterCategory: (val: string) => void;
    search: string;
    setSearch: (val: string) => void;
    startDate: string;
    setStartDate: (val: string) => void;
    endDate: string;
    setEndDate: (val: string) => void;
    selectedCount: number;
    onExport: () => void;
    onOpenCreateModal: () => void;
    onToday: () => void;
    onThisWeek: () => void;
    onThisMonth: () => void;
}

export function TableFilterBar({
    filterCategory,
    setFilterCategory,
    search,
    setSearch,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    selectedCount,
    onExport,
    onOpenCreateModal,
    onToday,
    onThisWeek,
    onThisMonth,
}: TableFilterBarProps) {
    return (
        <div className="rounded-xl border bg-card p-4 text-card-foreground shadow-sm space-y-3">
            <div className="flex flex-wrap justify-between items-center gap-3">
                <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
                    <Select
                        value={filterCategory}
                        onValueChange={(val) => setFilterCategory(val ?? "all")}
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Semua Kategori" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Kategori</SelectItem>
                            <SelectItem value="productName">Nama Barang</SelectItem>
                            <SelectItem value="productType">Tipe Barang</SelectItem>
                            <SelectItem value="productCode">Kode Barang</SelectItem>
                            <SelectItem value="customerName">Customer</SelectItem>
                            <SelectItem value="batch">Batch</SelectItem>
                            <SelectItem value="spk">SPK</SelectItem>
                            <SelectItem value="recipient">Recipient</SelectItem>
                            <SelectItem value="remarks">Keterangan</SelectItem>
                        </SelectContent>
                    </Select>

                    <Input
                        type="text"
                        placeholder="Ketik kata kunci pencarian..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-64"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onExport}
                        disabled={selectedCount === 0}
                        className="bg-[#85BC49] text-white hover:bg-[#80B547] hover:text-white border-none"
                    >
                        <Download className="mr-2 h-4 w-4" />
                        Export Excel ({selectedCount})
                    </Button>

                    <Button
                        type="button"
                        onClick={onOpenCreateModal}
                        className="bg-[#0E5EA2] hover:bg-[#0B4A82] text-white"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Tambah Data
                    </Button>
                </div>
            </div>

            <hr />

            <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Filter Tanggal Dibuat:
                    </span>

                    <div className="flex items-center gap-2 border rounded-lg px-3 py-1.5 bg-white">
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="bg-transparent text-sm focus:outline-none cursor-pointer"
                        />
                        <span className="text-muted-foreground font-medium">s/d</span>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="bg-transparent text-sm focus:outline-none cursor-pointer"
                        />
                    </div>

                    <div className="flex items-center gap-1.5 ml-1">
                        <Button size="sm" variant="secondary" onClick={onToday}>
                            Hari Ini
                        </Button>
                        <Button size="sm" variant="secondary" onClick={onThisWeek}>
                            Minggu Ini
                        </Button>
                        <Button size="sm" variant="secondary" onClick={onThisMonth}>
                            Bulan Ini
                        </Button>
                    </div>
                </div>

                {(startDate || endDate) && (
                    <Button
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
        </div>
    );
}