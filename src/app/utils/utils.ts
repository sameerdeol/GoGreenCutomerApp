export function getLowestPriceVariant(variants: any[]): any | null {
  if (!Array.isArray(variants) || variants.length === 0) return null;

  return variants.reduce((min, curr) =>
    parseFloat(curr.price) < parseFloat(min.price) ? curr : min
  );
}

export function toggleFavoritefeatured(vendor: any, userId: any, apiService: any): void {
  vendor.is_favourite = vendor.is_favourite === 1 ? 0 : 1;

  if (vendor.is_favourite === 1) {
    markfavourite(userId, vendor.vendor_id, apiService);
  } else {
    unmarkfavourite(userId, vendor.vendor_id, apiService);
  }
}

export function markfavourite(userId: any, vendorId: any, apiService: any) {
  const favnum = 1;
  apiService.addToFavouriteVendors(userId, vendorId, favnum).subscribe((response: any) => {
    if (response) {
      console.log('Mark Favorite API Response-', response);
    }
  });
}

export function unmarkfavourite(userId: any, vendorId: any, apiService: any) {
  const favnum = 1;
  apiService.removeToFavouriteVEndors(userId, vendorId, favnum).subscribe((response: any) => {
    if (response) {
      console.log('Unremove Favorite API Response-', response);
    }
  });
}
