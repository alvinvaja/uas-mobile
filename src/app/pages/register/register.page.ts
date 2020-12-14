import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {
  validations_form: FormGroup;
  errorMessage: string = '';
  passwordDiff: boolean;

  validation_messages = {
    firstname: [
      { type: 'required', message: 'First name is required.'}
    ],
    lastname: [
      { type: 'required', message: 'Last name is required.'}
    ],
    nim: [
      { type: 'required', message: 'NIM is required'}
    ],
    email: [
      { type: 'required', message: 'Email is required.' },
      { type: 'pattern', message: 'Enter a valid email.' }
    ],
    password: [
      { type: 'required', message: 'Password is required.' }
    ],
    confirmpassword: [
      { type: 'required', message: 'Confirm Password is required.'}
    ]
  };

  constructor(
    private authSrv: AuthService,
    private formBuilder: FormBuilder,
    private router: Router,
    private toastCtrl: ToastController,
    private db: AngularFirestore
  ) { }

  ngOnInit() {
    this.passwordDiff = false;
    this.validations_form = this.formBuilder.group({
      email: new FormControl('', Validators.compose([
        Validators.required,
        Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')
      ])),
      password: new FormControl('', Validators.compose([
        Validators.minLength(5),
        Validators.required
      ])),
      firstname: new FormControl('', Validators.compose([
        Validators.required
      ])),
      lastname: new FormControl('', Validators.compose([
        Validators.required
      ])),
      nim: new FormControl('', Validators.compose([
        Validators.required
      ])),
      confirmpassword: new FormControl('', Validators.compose([
        Validators.required
      ]))
    });
  }

  registerUser(value) {
    if (value.password !== value.confirmpassword) {
      this.passwordDiff = true;
      return;
    }
    this.passwordDiff = false;
    this.authSrv.registerUser(value)
      .then(res => {
        this.errorMessage = '';
        this.presentToast();
        this.addNewUser(value);
        this.router.navigateByUrl('login');
      }, err => {
        this.errorMessage = err.message;
      });
  }

  addNewUser(value) {
    const name = value.firstname + ' ' + value.lastname;
    const nim = value.nim;
    const email = value.email;
    const lat = 0;
    const long = 0;
    const photo = '../../../assets/icon/avatar.svg';

    this.db.collection('users').add({
      name: name,
      email: email,
      nim: nim,
      lat: lat,
      long: long,
      photo: photo
    });
  }

  async presentToast() {
    const toast = await this.toastCtrl.create({
      message: 'User Registered Successfully',
      duration: 1000
    });

    await toast.present();
  }

  goToLoginPage() {
    this.router.navigateByUrl('login');
  }
}
