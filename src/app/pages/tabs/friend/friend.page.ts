import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { User } from 'src/app/models/user.model';
import { UserService } from 'src/app/services/user.service';
import { map, take, startWith } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-friend',
  templateUrl: './friend.page.html',
  styleUrls: ['./friend.page.scss'],
})
export class FriendPage implements OnInit {
  formControl = new FormControl();
  user: User;
  users: User[];
  currentEmail: string;
  searchQuery: string;
  friends: User[];

  constructor(
    private userService: UserService,
    private db: AngularFirestore,
    private router: Router
  ) {
    if (localStorage.getItem('email') === null) {
      router.navigateByUrl('login');
    }

    setInterval(() => {
      this.currentEmail = localStorage.getItem('email') !== null ? localStorage.getItem('email') : '';
    }, 200);
  }

  ngOnInit() {
    this.friends = this.users = [];
    this.searchQuery = '';
    this.currentEmail = localStorage.getItem('email') !== null ? localStorage.getItem('email') : '';
    this.user = { id: '', name: '', nim: '', email: '', lat: 0, long: 0, photo: '../../../assets/icon/avatar.svg'};
    this.userService.getAllUsers().subscribe(res => {
      this.users = res;
      res.forEach(data => {
        if (data.email === this.currentEmail) {
          this.user = data;

          const idUser = this.user.id;
          const dataFriend = this.db.collection('users').doc(idUser).collection('friends').snapshotChanges().pipe(
            map((actions) => {
              return actions.map((a) => {
                const datas = a.payload.doc.data();
                const id = a.payload.doc.id;
                return { id, ...datas };
              });
            })
          );

          dataFriend.pipe(take(1)).subscribe(friendID => {
            const listID = [];
            friendID.forEach(idFriend => {
              listID.push(idFriend.id);
            });
            this.friends = this.users.filter((item) => {
              return listID.indexOf(item.id) !== -1;
            });
          });
        }
      });
    });
  }
}
