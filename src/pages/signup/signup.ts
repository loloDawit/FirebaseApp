import { Component } from '@angular/core';
import { NavController, NavParams, ToastController, AlertController} from 'ionic-angular';
import firebase from 'firebase';
import { FeedPage } from '../feed/feed';


@Component({
  selector: 'page-signup',
  templateUrl: 'signup.html',
})
export class SignupPage {

  name:string = "";
  email:string = "";
  password:string = "";

  constructor(public navCtrl: NavController, public navParams: NavParams, public toastCtrl:ToastController, public alertCtrl:AlertController) {
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

        this.alertCtrl.create ({
          title: "Account Created", 
          message: "Your account has been created successfully.",
          buttons: [
            {
              text: "Ok",
              handler: () =>{
                // Navigate to new page
                this.navCtrl.setRoot(FeedPage);
              }
            }
          ]
        }).present();
        
      }).catch((err) =>{
        this.toastCtrl.create({
          message: err.message,
          duration: 3000
  
        }).present();
        console.log(err);
        
      })
      console.log(userData.user.displayName)
    }).catch((error)=>{
      console.log(error);
      
    })
    console.log(this.email + this.name + this.password);
    this.clear();
  }
  clear(){
    this.name="";
    this.email="";
    this.password="";
  }

}
