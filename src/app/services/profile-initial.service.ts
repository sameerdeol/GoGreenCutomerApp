import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class ProfileInitialService {

  constructor() { }

  private userInitialSubject = new BehaviorSubject<string>('');
  userInitial$ = this.userInitialSubject.asObservable();

  setUserInitial(initial: string) {
    this.userInitialSubject.next(initial);
  }
}
