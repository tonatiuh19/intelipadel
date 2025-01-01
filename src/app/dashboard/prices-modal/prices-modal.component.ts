import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { fromLanding } from '../../shared/store/selectors';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';
import { LandingActions } from '../../shared/store/actions';
import { Price, PricesState } from '../../home/home.model';
import {
  formatDateString,
  formatTime,
} from '../../shared/utils/help-functions';
import {
  faTrashAlt,
  faPlus,
  faPencil,
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-prices-modal',
  templateUrl: './prices-modal.component.html',
  styleUrls: ['./prices-modal.component.css'],
})
export class PricesModalComponent implements OnInit, OnChanges {
  @Input() display: boolean = false;
  @Output() close = new EventEmitter<void>();

  public selectUser$ = this.store.select(fromLanding.selectUser);
  public selectPrices$ = this.store.select(fromLanding.selectPrices);

  fomatTime = formatTime;
  formatDateString = formatDateString;

  prices: PricesState | undefined;

  platformsId: number = 0;

  confirmDeleteDialog: boolean = false;
  priceToDelete: Price | null = null;

  faTrashAlt = faTrashAlt;
  faPlus = faPlus;
  faPencil = faPencil;

  private unsubscribe$ = new Subject<void>();

  constructor(private store: Store) {}

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['display'] && this.display) {
      this.loadPricesData();
    }
  }

  loadPricesData() {
    this.selectUser$.pipe(takeUntil(this.unsubscribe$)).subscribe((user) => {
      this.platformsId = user.id_platforms;
      this.store.dispatch(
        LandingActions.getPricesByIdWeb({
          id_platforms: user.id_platforms,
        })
      );
    });

    this.selectPrices$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((prices) => {
        console.log(prices);
        this.prices = prices;
      });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  closeDialog() {
    this.display = false;
    this.close.emit();
  }

  confirmDeleteSpecialPrice(price: Price) {
    this.priceToDelete = price;
    this.confirmDeleteDialog = true;
  }

  closeConfirmDeleteDialog() {
    this.confirmDeleteDialog = false;
    this.priceToDelete = null;
  }

  deleteSpecialPrice() {
    if (this.priceToDelete) {
      console.log('delete', this.priceToDelete);
      this.closeConfirmDeleteDialog();
    }
  }
}
