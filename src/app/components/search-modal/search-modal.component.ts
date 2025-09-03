import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { IonContent } from "@ionic/angular/standalone";
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { GlobalSearchComponent } from '../global-search/global-search.component';
@Component({
  selector: 'app-search-modal',
  templateUrl: './search-modal.component.html',
  styleUrls: ['./search-modal.component.scss'],
  imports: [FormsModule,IonicModule, CommonModule,GlobalSearchComponent], 
})
export class SearchModalComponent {
   @Input() vendor_id: any;
  searchTerm: string = '';
  hideDiv: boolean = false;

  constructor(private modalController: ModalController) {}

  dismiss() {
    this.modalController.dismiss();
  }
  ngOnInint(){
     console.log('Received vendor_id:', this.vendor_id);
  }
  onSearchChange(event: any) {
    this.searchTerm = event.detail.value;
    // Add search logic here
  }
  onSearchFocusChange(isFocused: boolean) {
    this.hideDiv = isFocused;

  }
}
