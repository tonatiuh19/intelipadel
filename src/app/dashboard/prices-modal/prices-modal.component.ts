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
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

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

  isSpecialPrice: boolean = false;

  currentStep: number = 1;
  specialPriceForm!: FormGroup;

  faTrashAlt = faTrashAlt;
  faPlus = faPlus;
  faPencil = faPencil;

  private unsubscribe$ = new Subject<void>();

  constructor(private store: Store, private fb: FormBuilder) {
    this.specialPriceForm = this.fb.group({
      price: ['', Validators.required],
      date: ['', Validators.required],
      start_time: ['', Validators.required],
      end_time: ['', Validators.required],
    });
  }

  ngOnInit() {
    if (this.display) {
      this.loadPricesData();
    }
  }

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
        this.prices = prices;
        this.isSpecialPrice = (this.prices?.specialPrices?.length ?? 0) >= 1;
        console.log('prices', this.prices);
        console.log(
          'isSpecialPrice',
          this.isSpecialPrice,
          this.prices?.specialPrices?.length
        );
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
      this.store.dispatch(
        LandingActions.updatePriceByIdWeb({
          id_platforms_fields_price:
            this.priceToDelete.id_platforms_fields_price,
          active: 0,
        })
      );
      this.closeConfirmDeleteDialog();
    }
  }

  nextStep() {
    this.currentStep = 2;
  }

  previousStep() {
    this.currentStep = 1;
  }

  onSubmitSpecialPrice() {
    if (this.specialPriceForm.valid) {
      const date = this.specialPriceForm.value.date;
      const startTime = `${date} ${this.specialPriceForm.value.start_time}:00`;
      const endTime = `${date} ${this.specialPriceForm.value.end_time}:00`;

      const specialPrice = {
        id_platforms: this.platformsId,
        price: this.specialPriceForm.value.price,
        platforms_fields_price_start_time: startTime,
        platforms_fields_price_end_time: endTime,
        active: 2,
      };

      console.log(specialPrice);
      this.store.dispatch(LandingActions.insertPriceWeb(specialPrice));

      this.specialPriceForm.reset();
      this.previousStep();
    } else {
      this.specialPriceForm.markAllAsTouched();
    }
  }
}
