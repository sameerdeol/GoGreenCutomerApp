import { Component, OnInit, Renderer2, ViewChild, ElementRef, CUSTOM_ELEMENTS_SCHEMA, NgZone } from '@angular/core';
import { IonicModule, AlertController, ToastController, LoadingController } from '@ionic/angular';
import { FormsModule } from '@angular/forms'; // <-- Import FormsModule
import { Router } from '@angular/router';
import { register } from 'swiper/element/bundle';
import { CommonModule, Location } from '@angular/common';
import { ApiserviceService } from '../services/apiservice.service';
import { Storage } from '@ionic/storage-angular';
import { Platform } from '@ionic/angular';
import { DomSanitizer } from '@angular/platform-browser';
import { Geolocation } from '@capacitor/geolocation';
import { Diagnostic } from '@awesome-cordova-plugins/diagnostic/ngx';
import { environment } from 'src/environments/environment';
register();
declare var google: any;
@Component({
  selector: 'app-location',
  templateUrl: './location.page.html',
  styleUrls: ['./location.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule], // Import IonicModule here
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class LocationPage implements OnInit {
  @ViewChild('targetDiv') targetDiv!: ElementRef;
  @ViewChild('targetDiv2') targetDiv2!: ElementRef;
  @ViewChild('mapContainer', { static: false }) mapElement!: ElementRef;
  @ViewChild('searchInput', { static: false })
  searchInput!: ElementRef;
  isLocationSelected = false;
  constructor(public sanitizer: DomSanitizer,
    private platform: Platform,
    private ngZone: NgZone,
    private renderer: Renderer2,
    private router: Router,
    private apiservice: ApiserviceService,
    private storage: Storage,
    private location: Location,
    private diagnostic: Diagnostic,
    private alertController: AlertController,
    private toastController: ToastController,
    private loadingController: LoadingController
  ) {
    this.init();
  }
  addressInput: any;
  address: any;
  floor: any;
  landmark: any;
  selectedTypeText: any;
  searchQuery = '';
  autocompleteItems: any[] = [];
  autocompleteService: any;
  addressDetails: string = '';
  mapUrl: string = 'https://maps.google.com/maps?q=India&z=15&output=embed';
  slides = [
    { icon: 'home-outline', text: 'Home', id: 1 },
    { icon: 'briefcase-outline', text: 'Work', id: 2 },
    { icon: 'business-outline', text: 'Hotel', id: 3 },
    { icon: 'location-outline', text: 'Other', id: 4 },
  ];
  map: any;
  marker: any;
  selectedSlide: number = -1;
  customer_lat: any;
  customer_lng: any;
  isModalOpen = false;
  is_new_user: any;
  async init() {
    await this.storage.create();
  }
  async ngOnInit() {
    this.is_new_user = await this.storage.get('is_new_user');
    this.platform.ready().then(async () => {
      await this.loadGoogleMaps(); 
      this.loadMap();

      // Wait a bit to ensure map is ready
      setTimeout(() => {
        this.goToCurrentLocation();
      }, 1000);
    });
  }

  ngAfterViewInit() {

    const interval = setInterval(() => {
      if ((window as any).google && google.maps && google.maps.places) {
        this.autocompleteService = new google.maps.places.AutocompleteService();
        clearInterval(interval);
      }
    }, 500);
  }

  loadGoogleMaps(): Promise<void> {
  return new Promise((resolve) => {
    if ((window as any).google && (window as any).google.maps) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${environment.googleMapsApiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      resolve();
    };
    document.body.appendChild(script);
  });
}
  loadMap() {
    const mapOptions = {
      center: { lat: 28.6139, lng: 77.2090 },
      zoom: 15,
      mapId: '24baddbb33088101a7e80a63',
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      mapTypeControl: true,
      mapTypeControlOptions: {
        position: google.maps.ControlPosition.TOP_LEFT
      }
    };

    this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
    google.maps.event.addListener(this.map, 'idle', () => {
      const center = this.map.getCenter();
      if (center) {
        const lat = center.lat();
        const lng = center.lng();
        this.customer_lat = lat;
        this.customer_lng = lng;
        console.log('📍 Center Latitude:', lat);
        console.log('📍 Center Longitude:', lng);
        this.reverseGeocode(center);
      }
    });

    // Fix control UI delay
    setTimeout(() => {
      const controls = this.map.getDiv().querySelectorAll('.gmnoprint');
      controls.forEach((el: any) => {
        if (el && el.innerHTML.includes('Map')) {
          el.style.top = '5px';
          el.style.left = '10px';
          el.style.position = 'absolute';
          el.style.zIndex = '9999';
        }
      });
    }, 500);
  }


  reverseGeocode(latLng: any) {
    const geocoder = new google.maps.Geocoder();

    geocoder.geocode({ location: latLng }, (results: any, status: any) => {
      if (status === 'OK' && results[0]) {
        this.ngZone.run(() => {
          const fullAddress = results[0].formatted_address;

          this.addressDetails = fullAddress;
          this.address = fullAddress;
        });
      } else {
        console.warn('Reverse geocoding failed:', status);
        this.ngZone.run(() => {
          this.addressDetails = 'Unable to determine address.';
        });
      }
    });
  }

  async goToCurrentLocation(lat?: any, lng?: any) {
    if (lat && lng) {
      const customLatLng = new google.maps.LatLng(lat, lng);
      this.customer_lat = lat;
      this.customer_lng = lng;
      this.map.setCenter(customLatLng);
      this.reverseGeocode(customLatLng);
      return;
    }
    this.checkGPSAndLoadLocation();
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const currentLatLng = new google.maps.LatLng(lat, lng);
          this.customer_lat = lat;
          this.customer_lng = lng;
          console.log('lat and long:', lat, lng)
          this.map.setCenter(currentLatLng);
          this.reverseGeocode(currentLatLng);
        },
        (error) => {
          console.error('❌ Error getting location:', error);
          alert('Unable to fetch current location. Please enable GPS.');
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  }

  async checkGPSAndLoadLocation() {
    if (!this.platform.is('cordova') && !this.platform.is('capacitor')) {
      console.warn('Native location check skipped: not running on a device.');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Fetching your location...',
      spinner: 'crescent',
      backdropDismiss: false,
      cssClass: 'my-custom-loader' // Optional, for styling
    });

    await loading.present(); 

    try {
      const isAvailable = await this.diagnostic.isLocationEnabled();
      if (!isAvailable) {
        loading.dismiss();
        const enable = confirm('Location is turned off. Would you like to enable it?');
        if (enable) {
          this.diagnostic.switchToLocationSettings();
        }
        return;
      }

      const permission = await Geolocation.checkPermissions();
      if (permission.location === 'denied') {
        await Geolocation.requestPermissions();
      }

      const coordinates = await Geolocation.getCurrentPosition({
        timeout: 20000,
        enableHighAccuracy: true
      });

      const lat = coordinates.coords.latitude;
      const lng = coordinates.coords.longitude;
      const currentLatLng = new google.maps.LatLng(lat, lng);

      this.map.setCenter(currentLatLng);
      this.reverseGeocode(currentLatLng);
    } catch (err) {
      console.error('Error in checkGPSAndLoadLocation():', err);
      alert('Failed to fetch location. Please check permissions.');
    } finally {
      loading.dismiss();
    }
  }

  onSearchInput(event: any) {
    const query = event.target.value;
    if (!query || !this.autocompleteService) {
      this.autocompleteItems = [];
      return;
    }

    this.autocompleteService.getPlacePredictions(
      { input: query },
      (predictions: any[], status: any) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
          this.ngZone.run(() => {
            this.autocompleteItems = predictions;
          });
        } else {
          this.ngZone.run(() => {
            this.autocompleteItems = [];
          });
        }
      }
    );
  }

  selectPlace(place: any) {
    const placesService = new google.maps.places.PlacesService(this.map);

    placesService.getDetails({ placeId: place.place_id }, (result: any, status: any) => {
      if (status === google.maps.places.PlacesServiceStatus.OK) {
        const location = result.geometry.location;

        this.map.setCenter(location);
        this.ngZone.run(() => {
          this.searchQuery = result.formatted_address || result.name;
          this.addressDetails = result.formatted_address || result.name;
          this.autocompleteItems = [];
        });

        this.reverseGeocode(location);
      }
    });
  }

  onSlideClick(index: number) {
    this.selectedSlide = index;
    const selectedSlide = this.slides[index];
    console.log('Selected slide ID:', this.slides[index].id);
    this.selectedTypeText = selectedSlide.text;
    console.log('Selected slide Text:', selectedSlide.text);
  }
  goback() {
    this.location.back();
  }

  async onConfirmAddress() {
    const address = this.address?.trim();
    const floor = this.floor?.trim();
    const landmark = this.landmark?.trim();
    const type = this.slides[this.selectedSlide]?.id;
    const customer_lat = this.customer_lat;
    const customer_lng = this.customer_lng;

    // ✅ Validation checks
    if (!this.address?.trim()) {
      this.presentToast('Please enter the complete address');
      return;
    }

    if (!this.floor?.trim()) {
      this.presentToast('Please enter the floor');
      return;
    }

    if (this.selectedSlide === -1) {
      this.presentToast('Please select a location tag');
      return;
    }

    const user_id = await this.storage.get('userID');

    // Proceed with API call if all fields are valid
    this.apiservice.save_user_address(user_id, address, floor, landmark, type, customer_lat, customer_lng).subscribe(async (response) => {
      console.log('save address response', response);
      if (response.success === true) {
        await this.storage.set('Addres_type', type);
        await this.storage.set('fullAddress', address);
        await this.storage.set('selectedTypeText', this.selectedTypeText);

        // Clear the form
        this.address = '';
        this.floor = '';
        this.landmark = '';
        this.selectedSlide = -1;
        this.setOpen(false);
        this.showSuccessAlert();
        
        // this.router.navigate(['/home']);
      } else {
        this.showErrorAlert();
      }
    });
  }

  async showSuccessAlert() {
    const alert = await this.alertController.create({
      header: 'Success',
      message: 'Address saved successfully!',
      buttons: ['OK'],
      cssClass: 'custom-alert'
    });

    await alert.present();
    await alert.onDidDismiss();
    this.setOpen(false);
    if(this.is_new_user == true){
      this.router.navigate(['/profile']);
    }else{
       this.router.navigate(['/home']);
    }
   
  }

  async showErrorAlert() {
    const alert = await this.alertController.create({
      header: 'Error',
      message: 'Failed to save address. Please try again.',
      buttons: ['OK'],
      cssClass: 'custom-alert'
    });

    await alert.present();
  }

  async presentToast(message: string, position: 'top' | 'middle' | 'bottom' = 'top') {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position,
      cssClass: 'my-toast' // Optional: 'primary', 'success', 'warning', 'danger'
    });

    await toast.present();
  }

  setOpen(isOpen: boolean) {
    this.isModalOpen = isOpen;
    console.log('modal open', isOpen)
  }

  add_select_loc() {
    this.setOpen(true);
  }

  navigateToHome() {
    this.router.navigate(['/home']);
  }

}
