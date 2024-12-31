import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  OnDestroy,
  Output,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';
import { LandingActions } from '../../shared/store/actions';
import { fromLanding } from '../../shared/store/selectors';
import {
  faPlusCircle,
  faTrashAlt,
  faPencilAlt,
} from '@fortawesome/free-solid-svg-icons';
import { AdsModel } from '../../home/home.model';

@Component({
  selector: 'app-ads-modal',
  templateUrl: './ads-modal.component.html',
  styleUrls: ['./ads-modal.component.css'],
})
export class AdsModalComponent implements OnInit, OnDestroy {
  @Input() display: boolean = false;
  @Output() close = new EventEmitter<void>();

  public selectUser$ = this.store.select(fromLanding.selectUser);
  public selectAds$ = this.store.select(fromLanding.selectAds);

  faPlusCircle = faPlusCircle;
  faTrashAlt = faTrashAlt;
  faPencilAlt = faPencilAlt;

  platformsId: number = 0;

  ads: AdsModel[] = [];
  currentStep: number = 1;
  adForm!: FormGroup;
  editingAd: AdsModel | null = null; // Store the ad being edited
  deletingAd: AdsModel | null = null; // Store the ad being deleted

  private unsubscribe$ = new Subject<void>();

  constructor(private store: Store, private fb: FormBuilder) {
    this.adForm = this.fb.group({
      platforms_ad_title: ['', Validators.required],
      platforms_ad_image: ['', Validators.required],
      active: ['', Validators.required],
    });
  }

  ngOnInit() {
    this.selectUser$.pipe(takeUntil(this.unsubscribe$)).subscribe((user) => {
      this.platformsId = user.id_platforms;
      this.store.dispatch(
        LandingActions.getAdsByIdWeb({
          id_platform: user.id_platforms,
        })
      );
    });

    this.selectAds$.pipe(takeUntil(this.unsubscribe$)).subscribe((ads) => {
      this.ads = ads;
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  nextStep() {
    this.currentStep = 2;
  }

  previousStep() {
    this.currentStep = 1;
    this.editingAd = null; // Reset the editing ad
    this.deletingAd = null; // Reset the deleting ad
    this.adForm.reset(); // Reset the form
  }

  onSubmit() {
    if (this.adForm.valid) {
      if (this.editingAd) {
        // Update the existing ad
        console.log('Updating ad:', this.adForm.value);
        this.store.dispatch(
          LandingActions.updateAdWeb({
            id_platforms_ad: this.editingAd.id_platforms_ad,
            platforms_ad_title: this.adForm.value.platforms_ad_title,
            active: this.adForm.value.active,
            platforms_ad_image: this.adForm.value.platforms_ad_image,
          })
        );
      } else {
        // Add a new ad
        console.log('Adding ad:', this.adForm.value);
        this.store.dispatch(
          LandingActions.insertAdWeb({
            id_platform: this.platformsId,
            platforms_ad_title: this.adForm.value.platforms_ad_title,
            active: this.adForm.value.active,
            platforms_ad_image: this.adForm.value.platforms_ad_image,
          })
        );
      }
      this.adForm.reset();
      this.previousStep(); // Return to the ads table step
    } else {
      // Mark all fields as touched to trigger validation messages
      this.adForm.markAllAsTouched();
    }
  }

  editAd(ad: AdsModel) {
    this.editingAd = ad;
    this.adForm.patchValue(ad); // Populate the form with ad data
    this.nextStep(); // Go to the next step
  }

  confirmDeleteAd(ad: AdsModel) {
    this.deletingAd = ad;
    this.currentStep = 3; // Go to the delete confirmation step
  }

  deleteAd() {
    if (this.deletingAd) {
      console.log('Deleting ad:', this.deletingAd);
      this.store.dispatch(
        LandingActions.deleteAdWeb({
          id_platforms_ad: this.deletingAd.id_platforms_ad,
          active: 0,
        })
      );
    }
    this.deletingAd = null;
    this.previousStep(); // Return to the ads table step
  }

  closeDialog() {
    this.display = false;
    this.currentStep = 1; // Reset to the first step
    this.editingAd = null; // Reset the editing ad
    this.deletingAd = null; // Reset the deleting ad
    this.adForm.reset(); // Reset the form
    this.close.emit();
  }

  onDialogHide() {
    this.currentStep = 1; // Reset to the first step when the dialog is hidden
    this.editingAd = null; // Reset the editing ad
    this.deletingAd = null; // Reset the deleting ad
    this.adForm.reset(); // Reset the form
  }

  onFileChange(event: any) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.adForm.patchValue({
        platforms_ad_image: file,
      });
    }
  }
}
