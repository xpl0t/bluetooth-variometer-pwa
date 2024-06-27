import { AsyncPipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { BluetoothConnectionService } from '@app-shared/bluetooth-connection';
import { filter, throttleTime } from 'rxjs';

@Component({
  selector: 'app-meters',
  standalone: true,
  imports: [
    AsyncPipe,
    DecimalPipe
  ],
  templateUrl: './meters.component.html',
  styleUrl: './meters.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MetersComponent {

  private readonly btSv = inject(BluetoothConnectionService);

  public readonly altitude$ = this.btSv.altitude.pipe(
    throttleTime(200)
  );

  public readonly preassure$ = this.btSv.preasure.pipe(
    throttleTime(200)
  );

  public readonly vario$ = this.btSv.vario.pipe(
    throttleTime(200)
  );

  public readonly temperature$ = this.btSv.temperature.pipe(
    throttleTime(200)
  );

  public readonly batteryStatus$ = this.btSv.batteryStatus.pipe(
    throttleTime(200)
  );

}
