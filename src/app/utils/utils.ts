export function getLowestPriceVariant(variants: any[]): any | null {
  if (!Array.isArray(variants) || variants.length === 0) return null;

  return variants.reduce((min, curr) =>
    parseFloat(curr.price) < parseFloat(min.price) ? curr : min
  );
}


export function toggleFavourite(
  item: any,
  userId: any,
  apiService: any,
  type: 'vendor' | 'product'
): void {
  // flip state immediately for UI
  item.is_favourite = item.is_favourite === 1 ? 0 : 1;

  const favnum = type === 'vendor' ? 1 : 0;
  const id = type === 'vendor' ? item.vendor_id : item.product_id ?? item.id;

  const apiCall =
    item.is_favourite === 1
      ? apiService.addToFavourite(userId, id, favnum, type)
      : apiService.removeToFavourite(userId, id, favnum, type);

  apiCall.subscribe(
    (res: any) => {
      console.log(
        `${item.is_favourite === 1 ? '✅ Mark' : '❌ Unmark'} ${type} Favourite Response:`,
        res
      );
    },
    (err: any) => {
      console.error(`❌ Error updating ${type} favourite:`, err);
      // rollback if failed
      item.is_favourite = item.is_favourite === 1 ? 0 : 1;
    }
  );
}

