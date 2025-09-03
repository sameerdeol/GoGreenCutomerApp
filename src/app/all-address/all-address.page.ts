import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CommonHeaderComponent } from "../components/common-header/common-header.component";
import { ApiserviceService } from '../services/apiservice.service';
import { Storage } from '@ionic/storage-angular';

interface Address {
  id: number;
  user_id: number;
  address: string;
  landmark?: string;
  type: number;
  floor: string;
  customer_lng: string;
  customer_lat: string;
  created_at: string;
  updated_at: string;
}

@Component({
  selector: 'app-all-address',
  templateUrl: './all-address.page.html',
  styleUrls: ['./all-address.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule, CommonHeaderComponent],
}) 
export class AllAddressPage implements OnInit {
  savedUserAddress: Address[] = []; // Initialize as empty array
  user_id: any;
  isLoading: boolean = true;

  constructor(
    private apiservice: ApiserviceService,
    private storage: Storage
  ) {
    this.init();
  }

  async ngOnInit() {
    this.user_id = await this.storage.get('userID');
    this.getCustomerAddress();
  }

  async init() {
    await this.storage.create();
  }

  async getCustomerAddress() {
    this.isLoading = true;
    this.apiservice.get_User_address(this.user_id).subscribe({
      next: (response) => {
        if (response && response.addresses) {
          this.savedUserAddress = response.addresses;
          console.log('get address', response);
        } else {
          this.savedUserAddress = [];
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching addresses:', error);
        this.savedUserAddress = [];
        this.isLoading = false;
      }
    });
  }

  deleteUserAddress(address_id: any) {
    console.log('address_id',address_id)
    this.apiservice.deleteAddress(this.user_id, address_id).subscribe({
      next: (response) => {
        if (response) {
          console.log(response);
          // Remove the deleted address from the list
          this.savedUserAddress = this.savedUserAddress.filter(addr => addr.id !== address_id);
        }
      },
      error: (error) => {
        console.error('Error deleting address:', error);
      }
    });
  }

  trackByFn(index: number, item: Address): any {
    return item.id;
  }

  getAddressType(type: number): string {
    const types: { [key: number]: string } = {
      1: 'Home',
      2: 'Work',  
      3: 'Other'
    };
    return types[type] || 'Unknown';
  }

  getTypeColor(type: number): string {
    const colors: { [key: number]: string } = {
      1: 'success',
      2: 'warning',
      3: 'tertiary'
    };
    return colors[type] || 'medium';
  }

  editAddress(address: Address) {
    console.log('Edit address:', address);
    // Implement edit functionality - navigate to edit page
    // this.router.navigate(['/edit-address', address.id]);
  }
}