import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { CommonHeaderComponent } from 'src/app/components/common-header/common-header.component';
import { ApiserviceService } from 'src/app/services/apiservice.service';
import { Storage } from '@ionic/storage-angular';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-review-purchase',
  templateUrl: './review-purchase.page.html',
  styleUrls: ['./review-purchase.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, CommonHeaderComponent]
})
export class ReviewPurchasePage implements OnInit {

  deliveredOrders: any[] = [];
  isLoading: boolean = true;
  selectedProduct: any = null;
  reviewData = {
    rating: 0,
    title: '',
    comment: '',
    recommend: true
  };
  isSubmittingReview: boolean = false;
  currency = environment.currencySymbol;

  constructor(
    private apiService: ApiserviceService,
    private storage: Storage,
    private router: Router,
    private alertController: AlertController,
    private toastController: ToastController
  ) { }

  async ngOnInit() {
    await this.storage.create();
    await this.loadDeliveredOrders();
  }

  async loadDeliveredOrders() {
    try {
      const userId = await this.storage.get('userID');
      if (userId) {
        this.apiService.get_all_orders(userId).subscribe((response) => {
          if (response && response.orders) {
            // Filter only delivered orders (status = 1)
            this.deliveredOrders = response.orders.filter((order: any) => order.order_status === 1);
          }
          this.isLoading = false;
        });
      }
    } catch (error) {
      console.error('Error loading orders:', error);
      this.isLoading = false;
    }
  }

  setRating(rating: number) {
    this.reviewData.rating = rating;
  }

  async openReviewModal(product: any, order: any) {
    this.selectedProduct = { ...product, orderId: order.order_uid };
    this.resetReviewForm();
    
    const alert = await this.alertController.create({
      header: 'Rate this Product',
      subHeader: product.product_name,
      cssClass: 'rating-alert',
      message: '', // We'll inject HTML after present to avoid escaping
      inputs: [
        {
          name: 'comment',
          type: 'textarea',
          placeholder: 'Share your experience (optional)',
          value: ''
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Submit Review',
          handler: (data) => {
            if (this.reviewData.rating === 0) {
              this.presentToast('Please select a rating', 'warning');
              return false;
            }
            this.reviewData.comment = data.comment || '';
            this.submitReview();
            return true;
          }
        }
      ]
    });

    await alert.present();

    // Inject stars container markup into alert message after present
    const messageEl = document.querySelector('.rating-alert .alert-message') as HTMLElement | null;
    if (messageEl) {
      messageEl.innerHTML = '<div id="stars-container" style="display:flex;justify-content:center;gap:8px;margin:16px 0;font-size:28px;"></div>';
    }

    // Populate stars after the alert is in DOM
    setTimeout(() => {
      const container = document.getElementById('stars-container');
      if (!container) return;

      const renderStars = (current: number) => {
        container.innerHTML = '';
        for (let i = 1; i <= 5; i++) {
          const star = document.createElement('ion-icon');
          star.name = i <= current ? 'star' : 'star-outline';
          (star as any).style = 'color:' + (i <= current ? '#ffc409' : '#ccc') + '; cursor:pointer; transition:all .2s;';
          star.addEventListener('click', () => {
            this.setRating(i);
            renderStars(i);
          });
          container.appendChild(star);
        }
      };

      renderStars(this.reviewData.rating || 0);
    }, 0);
  }

  setRatingInAlert(rating: number, container: HTMLElement) {
    this.reviewData.rating = rating;
    const stars = container.querySelectorAll('ion-icon');
    stars.forEach((star, index) => {
      if (index < rating) {
        star.setAttribute('name', 'star');
        (star as HTMLElement).style.color = '#ffc409';
      } else {
        star.setAttribute('name', 'star-outline');
        (star as HTMLElement).style.color = '#ccc';
      }
    });
  }

  async navigateToProduct(product: any) {
    // Store product ID in storage (like view-cart does)
    await this.storage.set('lastProductId', product.product_id);
    
    // Navigate with query params (matching view-cart implementation)
    this.router.navigate(['/product-detail'], {
      queryParams: { id: product.product_id }
    });
  }

  resetReviewForm() {
    this.reviewData = {
      rating: 0,
      title: '',
      comment: '',
      recommend: true
    };
  }

  async submitReview() {
  this.isSubmittingReview = true;

  try {
    const user_id = await this.storage.get('userID');

    const reviewPayload = {
      rateable_id: this.selectedProduct.product_id,
      orderId: this.selectedProduct.orderId,
      rating: this.reviewData.rating,
      title: this.reviewData.title,
      comment: this.reviewData.comment,
      recommend: this.reviewData.recommend,
      user_id: user_id,
      rateable_type: 1
    };

    this.apiService.submit_rating(reviewPayload).subscribe({
      next: async (response) => {
        if (response.success === true) {
          await this.presentToast('Review submitted successfully!', 'success');
          this.selectedProduct = null;
          this.resetReviewForm();
        } else {
          await this.presentToast('Failed to submit review. Please try again.', 'danger');
        }
        this.isSubmittingReview = false; // ✅ stop loader here
      },
      error: async (err) => {
        console.error('Error submitting review:', err);
        await this.presentToast('Failed to submit review. Please try again.', 'danger');
        this.isSubmittingReview = false; // ✅ stop loader on error
      }
    });
  } catch (error) {
    console.error('Error before submitting review:', error);
    await this.presentToast('Unexpected error. Please try again.', 'danger');
    this.isSubmittingReview = false;
  }
}


  async presentToast(message: string, color: string = 'primary') {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      color: color,
      position: 'top'
    });
    await toast.present();
  }

  doRefresh(event: any) {
    this.loadDeliveredOrders();
    setTimeout(() => {
      event.target.complete();
    }, 1000);
  }
}
