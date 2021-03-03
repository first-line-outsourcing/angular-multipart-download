import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';

import { TransferService } from './transfer.service';

@Component({
  selector: 'md-root',
  template: `
    <label for="link">
      Paste your link here
      <input id="link" type="url" [formControl]="link">
    </label>
    <p>
      <button (click)="transfer()">Transfer</button>
    </p>
  `,
  styles: []
})
export class AppComponent {
  link = new FormControl();

  constructor(private transferService: TransferService) {
  }

  async transfer() {
    await this.transferService.transferFile(this.link.value);
  }
}
