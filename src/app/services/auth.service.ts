import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private fireAuth: AngularFireAuth) { }

  registerUser(value: any) {
    return new Promise<any>( (resolve, reject) => {
      this.fireAuth.createUserWithEmailAndPassword(value.email, value.password)
        .then(
          res => resolve(res),
          err => reject(err)
        );
    });
  }

  loginUser(value: any) {
    return new Promise<any>( (resolve, reject) => {
      this.fireAuth.signInWithEmailAndPassword(value.email, value.password)
        .then(
          res => resolve(res),
          err => reject(err)
        );
    });
  }

  logoutUser() {
    return new Promise( (resolve, reject) => {
      if (this.fireAuth.currentUser) {
        this.fireAuth.signOut()
          .then((res) => {
            console.log('Log Out');
            resolve(res);
          }).catch((error) => {
            reject(error);
          });
      }
    });
  }
}
