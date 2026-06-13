import { Component, OnInit ,inject} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { VehicleService } from '../../../../core/services/vehicle.service';
import { RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BookingService } from '../../../../core/services/booking.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-vehicle-details',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './vehicle-details.html',
  styleUrl: './vehicle-details.css'
})
export class VehicleDetails implements OnInit {
  private fb = inject(FormBuilder);
  
  vehicle: any;
  loading = true;
  bookingLoading = false;
  bookedDates: any[] = [];
  constructor(
    private route: ActivatedRoute,
    private vehicleService: VehicleService,
    private bookingService: BookingService,
    private router: Router
  ) {}
    bookingForm = this.fb.group({
      start_date: ['', Validators.required],
      end_date: ['', Validators.required]
    });
  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.vehicleService.getVehicleById(id).subscribe({
      next: (data) => {
        this.vehicle = data;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
    this.vehicleService.getBookedDates(id).subscribe({
  next: data => {
    this.bookedDates = data;
  }
});
  }
  get totalPrice(): number {

  if (!this.vehicle) return 0;

  const start = this.bookingForm.value.start_date;
  const end = this.bookingForm.value.end_date;

  if (!start || !end) return 0;

  const startDate = new Date(start + 'T00:00:00');
  const endDate = new Date(end + 'T00:00:00');
  const diffMs = endDate.getTime() - startDate.getTime();

  const days = Math.max(
    Math.ceil(diffMs / (1000 * 60 * 60 * 24)),
    1
  );

  return days * this.vehicle.price_per_day;
}
bookVehicle(): void {

  if (this.bookingForm.invalid) {
    this.bookingForm.markAllAsTouched();
    return;
  }

  this.bookingLoading = true;

  this.bookingService.createBooking({
    vehicle_id: this.vehicle.id,
    start_date: this.bookingForm.value.start_date,
    end_date: this.bookingForm.value.end_date
  })
  .subscribe({
    next: () => {
      this.router.navigate(['/my-bookings']);
    },
    error: err => {

      this.bookingLoading = false;

      alert(
        err.error?.detail ??
        'Booking failed'
      );
    }
  });
}
}