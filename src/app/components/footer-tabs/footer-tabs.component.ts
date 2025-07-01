import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
@Component({
  selector: 'app-footer-tabs',
  templateUrl: './footer-tabs.component.html',
  styleUrls: ['./footer-tabs.component.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule], // Import IonicModule here
})
export class FooterTabsComponent  implements OnInit {

  activeTab: string = '';

  constructor(private router: Router) {
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
  }
  ngOnInit(): void {
    
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
