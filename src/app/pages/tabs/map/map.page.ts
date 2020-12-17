import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as mapboxgl from 'mapbox-gl';
import { User } from 'src/app/models/user.model';
import { UserService } from 'src/app/services/user.service';
import { environment } from 'src/environments/environment';
import { take, map } from 'rxjs/operators';
import { AngularFirestore } from '@angular/fire/firestore';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-map',
  templateUrl: './map.page.html',
  styleUrls: ['./map.page.scss'],
})
export class MapPage implements OnInit {
  map: mapboxgl.Map;
  style = 'mapbox://styles/mapbox/streets-v11';
  currentUser: User;
  currentEmail: string;
  users: User[];
  friends: User[];

  constructor(
    private router: Router,
    private userService: UserService,
    private db: AngularFirestore,
    private toastCtrl: ToastController
  ) {
    if (localStorage.getItem('email') === null) {
      router.navigateByUrl('login');
    }

    setInterval(() => {
      this.currentEmail = localStorage.getItem('email') !== null ? localStorage.getItem('email') : '';
    }, 200);

    setInterval(() => { // auto check in current location every 10 minute
      navigator.geolocation.getCurrentPosition(pos => {
        this.db.collection('users').doc(this.currentUser.id).update({
          lat: pos.coords.latitude,
          long: pos.coords.longitude
        });
      });
    }, 600000);
  }

  ngOnInit() {
    this.currentEmail = '';
    this.users = this.friends = [];
    this.currentUser = { id: '', name: '', nim: '', email: '', lat: 0, long: 0, photo: '../../../assets/icon/avatar.svg'};
  }

  ionViewWillEnter() {
    this.userService.getAllUsers().pipe(take(1)).subscribe(res => {
      this.users = res;
      res.forEach(data => {
        if (data.email === this.currentEmail) {
          this.currentUser = data;

          this.map = new mapboxgl.Map({
            accessToken: environment.mapbox.accessToken,
            container: 'map',
            style: this.style,
            zoom: 14,
            center: [this.currentUser.long, this.currentUser.lat]
          });

          this.map.addControl(new mapboxgl.NavigationControl());

          const marker = new mapboxgl.Marker({
            color: '#000000'
          }).setLngLat([this.currentUser.long, this.currentUser.lat]).addTo(this.map);

          const popup = new mapboxgl.Popup().setLngLat([this.currentUser.long, this.currentUser.lat]).setText('You').addTo(this.map);

          const idUser = this.currentUser.id;
          const dataFriend = this.db.collection('users').doc(idUser).collection('friends').snapshotChanges().pipe(
            map((actions) => {
              return actions.map((a) => {
                const datas = a.payload.doc.data();
                const id = a.payload.doc.id;
                return { id, ...datas };
              });
            })
          );

          dataFriend.subscribe(friendID => {
            const listID = [];
            friendID.forEach(idFriend => {
              listID.push(idFriend.id);
            });
            this.friends = this.users.filter((item) => {
              return listID.indexOf(item.id) !== -1;
            });
            this.friends.forEach(temen => {
              const markerFriend = new mapboxgl.Marker({
                color: '#FF0000'
              }).setLngLat([temen.long, temen.lat]).addTo(this.map);

              const popupFriend = new mapboxgl.Popup().setLngLat([temen.long, temen.lat]).
                setText(temen.name).addTo(this.map);
            });
          });
        }
      });
    });
  }

  checkIn() {
    this.presentToast();
    navigator.geolocation.getCurrentPosition(pos => {
      this.db.collection('users').doc(this.currentUser.id).update({
        lat: pos.coords.latitude,
        long: pos.coords.longitude
      });
    });
  }

  goToCenter() {
    navigator.geolocation.getCurrentPosition(pos => {
      this.map.flyTo({
        center: [pos.coords.longitude, pos.coords.latitude]
      });
    });
  }

  async presentToast() {
    const toast = await this.toastCtrl.create({
      message: 'Your current location is updated',
      duration: 1000
    });

    return await toast.present();
  }
}
