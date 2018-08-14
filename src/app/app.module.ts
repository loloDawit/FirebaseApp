import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';

import { MyApp } from './app.component';
import { LoginPage } from '../pages/login/login';
import { SignupPage } from '../pages/signup/signup';
import { FeedPage} from '../pages/feed/feed';

import firebase from 'firebase';

import  { Camera } from '@ionic-native/camera'; 

import { HttpClientModule } from '@angular/common/http'

var config = {
  apiKey: "AIzaSyC58afan-p4uPLoQJjissGdrka5U2ejCH0",
  authDomain: "fir-app-cc115.firebaseapp.com",
  databaseURL: "https://fir-app-cc115.firebaseio.com",
  projectId: "fir-app-cc115",
  storageBucket: "fir-app-cc115.appspot.com",
  messagingSenderId: "26126356419"
};

firebase.initializeApp(config);
firebase.firestore().settings({
  timestampsInSnapshots: true
})
@NgModule({
  declarations: [
    MyApp,
    LoginPage,
    SignupPage, 
    FeedPage
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    LoginPage,
    SignupPage,
    FeedPage
  ],
  providers: [
    StatusBar,
    Camera,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
