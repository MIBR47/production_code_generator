export const formatDateIndonesia = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
};

export const getNextProductionNumber = (
    productId: number,
    productCodeId: number,
    data: any[],
    draftItems: any[]
) => {
    const dbNumbers = data
        .filter(
            (item) =>
                item.product?.id === productId &&
                (item.product_code?.id === productCodeId ||
                    item.product_code_id === productCodeId)
        )
        .map((item) => Number(item.production_number) || 0);

    const draftNumbers = draftItems
        .filter(
            (draft) =>
                draft.productId === productId && draft.productCodeId === productCodeId
        )
        .map((draft) => draft.productionNumber || 0);

    const allNumbers = [...dbNumbers, ...draftNumbers];
    return (allNumbers.length > 0 ? Math.max(...allNumbers) : 0) + 1;
};