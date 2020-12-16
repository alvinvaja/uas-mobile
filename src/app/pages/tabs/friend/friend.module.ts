import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FriendPageRoutingModule } from './friend-routing.module';

import { FriendPage } from './friend.page';
import { FilterPipe } from 'src/app/filter.pipe';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    FriendPageRoutingModule
  ],
  declarations: [FriendPage, FilterPipe]
})
export class FriendPageModule {}
