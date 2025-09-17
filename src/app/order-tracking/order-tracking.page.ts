import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { ApiserviceService } from 'src/app/services/apiservice.service';
import { SocketService } from 'src/app/services/socket';
import { Subscription } from 'rxjs';
import { Storage } from '@ionic/storage-angular';
import { CommonHeaderComponent } from '../components/common-header/common-header.component';
import { environment } from 'src/environments/environment';

declare const google: any;

@Component({
  selector: 'app-order-tracking',
  standalone: true,
  imports: [IonicModule, CommonModule, CommonHeaderComponent],
  templateUrl: './order-tracking.page.html',
  styleUrls: ['./order-tracking.page.scss']
})
export class OrderTrackingPage implements OnInit, OnDestroy, AfterViewInit {
  orderId: string | null = null;

  loading: boolean = false;
  notFound: boolean = false;
  order: any = null; // raw order from API
  view: {
    id: string | number | null;
    orderUid?: string;
    status: string;
    riderStatus?: string;
    storeName?: string;
    storeAddress?: string;
    vendorPhone?: string;
    deliveryAddress?: string;
    floor?: string;
    landmark?: string;
    customerName?: string;
    customerPhone?: string;
    createdAt?: string;
    preparingTime?: number;
    isFastDelivery?: boolean;
    totalQuantity?: number;
    totalPrice?: string | number;
    paymentMethod?: string;
    etaMinutes?: number;
    rider?: { name?: string; phone?: string } | null;
    items?: Array<{
      order_item_id?: number;
      product_id?: number;
      product_name?: string;
      product_description?: string;
      product_price?: number | string;
      product_quantity?: number;
      total_item_price?: number | string;
      variant?: { type?: string | null; value?: string | null; price?: number | string | null } | null;
      addons?: Array<{ name?: string; price?: number | string }>
    }>;
  } | null = null;

  private riderLocationSub?: Subscription;
  riderLat: number | null = null;
  riderLng: number | null = null;
  private riderId: string | number | null = null;
  constructor(private route: ActivatedRoute, private apiservice: ApiserviceService, private socket: SocketService, private storage: Storage) {}

  private map: any = null;
  private riderMarker: any = null;
  private vendorMarker: any = null;
  private customerMarker: any = null;
  private directionsService: any = null;
  private directionsRenderer: any = null;
  private geocoder: any = null;
  private mapReady: boolean = false;
  private orderReady: boolean = false;

  ngOnInit(): void {
    this.orderId = this.route.snapshot.paramMap.get('orderId');
    this.getOrderDetailOfPrticularOrder();
    // Connect and start listening for rider location updates
    this.socket.connect();
    this.joinAsCustomer();
    // Debug: log any socket events arriving to help diagnose
    this.socket.onAny().subscribe(({ event, data }) => {
      console.log('[Socket ANY]', event, data);
    });
    this.riderLocationSub = this.socket.on<any>('riderLocationUpdate').subscribe((payload) => {
      // Expected payload: { rider_id, lat, lng, order_id? }
      if (!payload) return;
      if (payload?.order_id && this.orderId && String(payload.order_id) !== String(this.orderId)) return;
      if (this.riderId && payload?.rider_id && String(payload.rider_id) !== String(this.riderId)) return;
      this.riderLat = Number(payload.lat);
      this.riderLng = Number(payload.lng);
      console.log('Rider live location:', this.riderLat, this.riderLng);
      this.updateRiderMarkerOnMap(payload?.rider_id, this.riderLat, this.riderLng);
    });
  }

  async ngAfterViewInit(): Promise<void> {
    await this.waitForGoogleMaps();
    const el = document.getElementById('map');
    if (el && !this.map && (window as any).google?.maps) {
      const defaultCenter = { lat: 20.5937, lng: 78.9629 }; // India fallback
      // @ts-ignore
      this.map = new google.maps.Map(el, { center: defaultCenter, zoom: 14, disableDefaultUI: true });
      this.hideMapPlaceholder();
      // Prepare services
      // @ts-ignore
      this.directionsService = new google.maps.DirectionsService();
      // @ts-ignore
      this.directionsRenderer = new google.maps.DirectionsRenderer({ suppressMarkers: true, preserveViewport: true });
      this.directionsRenderer.setMap(this.map);
      // @ts-ignore
      this.geocoder = new google.maps.Geocoder();
      this.mapReady = true;
      this.trySetupRoute();
    }
  }

  ngOnDestroy(): void {
    this.riderLocationSub?.unsubscribe();
  }

  callRider() {
    // Hook native dialer here
  }

  chatWithRider() {
    // Hook chat screen here
  }

  getOrderDetailOfPrticularOrder(){
    this.loading = true;
    this.apiservice.get_OrderDetail(this.orderId).subscribe({
      next: (response: any) => {
        const order = response?.data || response;
        this.order = order || null;
        this.view = this.order ? this.mapOrderForView(this.order) : null;
        this.notFound = !this.order;
        // Capture rider id if provided to filter socket updates
        this.riderId = this.order?.rider_id ?? null;
        // If backend expects joining a room, do it here
        if (this.orderId) {
          this.socket.joinOrderRoom(this.orderId);
        }
        if (this.riderId) {
          this.socket.joinRiderRoom(this.riderId);
        }
        this.orderReady = !!this.order;
        this.trySetupRoute();
      },
      error: () => {
        this.order = null;
        this.view = null;
        this.notFound = true;
      },
      complete: () => {
        this.loading = false;
      }
    })
  }

  private mapOrderForView(o: any) {
    const statusMap: Record<number | string, string> = {
      0: 'Pending',
      1: 'Preparing',
      2: 'On the way',
      3: 'Delivered',
      4: 'Cancelled'
    };
    const riderStatusMap: Record<number | string, string> = {
      0: 'Unassigned',
      1: 'Assigned',
      2: 'Picked up',
      3: 'Near you'
    };

    const statusVal = o?.order_status ?? o?.status;
    const status = statusMap[statusVal as number] || (typeof statusVal === 'string' ? statusVal : 'Order');
    const riderStatusVal = o?.rider_status;
    const riderStatus = riderStatusVal != null ? (riderStatusMap[riderStatusVal as number] || String(riderStatusVal)) : undefined;

    const storeName = o?.vendor?.store_name ?? o?.store_name;
    const storeAddress = o?.vendor?.store_address ?? o?.store_address;
    const vendorPhone = [o?.vendor_prefix, o?.vendor_phonenumber].filter(Boolean).join(' ');

    const deliveryAddress = o?.address?.address ?? o?.address;
    const floor = o?.floor ?? o?.address?.floor;
    const landmark = o?.landmark ?? o?.address?.landmark;

    const customerName = [o?.firstname, o?.lastname].filter(Boolean).join(' ');
    const customerPhone = [o?.prefix, o?.phonenumber].filter(Boolean).join(' ');

    const totalQty = o?.total_quantity;
    const totalPrice = o?.total_price;
    const id = o?.order_id ?? o?.id ?? null;
    const orderUid = o?.order_uid ?? undefined;
    const createdAt = o?.order_created_at ?? o?.created_at;
    const preparingTime = o?.preparing_time ?? undefined;
    const isFastDelivery = o?.is_fast_delivery === 1;
    const paymentMethod = o?.payment_method ?? undefined;

    const items = Array.isArray(o?.items) ? o.items.map((it: any) => ({
      order_item_id: it?.order_item_id,
      product_id: it?.product_id,
      product_name: it?.product_name,
      product_description: it?.product_description,
      product_price: it?.product_price,
      product_quantity: it?.product_quantity,
      total_item_price: it?.total_item_price,
      variant: it?.variant_type || it?.variant_value || it?.variant_price ? ({ type: it?.variant_type, value: it?.variant_value, price: it?.variant_price }) : null,
      addons: Array.isArray(it?.addons) ? it.addons.map((a: any) => ({ name: a?.name, price: a?.price })) : []
    })) : [];

    // Simple ETA heuristic: use preparing_time if present
    const etaMinutes = preparingTime ?? undefined;

    return {
      id,
      orderUid,
      status,
      riderStatus,
      storeName,
      storeAddress,
      vendorPhone,
      deliveryAddress,
      floor,
      landmark,
      customerName,
      customerPhone,
      createdAt,
      preparingTime,
      isFastDelivery,
      totalQuantity: totalQty,
      totalPrice,
      paymentMethod,
      etaMinutes,
      rider: o?.rider || null,
      items
    };
  }

  private async joinAsCustomer() {
    try {
      await this.storage.create();
      const userId = await this.storage.get('userID');
      if (userId) {
        this.socket.emit('join', { role: 'customer', customer_id: userId });
        console.log('[Socket JOIN] customer', userId);
      }
    } catch {}
  }

  private async updateRiderMarkerOnMap(riderId: any, lat: number | null, lng: number | null) {
    console.log('updateRiderMarkerOnMap ->', riderId, lat, lng);
    if (lat == null || lng == null) return;
    await this.waitForGoogleMaps();
    // Ensure map exists
    if (!this.map) {
      const el = document.getElementById('map');
      if (el && (window as any).google?.maps) {
        // @ts-ignore
        this.map = new google.maps.Map(el, { center: { lat, lng }, zoom: 15, disableDefaultUI: true });
        this.hideMapPlaceholder();
      }
    }
    if (!this.map || !(window as any).google?.maps) return;
    const pos = { lat, lng };
    if (!this.riderMarker) {
      // @ts-ignore
      this.riderMarker = new google.maps.Marker({
        position: pos,
        map: this.map,
        icon: {
          url: 'assets/pickup.svg',
          // @ts-ignore
          scaledSize: new google.maps.Size(36, 36)
        },
        title: 'Rider'
      });
      this.map.setCenter(pos);
    } else {
      this.riderMarker.setPosition(pos);
    }
  }

  private waitForGoogleMaps(): Promise<void> {
    return new Promise(resolve => {
      if ((window as any).google?.maps) return resolve();
      // Try to find an existing script
      const existing = document.getElementById('google-maps-js');
      if (!existing) {
        const script = document.createElement('script');
        script.id = 'google-maps-js';
        const key = (environment as any)?.googleMapsApiKey;
        const srcBase = 'https://maps.googleapis.com/maps/api/js';
        const params = key ? `?key=${encodeURIComponent(key)}` : '';
        script.src = `${srcBase}${params}`;
        script.async = true;
        script.defer = true;
        document.body.appendChild(script);
      }

      const start = Date.now();
      const maxWait = 15000; // 15s
      const t = setInterval(() => {
        if ((window as any).google?.maps || Date.now() - start > maxWait) {
          clearInterval(t);
          resolve();
        }
      }, 100);
    });
  }

  private trySetupRoute() {
    if (!this.mapReady || !this.orderReady || !this.view) return;
    const customerAddress = (this.view as any).deliveryAddress;
    const vendorAddress = (this.view as any).storeAddress;
    if (!customerAddress || !vendorAddress || !this.geocoder || !this.directionsService) return;
    // Geocode both addresses then draw route
    this.geocoder.geocode({ address: vendorAddress }, (vResults: any, vStatus: any) => {
      if (vStatus !== 'OK' || !vResults?.[0]) { console.warn('Vendor geocode failed', vStatus); return; }
      const vLoc = vResults[0].geometry.location;
      const vendorLatLng = { lat: vLoc.lat(), lng: vLoc.lng() };
      this.geocoder.geocode({ address: customerAddress }, (cResults: any, cStatus: any) => {
        if (cStatus !== 'OK' || !cResults?.[0]) { console.warn('Customer geocode failed', cStatus); return; }
        const cLoc = cResults[0].geometry.location;
        const custLatLng = { lat: cLoc.lat(), lng: cLoc.lng() };
        this.drawRoute(vendorLatLng, custLatLng);
      });
    });
  }

  private drawRoute(origin: {lat:number,lng:number}, destination: {lat:number,lng:number}) {
    if (!this.map || !this.directionsService || !this.directionsRenderer) return;
    // Place vendor and customer markers
    if (!this.vendorMarker) {
      // @ts-ignore
      this.vendorMarker = new google.maps.Marker({ position: origin, map: this.map, title: 'Vendor' });
    } else { this.vendorMarker.setPosition(origin); }
    if (!this.customerMarker) {
      // @ts-ignore
      this.customerMarker = new google.maps.Marker({ position: destination, map: this.map, title: 'Delivery' });
    } else { this.customerMarker.setPosition(destination); }

    const request = { origin, destination, travelMode: 'DRIVING' } as any;
    this.directionsService.route(request, (result: any, status: any) => {
      if (status === 'OK') {
        this.directionsRenderer.setDirections(result);
        const bounds = new (window as any).google.maps.LatLngBounds();
        bounds.extend(origin as any);
        bounds.extend(destination as any);
        this.map.fitBounds(bounds);
      } else {
        console.warn('Directions failed:', status);
      }
    });
  }

  private hideMapPlaceholder() {
    const placeholder = document.querySelector('.map-placeholder') as HTMLElement | null;
    if (placeholder) {
      placeholder.style.display = 'none';
    }
  }
}


