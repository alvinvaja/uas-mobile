import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  validations_form: FormGroup;
  errorMessage: string = '';

  validation_messages = {
    email: [
      { type: 'required', message: 'Email is required.' },
      { type: 'pattern', message: 'Enter a valid email.' }
    ],
    password: [
      { type: 'required', message: 'Password is required.' }
    ]
  };

  constructor(
    private authSrv: AuthService,
    private formBuilder: FormBuilder,
    private router: Router,
    private toastCtrl: ToastController
  ) { }

  ngOnInit() {
    this.validations_form = this.formBuilder.group({
      email: new FormControl('', Validators.compose([
        Validators.required,
        Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')
      ])),
      password: new FormControl('', Validators.compose([
        Validators.minLength(5),
        Validators.required
      ]))
    });
  }

  loginUser(value) {
    this.authSrv.loginUser(value)
      .then(res => {
        console.log(res);
        this.errorMessage = '';
        this.presentToast();
        localStorage.setItem('email', value.email);
      }, err => {
        this.errorMessage = err.message;
      });
  }

  goToRegisterPage() {
    this.router.navigateByUrl('/register');
  }

  async presentToast() {
    const toast = await this.toastCtrl.create({
      message: 'Login Successful!',
      duration: 1000
    });

    await toast.present();
  }
}
