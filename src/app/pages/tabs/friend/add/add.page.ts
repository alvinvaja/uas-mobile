import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { User } from 'src/app/models/user.model';
import { UserService } from 'src/app/services/user.service';
import { map } from 'rxjs/operators';
import { ToastController } from '@ionic/angular';
import { threadId } from 'worker_threads';

@Component({
  selector: 'app-add',
  templateUrl: './add.page.html',
  styleUrls: ['./add.page.scss'],
})
export class AddPage implements OnInit {
  searchQuery: string;
  currentEmail: string;
  users: User[];
  userSearch: User;
  currentUser: User;
  firstSearch: boolean;
  found: boolean;
  isFriend: boolean;
  isSelf: boolean;

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
      this.userService.getAllUsers().subscribe(res => {
        this.users = res;
        res.forEach(data => {
          if (data.email === this.currentEmail) {
            this.currentUser = data;
          }
        });
      });
    }, 200);
  }

  ngOnInit() {
    this.searchQuery = this.currentEmail =  '';
    this.users = [];
    this.firstSearch = this.found = this.isFriend = this.isSelf = false;
    this.userSearch = this.currentUser = { id: '', name: '', nim: '', email: '', lat: 0, long: 0, photo: '../../../assets/icon/avatar.svg'};
  }

  goBack() {
    this.router.navigateByUrl('tabs/friend');
  }

  searchFriend() {
    this.firstSearch = true;
    let count = 0;
    this.users.forEach(data => {
      if (data.nim === this.searchQuery) {
        this.userSearch = data;
        count++;
      }
    });

    if (count > 0) {
      this.found = true;

      if (this.userSearch.nim === this.currentUser.nim) {
        this.isSelf = true;
        this.isFriend = false;
      } else {
        this.isSelf = false;
        this.checkIsFriend();
      }
    } else {
      this.found = false;
    }
  }

  checkIsFriend() {
    this.isFriend = false;

    const dataFriend = this.db.collection('users').doc(this.currentUser.id).collection('friends').snapshotChanges().pipe(
      map((actions) => {
        return actions.map((a) => {
          const data = a.payload.doc.data();
          const id = a.payload.doc.id;
          return { id, ...data };
        });
      })
    );

    dataFriend.subscribe(friendID => {
      friendID.forEach(idFriend => {
        if (idFriend.id === this.userSearch.id) {
          this.isFriend = true;
          this.isSelf = false;
        }
      });
    });
  }

  addFriend() {
    const currentID = this.currentUser.id;
    const targetID = this.userSearch.id;

    this.db.collection('users').doc(currentID).collection('friends').add({
      id: targetID
    }).then(res => {
      console.log(res);
    });

    this.db.collection('users').doc(targetID).collection('friends').add({
      id: currentID
    }).then(res => {
      console.log(res);
    });

    this.presentToast();

    this.router.navigateByUrl('tabs/friend');
  }

  async presentToast() {
    const toast = await this.toastCtrl.create({
      message: 'Add Friend Successful',
      duration: 1000
    });

    return await toast.present();
  }
}
