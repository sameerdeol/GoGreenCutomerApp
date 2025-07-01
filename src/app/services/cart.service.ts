import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  cartItems: any[] = [];
  isAddedMap: { [key: number]: boolean } = {};
  totalQuantity: number = 0;

  constructor() {}

  updateTotalQuantity() {
    this.totalQuantity = this.cartItems.reduce((total, item) => total + item.quantity, 0);
  }

  updateIsAddedMap() {
    this.isAddedMap = {};
    this.cartItems.forEach(item => {
      this.isAddedMap[item.id] = true;
    });
  }

  getQuantity(productId: number): number {
    const item = this.cartItems.find(i => i.id === productId);
    return item ? item.quantity : 0;
  }
}
