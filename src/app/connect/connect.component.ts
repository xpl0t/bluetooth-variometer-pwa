import { ChangeDetectionStrategy, Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BluetoothConnectionService } from '@app-shared/bluetooth-connection';

@Component({
  selector: 'app-connect',
  standalone: true,
  templateUrl: './connect.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConnectComponent {

  private readonly btSv = inject(BluetoothConnectionService);
  private readonly destroyRef = inject(DestroyRef);

  public connect(): void {
    this.btSv.connect('stodeus').pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: () => {
        console.log('Connected');
      },
      error: e => {
        console.error('Failed to connect', e);
      }
    })
  }

}
