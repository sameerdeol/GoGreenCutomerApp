import { Component, Input, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { CommonModule, Location } from '@angular/common';
import { filter } from 'rxjs/operators';
import { IonicModule } from '@ionic/angular';
 
@Component({
  selector: 'app-common-header',
  templateUrl: './common-header.component.html',
  styleUrls: ['./common-header.component.scss'],
  imports: [IonicModule,CommonModule]
})
export class CommonHeaderComponent implements OnInit {
  @Input() customClass: string = '';
 
  headerText: string = '';
 
  constructor(
    private router: Router,
    private location: Location
  ) {}
 
  ngOnInit() {
    this.setHeader(this.router.url); // ✅ set initially
 
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.setHeader(event.urlAfterRedirects);
      });
  }
 
  setHeader(url: string) {
    if (url.includes('/view-cart')) {
      this.headerText = 'Cart';
    } else if (url.includes('/product-detail')) {
      this.headerText = 'Product Details';
    } else if (url.includes('/all-categories')) {
      this.headerText = 'Categories';
    } else if (url.includes('/profile')) {
      this.headerText = 'Profile';
    } else if (url.includes('/view-order-details')) {
      this.headerText = 'Order Details';
    } else if (url.includes('/orders')) {
      this.headerText = 'Orders';
    } else if (url.includes('/whishlist')) {
      this.headerText = 'Wishlist';
    }else if (url.includes('/my-account')) {
      this.headerText = 'My Account';
    } else if (url.includes('/all-address')) {
      this.headerText = 'Saved Address';
    }else if (url.includes('/otp')) {
      this.headerText = 'OTP';
    }else if (url.includes('/bookmarks')) {
      this.headerText = 'Bookmarks';
    }else if (url.includes('/about-us')) {
      this.headerText = 'About Us';
    }else if (url.includes('/faqs')) {
      this.headerText = 'FAQs';
    }else if (url.includes('/privacy')) {
      this.headerText = 'Privacy';
    }else if (url.includes('/terms-and-condition')) {
      this.headerText = 'Terms Of Use';
    }else {
      this.headerText = ''; // default
    }
  }
 
  goBack() {
    this.location.back();
  }
}
 