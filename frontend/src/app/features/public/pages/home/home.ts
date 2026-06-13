import { Component ,inject} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
private fb = inject(FormBuilder);

  constructor(
    private router: Router
  ) {}

  searchForm = this.fb.group({
    start_date: [''],
    end_date: ['']
  });

  searchVehicles(): void {

    const start = this.searchForm.value.start_date;
    const end = this.searchForm.value.end_date;

    if (!start || !end) {
      alert('Please select start and end dates');
      return;
    }

    this.router.navigate(
      ['/fleet'],
      {
        queryParams: {
          start_date: start,
          end_date: end
        }
      }
    );
  }

}