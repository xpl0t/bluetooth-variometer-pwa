import { TestBed } from '@angular/core/testing';

import { BluetoothConnectionService } from './bluetooth-connection.service';

describe('BluetoothConnectionService', () => {
  let service: BluetoothConnectionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BluetoothConnectionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
