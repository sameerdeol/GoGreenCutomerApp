import { Component, OnInit, Renderer2 } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-location',
  templateUrl: './select-location.page.html',
  styleUrls: ['./select-location.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule],
})
export class SelectLocationPage implements OnInit {
  
  constructor(private renderer: Renderer2) {}

  ngOnInit() {
    const button = document.getElementById('loc_manual');
    const targetElement = document.querySelector('.location_white_bg2');
    const overlayElement = document.querySelector('.map-container');

    if (button && targetElement && overlayElement) {
      button.addEventListener('click', () => {
        this.renderer.addClass(targetElement, 'select_loc');
        this.renderer.addClass(overlayElement, 'black_overlay');
      });

      // Listen for clicks on the ".select_loc:after" pseudo-element
      targetElement.addEventListener('click', (event) => {
        if ((event.target as HTMLElement).classList.contains('select_loc')) {
          this.renderer.removeClass(targetElement, 'select_loc');
          this.renderer.removeClass(overlayElement, 'black_overlay');
        }
      });
    }
  }
}
