import { Component, OnInit, Renderer2,ViewChild, ElementRef, CUSTOM_ELEMENTS_SCHEMA, NgZone } from '@angular/core';
import { IonicModule } from '@ionic/angular';
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
register();
declare var google: any;
@Component({
  selector: 'app-location',
  templateUrl: './location.page.html',
  styleUrls: ['./location.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule,CommonModule], // Import IonicModule here
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
    { icon: 'home-outline', text: 'Home' ,id: 1},
    { icon: 'briefcase-outline', text: 'Work',id: 2 },
    { icon: 'business-outline', text: 'Hotel' ,id: 3},
    { icon: 'location-outline', text: 'Other',id: 0 },
  ];
  map: any;
  marker: any;
  selectedSlide: number = -1;
  async init() {
    await this.storage.create();
  }
  ngOnInit() {
    this.platform.ready().then(() => {
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

    
    loadMap() {
      const mapOptions = {
        center: { lat: 28.6139, lng: 77.2090 },
        zoom: 15,
        mapId: 'fefe281e3791a60d9b9bd15c',
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
            const maxLength = 60; 
    
            const trimmedAddress = fullAddress.length > maxLength
              ? fullAddress.substring(0, maxLength) + '...'
              : fullAddress;
    
            this.addressDetails = trimmedAddress;
            this.address = trimmedAddress; 
          });
        } else {
          console.warn('Reverse geocoding failed:', status);
          this.ngZone.run(() => {
            this.addressDetails = 'Unable to determine address.';
          });
        }
      });
    }
    
    async goToCurrentLocation() {
      this.checkGPSAndLoadLocation();
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            const currentLatLng = new google.maps.LatLng(lat, lng);
            console.log('lat and long:', lat,lng)
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
      try {
        const isAvailable = await this.diagnostic.isLocationEnabled();
    
        if (!isAvailable) {
          const enable = confirm('Location is turned off. Would you like to enable it?');
          if (enable) {
            this.diagnostic.switchToLocationSettings();
            return;
          } else {
            return; // Exit if user declines
          }
        }
    
        // Permissions
        const permission = await Geolocation.checkPermissions();
        if (permission.location === 'denied') {
          await Geolocation.requestPermissions();
        }
    
        const coordinates = await Geolocation.getCurrentPosition();
        const lat = coordinates.coords.latitude;
        const lng = coordinates.coords.longitude;
        const currentLatLng = new google.maps.LatLng(lat, lng);
    
        this.map.setCenter(currentLatLng);
        this.reverseGeocode(currentLatLng);
      } catch (err) {
        console.error('Error getting location:', err);
        alert('Failed to fetch location. Please check permissions.');
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
    goback(){
      this.location.back();
    }
    async onConfirmAddress() { 
      const user_id = await this.storage.get('userID');
      const address = this.address;
      const floor = this.floor;
      const landmark = this.landmark;
      const type = this.slides[this.selectedSlide]?.id;

      this.apiservice.save_user_address(user_id,address,floor,landmark,type).subscribe(async (response)=>{
        if(response.success === true)
        console.log('save addres response',response);
        await this.storage.set('Addres_type', type);
        await this.storage.set('fullAddress', address);
        await this.storage.set('selectedTypeText', this.selectedTypeText);
        
        this.address = '';
        this.floor = '';
        this.landmark = '';
        this.selectedSlide = 10; // Optional: reset selected address type
  
        this.router.navigate(['/home']); // Replace '/home' with your actual route

      })
    }

    add_select_loc() {
      if (this.targetDiv.nativeElement.classList.contains('select_loc') && this.targetDiv.nativeElement.classList.contains('black_overlay')) {
        this.renderer.removeClass(this.targetDiv.nativeElement, 'select_loc');
        this.renderer.removeClass(this.targetDiv2.nativeElement, 'black_overlay');
      } else {
        this.renderer.addClass(this.targetDiv.nativeElement, 'select_loc');
        this.renderer.addClass(this.targetDiv2.nativeElement, 'black_overlay');
      }
    }

    remove_select_loc() {
      if (this.targetDiv.nativeElement.classList.contains('select_loc') && this.targetDiv.nativeElement.classList.contains('black_overlay')) {
        this.renderer.addClass(this.targetDiv.nativeElement, 'select_loc');
        this.renderer.addClass(this.targetDiv2.nativeElement, 'black_overlay');
      } else {
        this.renderer.removeClass(this.targetDiv.nativeElement, 'select_loc');
        this.renderer.removeClass(this.targetDiv2.nativeElement, 'black_overlay');
      }
    }
    navigateToHome(){
      this.router.navigate(['/home']);
    }

}
