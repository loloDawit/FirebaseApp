import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import firebase from 'firebase';


@Component({
  selector: 'page-signup',
  templateUrl: 'signup.html',
})
export class SignupPage {

  name:string = "";
  email:string = "";
  password:string = "";

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SignupPage');
  }
  //reroute to the sign in page
  goBackToSignInPage(){
    this.navCtrl.pop();
  }

  // sign up page
  signUp(){
    firebase.auth().createUserWithEmailAndPassword(this.email,this.password).then((userData)=>{
      
      let newUser: firebase.User = userData.user;

      newUser.updateProfile({
        displayName: this.name,
        photoURL: ""
      }).then(() =>{
        console.log("profile updated");
        
      }).catch((err) =>{
        console.log(err);
        
      })
      console.log(userData.user.displayName)
    }).catch((error)=>{
      console.log(error);
      
    })
    console.log(this.email + this.name + this.password);
    //this.clear();
  }
  clear(){
    this.name="";
    this.email="";
    this.password="";
  }

}
