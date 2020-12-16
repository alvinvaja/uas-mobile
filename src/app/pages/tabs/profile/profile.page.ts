import { Component, ElementRef, OnInit, SecurityContext, ViewChild } from '@angular/core';
import { User } from 'src/app/models/user.model';
import { UserService } from 'src/app/services/user.service';
import { take } from 'rxjs/operators';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';

import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { LoadingController, Platform} from '@ionic/angular';
import { Camera, CameraResultType, CameraSource, Capacitor } from '@capacitor/core';
import firebase from 'firebase/app';
import { NgForm } from '@angular/forms';
import { AngularFirestore } from '@angular/fire/firestore';
import { QuoteService } from 'src/app/services/quote.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  @ViewChild('filePicker', {static: false}) filePickerRef: ElementRef<HTMLInputElement>;
  photo: SafeResourceUrl;
  user: User;
  currentEmail: string;
  quote: any;

  @ViewChild('f', null) f: NgForm;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private router: Router,
    private platform: Platform,
    private sanitizer: DomSanitizer,
    private db: AngularFirestore,
    private loadCtrl: LoadingController,
    private quoteService: QuoteService
  ) {
    if (localStorage.getItem('email') === null) {
      router.navigateByUrl('login');
    }
  }

  ngOnInit() {
    this.currentEmail = localStorage.getItem('email') !== null ? localStorage.getItem('email') : '';
    this.user = { id: '', name: '', nim: '', email: '', lat: 0, long: 0, photo: '../../../assets/icon/avatar.svg'};
    this.quote = this.quoteService.getRandomQuote();
    this.userService.getAllUsers().subscribe(res => {
      res.forEach(data => {
        if (data.email === this.currentEmail) {
          this.user = data;
        }
      });
    });
  }

  updateProfilePhoto() {
    this.filePickerRef.nativeElement.click();
  }

  onFileChoose(event: Event) {
    const file = (event.target as HTMLInputElement).files[0];
    const pattern = /image-*/;
    const reader = new FileReader();

    if (!file.type.match(pattern)) {
      console.log('File format not supported');
      return;
    }

    reader.onload = () => {
      this.photo = reader.result.toString();

      const url = this.sanitizer.sanitize(SecurityContext.RESOURCE_URL, this.photo);
      const imgBlob = this.convertDataUrltoBlob(url);
      const imgName = this.getRandomString();

      this.uploadToStorage(imgBlob, imgName, 'imageUser').then(
        snapshot => {
          snapshot.ref.getDownloadURL().then(downloadUrl => {
            this.presentLoading();
            this.user.photo = downloadUrl;
            this.db.collection('users').doc(this.user.id).update({
              photo: downloadUrl
            });
          }, error => {
            console.log(error);
          });
        }
      );
    };

    reader.readAsDataURL(file);
  }

  convertDataUrltoBlob(url: any) {
    const binary = atob(url.split(',')[1]);

    const array = [];

    for (let i  = 0; i < binary.length; i++) {
      array.push(binary.charCodeAt(i));
    }

    return new Blob([new Uint8Array(array)], {type: 'image/jpeg'});
  }

  uploadToStorage(imageBlob: any, imageName: string, refPath: string) {
    const fileRef = firebase.storage().ref(refPath + '/' + imageName);
    const uploadTask = fileRef.put(imageBlob);

    return uploadTask;
  }

  getRandomString() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';

    for (let i = 0; i < 20; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return result;
  }

  logOut() {
    this.authService.logoutUser()
      .then(res => {
        localStorage.removeItem('email');
        this.router.navigateByUrl('login');
      }, err => {
        console.log(err);
      });
  }

  async presentLoading() {
    const loading = await this.loadCtrl.create({
      message: 'Please wait...',
      duration: 1000
    });

    await loading.present();
  }

  getQuote() {
    this.quote = this.quoteService.getRandomQuote();
  }
}
