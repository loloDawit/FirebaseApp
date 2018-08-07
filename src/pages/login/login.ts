import { Component } from "@angular/core";
import { NavController, ToastController } from "ionic-angular";
import { SignupPage } from "../signup/signup";

import firebase from "firebase";
import { FeedPage } from "../feed/feed";

@Component({
  selector: "page-login",
  templateUrl: "login.html"
})
export class LoginPage {
  email: string = "";
  password: string = "";

  constructor(
    public navCtrl: NavController,
    public toastCtrl: ToastController
  ) {}
  //login
  login() {
    firebase
      .auth()
      .signInWithEmailAndPassword(this.email, this.password)
      .then(userData => {
        console.log(userData);
        this.toastCtrl
          .create({
            message: "Welcome " + userData.user.displayName,
            duration: 3000
          })
          .present();

          this.navCtrl.setRoot(FeedPage) // resets the nevigation stack and resets the stack to feed page
      })
      .catch(err => {
        this.toastCtrl
          .create({
            message: err.message,
            duration: 3000
          })
          .present();
        console.log(err);
      });
  }

  // reroute to the signup
  goBackToSignUpPage() {
    this.navCtrl.push(SignupPage);
  }
}
