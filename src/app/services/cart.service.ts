import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  cartItems: any[] = [];
  isAddedMap: { [key: number]: boolean } = {};
  totalQuantity: number = 0;

  // BehaviorSubject for real-time cart quantity updates
  private cartQuantitySubject = new BehaviorSubject<number>(0);
  public cartQuantity$: Observable<number> = this.cartQuantitySubject.asObservable();

  private cartItemsSubject = new BehaviorSubject<any[]>([]);
  public cartItems$: Observable<any[]> = this.cartItemsSubject.asObservable();

  constructor() {}

  updateTotalQuantity() {
    this.totalQuantity = this.cartItems.reduce((total, item) => total + item.quantity, 0);
    // Emit the new total quantity to all subscribers
    this.cartQuantitySubject.next(this.totalQuantity);
    // console.log("totalQuantity in cart service : ", this.totalQuantity);
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

  // Method to set cart items and update quantity
  setCartItems(items: any[]) {
    this.cartItems = items;
    this.updateTotalQuantity();
    this.updateIsAddedMap();
    this.cartItemsSubject.next(this.cartItems);
  }
 

  // Method to get current cart quantity
  getCurrentQuantity(): number {
    return this.totalQuantity;
  }
}
