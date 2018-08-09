import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

import firebase from 'firebase';
import { LoginPage } from '../login/login';

@Component({
  selector: 'page-feed',
  templateUrl: 'feed.html',
})
export class FeedPage {
  text:string="";
  posts: any[] = [];


  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.getPosts();
  }
  //get posts from the cloud
  getPosts(){
    firebase.firestore().collection("posts").get()
    .then((data) =>{

      data.forEach((document) => {
        this.posts.push(document);
      })
      console.log(this.posts);
      
    }).catch((err) =>{
      console.log(err);
      
    });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad FeedPage');
  }
  postUpdate(){
    firebase.firestore().collection("posts").add({
      text: this.text,
      created: firebase.firestore.FieldValue.serverTimestamp(),
      owner: firebase.auth().currentUser.uid,
      owner_name:firebase.auth().currentUser.displayName
    }).then((doc) => {
      console.log(doc);
      
    }).catch((err) =>{
      console.log(err);
      
    })
  }
  logOut(){
    this.navCtrl.push(LoginPage);
  }

}
