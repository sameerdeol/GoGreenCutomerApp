import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { ApiserviceService } from '../services/apiservice.service';
import { Storage } from '@ionic/storage-angular';
import { CommonHeaderComponent } from "../components/common-header/common-header.component";

@Component({
  selector: 'app-parcel-detail',
  templateUrl: './parcel-detail.page.html',
  styleUrls: ['./parcel-detail.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, CommonHeaderComponent]
})
export class ParcelDetailPage implements OnInit {
  parcel: any;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private api: ApiserviceService,
    private storage: Storage
  ) {}

  async ngOnInit() {
    await this.storage.create();
    const id = this.route.snapshot.paramMap.get('id');
    const user_id = await this.storage.get('userID');
    if (id && user_id) {
      this.api.get_pick_drop_by_id(user_id, id).subscribe((res) => {
        this.parcel = res?.parcels || res?.parcel || res?.data || res;
        this.loading = false;
      }, _ => { this.loading = false; });
    } else {
      this.loading = false;
    }
  }

  getParcelStatusText(status: number | null | undefined): string {
    if (status == null || status === 0) return 'Pending';
    if (status === 1) return 'Confirmed';
    if (status === 2) return 'Out for Delivery';
    if (status === 3) return 'Cancelled';
    return '';
  }
}


