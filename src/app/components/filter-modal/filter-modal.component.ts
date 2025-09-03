import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import { IonFooter, IonToolbar } from "@ionic/angular/standalone";

@Component({
  selector: 'app-filter-modal',
  templateUrl: './filter-modal.component.html',
  styleUrls: ['./filter-modal.component.scss'],
  imports: [IonicModule, FormsModule, CommonModule],
})
export class FilterModalComponent  implements OnInit {
  @Input() currentFilters: any;
  priceOptions = ['High to Low', 'Low to High'];
  discountOptions = ['50% Off', '10% Off'];
  deliveryOptions = ['Fast Delivery', 'Normal Delivery'];
  ratingOptions = ['4.0+', '3.5+'];
  selectedPrice: string = '';
  selectedDiscount: string = '';
  selectedDelivery: string = '';
  selectedRating: string = '';
  constructor(private modalCtrl: ModalController) { }

ngOnInit() {
   if (this.currentFilters) {
      this.selectedPrice = this.currentFilters.price || '';
      this.selectedDiscount = this.currentFilters.discount || '';
      this.selectedDelivery = this.currentFilters.delivery || '';
      this.selectedRating = this.currentFilters.rating || '';
    }
}

  toggleSelection(type: string, option: string) {
    if (type === 'price') {
      this.selectedPrice = this.selectedPrice === option ? '' : option;
    } else if (type === 'discount') {
      this.selectedDiscount = this.selectedDiscount === option ? '' : option;
    } else if (type === 'delivery') {
      this.selectedDelivery = this.selectedDelivery === option ? '' : option;
    } else if (type === 'rating') {
      this.selectedRating = this.selectedRating === option ? '' : option;
    }
  }
  getSelectedCount(): number {
    let count = 0;
    if (this.selectedPrice) count++;
    if (this.selectedDiscount) count++;
    if (this.selectedDelivery) count++;
    if (this.selectedRating) count++;
    return count;
  }
  removeSelection(event: Event, type: string) {
    event.stopPropagation();
    if (type === 'price') this.selectedPrice = '';
    else if (type === 'discount') this.selectedDiscount = '';
    else if (type === 'delivery') this.selectedDelivery = '';
    else if (type === 'rating') this.selectedRating = '';
  }

  closeModal() {
    this.modalCtrl.dismiss();
  }


  clearAll() {
    this.selectedPrice = '';
    this.selectedDiscount = '';
    this.selectedDelivery = '';
    this.selectedRating = '';
   
    this.modalCtrl.dismiss({
      filters: {},
      count: 0
    });
   this.closeModal();
  }

  applyFilters() {
    const filterData: any = {};

    if (this.selectedPrice.length) filterData.price = this.selectedPrice;
    if (this.selectedDiscount.length) filterData.discount = this.selectedDiscount;
    if (this.selectedDelivery.length) filterData.delivery = this.selectedDelivery;
    if (this.selectedRating.length) filterData.rating = this.selectedRating;
     const count = this.getSelectedCount();
    console.log('Applied Filters:', filterData);

    // Close modal and return filters
      this.modalCtrl.dismiss({
      filters: filterData,
      count: count
    });
  }

}
