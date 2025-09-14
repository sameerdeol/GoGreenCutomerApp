import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit, OnDestroy, NgZone, ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AlertController, IonicModule, ModalController, IonContent } from '@ionic/angular';
import { HeaderComponent } from '../components/header/header.component';
import { CommonModule } from '@angular/common';
import { register } from 'swiper/element/bundle';
import { FooterTabsComponent } from '../components/footer-tabs/footer-tabs.component';
import { ApiserviceService } from '../services/apiservice.service';
import { environment } from 'src/environments/environment';
import { Storage } from '@ionic/storage-angular';


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
export class NewPickDropPage implements OnInit, OnDestroy {

  @ViewChild('pickupInput', { static: false }) pickupInput!: ElementRef;
  @ViewChild('dropInput', { static: false }) dropInput!: ElementRef;
  @ViewChild(IonContent, { static: false }) content!: IonContent;

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
  items: any[] = [
    { weight: null, unit: 'kg', width: null, height: null, error: false }
  ]
  todayDate: string = '';
  currentTime: string = '';
  minDateTime: string ='';
  maxDateTime: string = '';
  parcelComment: string = '';
  scheduledComments: string = '';
  isInputFocused: boolean = false;
  private autocompleteInstances: any[] = [];
  private scrollHandlers: Map<HTMLElement, () => void> = new Map();


  constructor(
    private apiservice: ApiserviceService,
    private storage: Storage,
    private ngZone: NgZone,
    private modalController: ModalController,
    private alertController: AlertController
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
    this.setDateLimits();
    const token = await this.storage.get('userID');
    this.userID = token;
    console.log('userID:', token);
    this.getAllBannerImg();
  }

  async ngAfterViewInit() {
    await this.loadGoogleMaps(); 
    this.initAutocomplete(this.pickupInput, 'pickup');
    this.initAutocomplete(this.dropInput, 'drop');
  }

  ngOnDestroy() {
    // Clean up autocomplete instances
    this.autocompleteInstances.forEach(autocomplete => {
      if (autocomplete && google.maps.event) {
        google.maps.event.clearInstanceListeners(autocomplete);
      }
    });

    // Clean up scroll handlers
    this.scrollHandlers.forEach((handler, inputElement) => {
      // Remove scroll listeners
      this.content.getScrollElement().then(scrollElement => {
        if (scrollElement) {
          scrollElement.removeEventListener('scroll', handler);
        }
      });
      window.removeEventListener('scroll', handler);
      window.removeEventListener('resize', handler);
    });
    
    this.scrollHandlers.clear();
  }

  presentPopover(ev: Event) {
    this.isPopoverOpen = true;
  }
  setDateLimits() {
  const now = new Date();

  // Get local date in YYYY-MM-DDTHH:mm format
  const offset = now.getTimezoneOffset(); // in minutes
  const localISOTime = new Date(now.getTime() - (offset * 60000))
    .toISOString()
    .slice(0, 16); // cut seconds + Z

  this.minDateTime = localISOTime;

  // Max = 7 days from now
  const future = new Date();
  future.setDate(future.getDate() + 7);

  const localFutureISO = new Date(future.getTime() - (offset * 60000))
    .toISOString()
    .slice(0, 16);

  this.maxDateTime = localFutureISO;

  console.log('Min datetime (IST):', this.minDateTime);
  console.log('Max datetime (IST):', this.maxDateTime);
}
  validateWeight(item: any) {
    // Reset error state
    item.error = false;
    
    // If weight is not provided or is 0, no error (let form validation handle it)
    if (!item.weight || item.weight <= 0) {
      return;
    }

    let weightInKg = 0;

    if (item.unit === 'kg') {
      weightInKg = parseFloat(item.weight);
    } else if (item.unit === 'g') {
      weightInKg = parseFloat(item.weight) / 1000; // grams → kg
    } else if (item.unit === 'lbs') {
      weightInKg = parseFloat(item.weight) * 0.453592; // lbs → kg
    }

    // Set error if weight exceeds 3kg
    item.error = weightInKg > 3;
  }

  async isFormValid(): Promise<boolean> {
    // Check if pickup and drop addresses are filled
    if (!this.pickupAddress || this.pickupAddress.trim() === '') {
      await this.presentAlert('Please fill all required fields. Pickup address is required.');
      return false;
    }

    if (!this.dropAddress || this.dropAddress.trim() === '') {
      await this.presentAlert('Please fill all required fields. Drop address is required.');
      return false;
    }

    // Check if at least one item exists
    if (!this.items || this.items.length === 0) {
      await this.presentAlert('Please add at least one parcel item.');
      return false;
    }

    // Validate each item
    for (let i = 0; i < this.items.length; i++) {
      const item = this.items[i];
      
      // Check if weight is provided
      if (item.weight == null || item.weight <= 0 || item.weight === '') {
        await this.presentAlert(`Please fill all required fields.`);
        return false;
      }

      // Convert weight to kg for validation
      let weightInKg = 0;
      if (item.unit === 'kg') {
        weightInKg = parseFloat(item.weight);
      } else if (item.unit === 'g') {
        weightInKg = parseFloat(item.weight) / 1000;
      } else if (item.unit === 'lbs') {
        weightInKg = parseFloat(item.weight) * 0.453592;
      }

      // Check if weight exceeds 3kg
      if (weightInKg > 3) {
        await this.presentAlert(`Weight should not be more than 3kg.`);
        return false;
      }
    }

    return true;
  }

  initAutocomplete(inputRef: ElementRef, type: 'pickup' | 'drop') {
    const autocomplete = new google.maps.places.Autocomplete(inputRef.nativeElement, {
      componentRestrictions: { country: 'in' },
      fields: ['geometry', 'formatted_address', 'name'],
      types: ['geocode']
    });

    // Store autocomplete instance for scroll handling
    this.autocompleteInstances.push(autocomplete);

    // Add scroll event listener to maintain suggestion position
    this.addScrollListener(inputRef.nativeElement);

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
  async presentAlert(message: string) {
    const alert = await this.alertController.create({
      header: 'Validation Error',
      message: message,
      buttons: ['OK'],
      cssClass: 'validation-alert'
    });
    await alert.present();
  }
  async placeOrder() {
    // const valid = await this.isFormValid();
    // if (!valid) return;

    // ✅ proceed if validation passes
    this.isModalOpen = true;
  }
  submitOrder() {
    // Get separate delivery date and time
    const deliveryDate = this.getDeliveryDate();
    const deliveryTime = this.getDeliveryTime();
    
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
      userId: this.userID,
      parcelComment: this.parcelComment,
      deliveryDate: deliveryDate,
      deliveryTime: deliveryTime,
      scheduledComments: this.scheduledComments
    };

    const ordersArray = [orderData];
    console.log('Orders Array:', ordersArray);
    console.log('Delivery Date:', deliveryDate);
    console.log('Delivery Time:', deliveryTime);
    console.log('Scheduled Comments:', this.scheduledComments);

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

  getDeliveryDate(): string {
    // If today delivery is selected, return current date
    if (this.selectedDelvieryOption === 'today') {
      const now = new Date();
      return now.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: '2-digit'
      });
    }
    
    // If custom date/time is selected, return the selected date
    if (this.selectedDelvieryOption === 'nottoday' && this.selectedDateTime) {
      const dateObj = new Date(this.selectedDateTime);
      return dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: '2-digit'
      });
    }
    
    // Fallback: return current date
    const now = new Date();
    return now.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit'
    });
  }

  getDeliveryTime(): string {
    // If today delivery is selected, return current time
    if (this.selectedDelvieryOption === 'today') {
      const now = new Date();
      return now.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    }
    
    // If custom date/time is selected, return the selected time
    if (this.selectedDelvieryOption === 'nottoday' && this.selectedDateTime) {
      const dateObj = new Date(this.selectedDateTime);
      return dateObj.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    }
    
    // Fallback: return current time
    const now = new Date();
    return now.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }

  onInputFocus() {
    this.isInputFocused = true;
    // Scroll to top when input is focused to show Google Maps suggestions
    setTimeout(() => {
      this.content.scrollToTop(300);
    }, 100);
  }

  onInputBlur() {
    this.isInputFocused = false;
  }

  addScrollListener(inputElement: HTMLElement) {
    let isScrolling = false;
    const input = inputElement as HTMLInputElement;
    const inputType = input.placeholder?.includes('pickup') ? 'PICKUP' : 'DROP';
    
    // Create unique scroll handler for this specific input
    const scrollHandler = () => {
      if (inputElement === document.activeElement && !isScrolling) {
        isScrolling = true;
        
        // Use requestAnimationFrame for better performance
        requestAnimationFrame(() => {
          // Force autocomplete to reposition when scrolling
          const pacContainer = document.querySelector('.pac-container') as HTMLElement;
          if (pacContainer) {
            // Update the position of the suggestions container
            const inputRect = inputElement.getBoundingClientRect();
            pacContainer.style.top = (inputRect.bottom + window.scrollY + 2) + 'px';
            pacContainer.style.left = (inputRect.left + window.scrollX) + 'px';
            pacContainer.style.width = inputRect.width + 'px';
            
            console.log(`📍 Repositioning suggestions for ${inputType} input`);
          }
          
          isScrolling = false;
        });
      }
    };

    // Store the handler for this specific input
    this.scrollHandlers.set(inputElement, scrollHandler);
    console.log(`✅ Added scroll listener for ${inputType} input`);

    // Add scroll listener to the content
    this.content.getScrollElement().then(scrollElement => {
      if (scrollElement) {
        scrollElement.addEventListener('scroll', scrollHandler, { passive: true });
      }
    });

    // Also add to window scroll for better coverage
    window.addEventListener('scroll', scrollHandler, { passive: true });
    
    // Add resize listener to handle orientation changes
    window.addEventListener('resize', scrollHandler, { passive: true });
  }
}
