import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ProductState {
  selectedVariant: any = null;
  selectedAddon: any = null;
}
