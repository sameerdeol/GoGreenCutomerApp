import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { CartService } from '../../services/cart.service';
import { Storage } from '@ionic/storage-angular';

@Component({
  selector: 'app-footer-tabs',
  templateUrl: './footer-tabs.component.html',
  styleUrls: ['./footer-tabs.component.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule], // Import IonicModule here
})
export class FooterTabsComponent implements OnInit, OnDestroy {

  activeTab: string = '';
  cartQuantity: number = 0;
  private cartSubscription: Subscription = new Subscription();

  constructor(private router: Router, private cartService: CartService, private storage: Storage) {
        this.init();
    // Detect route change and update activeTab
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        const url = this.router.url;
        if (url.includes('/home')) {
          this.activeTab = 'home';
        } else if (url.includes('/all-categories')) {
          this.activeTab = 'categories';
        } else if (url.includes('/view-cart')) {
          this.activeTab = 'view-cart';
        } else if (url.includes('/my-account')) {
          this.activeTab = 'account';
        }
      });

    // Subscribe to cart quantity updates
    this.cartSubscription = this.cartService.cartQuantity$.subscribe(quantity => {
      this.cartQuantity = quantity;
      // console.log('🛒 Footer received cart quantity update:', quantity);
    });
  }

    async init() {
    await this.storage.create();
  }

  async ngOnInit(): Promise<void> {
    // Initialize with current cart quantity
    this.cartQuantity = this.cartService.getCurrentQuantity();

  }

  ngOnDestroy(): void {
    // Clean up subscription to prevent memory leaks
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
  }

  navigateToHome() {
    this.router.navigate(['/home']);
  }

  navigateToAllCategories() {
    this.router.navigate(['/all-categories']);
  }

  navigateToOrders() {
    this.router.navigate(['/view-cart']);
  }

  navigateToAccount() {
    this.router.navigate(['/my-account']);
  }
  
}
