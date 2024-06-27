import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterOutlet } from '@angular/router';
import { BluetoothConnectionService } from '@app-shared/bluetooth-connection';
import { distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {

  private readonly router = inject(Router);
  private readonly btSv = inject(BluetoothConnectionService);

  public constructor() {
    this.btSv.connected.pipe(
      // distinctUntilChanged(),
      takeUntilDestroyed()
    ).subscribe(c => {
      this.router.navigate([ c ? 'meters' : 'connect' ]);
    });
  }

}
