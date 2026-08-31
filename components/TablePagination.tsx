import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface TablePaginationProps {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    setItemsPerPage: (num: number) => void;
    setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
}

export function TablePagination({
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    setItemsPerPage,
    setCurrentPage,
}: TablePaginationProps) {
    return (
        <div className="flex flex-wrap items-center justify-between border-t bg-muted/40 px-4 py-3 gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
                <span>Tampilkan:</span>
                <Select
                    value={String(itemsPerPage)}
                    onValueChange={(val) => setItemsPerPage(Number(val))}
                >
                    <SelectTrigger className="w-[70px] h-8">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="20">20</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                </Select>
                <span>data per halaman</span>
            </div>

            <div className="text-xs font-medium">
                {totalItems > 0 ? (
                    <>
                        Menampilkan{" "}
                        <span className="font-semibold text-foreground">
                            {(currentPage - 1) * itemsPerPage + 1}
                        </span>{" "}
                        -{" "}
                        <span className="font-semibold text-foreground">
                            {Math.min(currentPage * itemsPerPage, totalItems)}
                        </span>{" "}
                        dari <span className="font-semibold text-foreground">{totalItems}</span> data
                    </>
                ) : (
                    "Tidak ada data"
                )}
            </div>

            <div className="flex items-center gap-1.5">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                >
                    Sebelumnya
                </Button>

                <div className="flex items-center gap-1 px-2 text-xs">
                    <span className="font-semibold text-foreground">{currentPage}</span>
                    <span>/</span>
                    <span>{totalPages}</span>
                </div>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages || totalPages === 0}
                >
                    Berikutnya
                </Button>
            </div>
        </div>
    );
}