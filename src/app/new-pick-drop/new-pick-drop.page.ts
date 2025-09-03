import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit, NgZone, ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AlertController, IonicModule, ModalController } from '@ionic/angular';
import { HeaderComponent } from '../components/header/header.component';
import { CommonModule } from '@angular/common';
import { register } from 'swiper/element/bundle';
import { FooterTabsComponent } from '../components/footer-tabs/footer-tabs.component';
import { ApiserviceService } from '../services/apiservice.service';
import { environment } from 'src/environments/environment';
import { Storage } from '@ionic/storage-angular';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

register();
declare var google: any;

@Component({
  selector: 'app-new-pick-drop',
  templateUrl: './new-pick-drop.page.html',
  styleUrls: ['./new-pick-drop.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, HeaderComponent, CommonModule, FooterTabsComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class NewPickDropPage implements OnInit {

  @ViewChild('pickupInput', { static: false }) pickupInput!: ElementRef;
  @ViewChild('dropInput', { static: false }) dropInput!: ElementRef;

  bannerImg: any;
  baseUrl = environment.baseurl;
  userID: any;

  pickupCoords: { lat: number, lng: number } | null = null;
  dropCoords: { lat: number, lng: number } | null = null;
  pickupAddress: string = '';
  dropAddress: string = '';

  distanceKm: number | null = null;
  distanceText: string = '';
  routeDurationText: string = '';
  itemName = '';
  parcelWeight: number | null = null;
  quantity: number | null = null;
  isPopoverOpen = false;
  isModalOpen = false;
  deliveryOption: string = 'today'; // Default to today delivery
  selectedDate: string = '';
  selectedTime: string = '';
  deliveryComments: string = '';
  selectedDateTime: string = new Date().toISOString(); 
  selectedDelvieryOption: string = 'today';
  items: { weight: number | null, unit: 'kg' | null, width?: number | null, height?: number | null }[] = [
    { weight: null, unit: 'kg', width: null, height: null }
  ];
  todayDate: string = '';
  currentTime: string = '';
  private googleApiKey = 'YOUR_GOOGLE_API_KEY'; // move to environment for security

  constructor(
    private apiservice: ApiserviceService,
    private storage: Storage,
    private ngZone: NgZone,
    private modalController: ModalController
  ) {
    this.init();
    const now = new Date();
    // Format YYYY-MM-DD
    this.todayDate = now.toISOString().slice(0, 10);
    // Format HH:mm
    this.currentTime = now.toTimeString().slice(0, 5);
  }

  async init() {
    await this.storage.create();
  }

  async ngOnInit() {
    const token = await this.storage.get('userID');
    this.userID = token?.value;
    console.log('token in AppComponent:', token?.value);
    this.getAllBannerImg();
  }

  async ngAfterViewInit() {
    await this.loadGoogleMaps(); 
    this.initAutocomplete(this.pickupInput, 'pickup');
    this.initAutocomplete(this.dropInput, 'drop');
  }

  presentPopover(ev: Event) {
    this.isPopoverOpen = true;
  }

  initAutocomplete(inputRef: ElementRef, type: 'pickup' | 'drop') {
    const autocomplete = new google.maps.places.Autocomplete(inputRef.nativeElement, {
      componentRestrictions: { country: 'in' },
      fields: ['geometry', 'formatted_address', 'name'],
      types: ['geocode']
    });

    autocomplete.addListener('place_changed', () => {
      this.ngZone.run(() => {
        const place = autocomplete.getPlace();
        if (!place.geometry) {
          console.warn('No details available for input: ', place);
          return;
        }

        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        const name = place.formatted_address || place.name;

        if (type === 'pickup') {
          this.pickupCoords = { lat, lng };
          this.pickupAddress = name;
        } else {
          this.dropCoords = { lat, lng };
          this.dropAddress = name;
        }

        console.log(`📍 ${type.toUpperCase()} Location:`, name);
        console.log(`📌 Coordinates:`, lat, lng);

        this.updateDistanceIfReady();
      });
    });
  }
  loadGoogleMaps(): Promise<void> {
  return new Promise((resolve, reject) => {
    if ((window as any).google && (window as any).google.maps) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${environment.googleMapsApiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = (err) => reject(err);
    document.body.appendChild(script);
  });
}
  // Straight-line (Haversine) calculation
  private haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const toRad = (deg: number) => deg * Math.PI / 180;
    const R = 6371; // Earth radius in km

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private async updateDistanceIfReady() {
    if (this.pickupCoords && this.dropCoords) {
      // Quick offline calculation
      const km = this.haversineDistance(
        this.pickupCoords.lat, this.pickupCoords.lng,
        this.dropCoords.lat, this.dropCoords.lng
      );
      this.distanceKm = Math.round(km * 100) / 100;
      this.distanceText = `${this.distanceKm} km (straight-line)`;

      // Fetch accurate route info
      await this.fetchRouteDistanceAndTime();
    } else {
      this.distanceKm = null;
      this.distanceText = '';
      this.routeDurationText = '';
    }
  }

  private fetchRouteDistanceAndTime() {
    if (!this.pickupCoords || !this.dropCoords) return;

    const service = new google.maps.DistanceMatrixService();
    service.getDistanceMatrix(
      {
        origins: [new google.maps.LatLng(this.pickupCoords.lat, this.pickupCoords.lng)],
        destinations: [new google.maps.LatLng(this.dropCoords.lat, this.dropCoords.lng)],
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (response: any, status: any) => {
        if (status === 'OK') {
          const element = response.rows[0].elements[0];
          if (element.status === 'OK') {
            this.ngZone.run(() => {
              this.distanceText = element.distance.text + ' (route)';
              this.distanceKm = Math.round((element.distance.value / 1000) * 100) / 100;
              this.routeDurationText = element.duration.text;
            });
          }
        } else {
          console.error('Distance Matrix failed due to:', status);
        }
      }
    );
  }


  getAllBannerImg() {
    this.apiservice.get_all_banner_imges().subscribe((response) => {
      this.bannerImg = response.banners;
      console.log('this.bannerImg', this.bannerImg);
    });
  }

  addRow() {
    this.items.push({ weight: null, unit: 'kg' });
  }

  removeRow(index: number) {
    this.items.splice(index, 1);
  }

  calculateCharges(): number {
    if (!this.distanceKm) return 0;
    const baseDistance = 5;
    const baseCharge = 5;
    if (this.distanceKm <= baseDistance) {
      return baseCharge;
    }
    return this.distanceKm; // Canada: 6 km → $6, 10 km → $10
  }

  async placeOrder() {
     this.isModalOpen = true;
  }
submitOrder() {
  const orderData = {
    pickup: { address: this.pickupAddress, coords: this.pickupCoords },
    drop: { address: this.dropAddress, coords: this.dropCoords },
    parcel: this.items, // all items with weight, dimensions, etc.
    trip: {
      distanceText: this.distanceText,
      distanceKm: this.distanceKm,
      duration: this.routeDurationText,
      charges: this.calculateCharges()
    },
    userId: this.userID
  };

  const ordersArray = [orderData];
  console.log('Orders Array:', ordersArray);

  this.isModalOpen = false; // close modal
}

    selectDeliveryOption(option: string) {
    this.deliveryOption = option;
    this.onDeliveryOptionChange({ detail: { value: option } });
  }

  // Delivery option change handler
  onDeliveryOptionChange(event: any) {
    this.deliveryOption = event.detail.value;
    
    // Reset selected date/time when switching to today delivery
    if (this.deliveryOption === 'today') {
      this.selectedDate = '';
      this.selectedTime = '';
    }
  }

  // Open date picker
  async openDatePicker() {
    const modal = await this.modalController.create({
      component: 'ion-datetime',
      componentProps: {
        value: this.selectedDate || new Date().toISOString(),
        presentation: 'date',
        min: new Date().toISOString(), // Prevent past dates
      },
      cssClass: 'date-picker-modal'
    });

    await modal.present();
    
    const { data } = await modal.onDidDismiss();
    if (data) {
      const date = new Date(data);
      this.selectedDate = date.toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric'
      });
    }
  }

  // Open time picker
  async openTimePicker() {
    const modal = await this.modalController.create({
      component: 'ion-datetime',
      componentProps: {
        value: this.selectedTime || new Date().toISOString(),
        presentation: 'time',
      },
      cssClass: 'time-picker-modal'
    });

    await modal.present();
    
    const { data } = await modal.onDidDismiss();
    if (data) {
      const time = new Date(data);
      this.selectedTime = time.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    }
  }

  async onDateTimeChange(event: CustomEvent) {
    const newValue = event.detail.value;  
    this.selectedDateTime = newValue;
    const [datePart, timePart] = newValue.split('T'); 

    // Save the date and time separately
    await this.storage.set('selectedDate', datePart);
    await this.storage.set('selectedTime', timePart);
  }
  
    async selectOnlyOnedilvery(option: string,event: any){
    if (this.selectedDelvieryOption === option) {
      this.selectedDelvieryOption = ''; // uncheck if clicked again
    } else {
      this.selectedDelvieryOption = option; // check only this one
      console.log('Selected delivery option:', option);
      await this.storage.set('SelectedDeliveryOption', option);
      console.log('Checkbox checked:', event.target.checked);
    }
  }
}
