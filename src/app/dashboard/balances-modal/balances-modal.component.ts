import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';

@Component({
  selector: 'app-balances-modal',
  templateUrl: './balances-modal.component.html',
  styleUrls: ['./balances-modal.component.css'],
})
export class BalancesModalComponent implements OnInit {
  @Input() display: boolean = false;
  @Output() close = new EventEmitter<void>();

  balances: any[] = [];

  constructor() {}

  ngOnInit(): void {
    this.loadBalances();
  }

  loadBalances(): void {
    /*this.stripeService.getBalances().subscribe((data) => {
      this.balances = data;
    });*/
    console.log('Balances loaded');
  }

  closeModal(): void {
    this.close.emit();
  }
}
