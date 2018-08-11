import { Component } from "@angular/core";
import {
  NavController,
  NavParams,
  LoadingController,
  ToastController
} from "ionic-angular";

import { Camera, CameraOptions } from "@ionic-native/camera";

import firebase from "firebase";
import { LoginPage } from "../login/login";

import moment from "moment";

@Component({
  selector: "page-feed",
  templateUrl: "feed.html"
})
export class FeedPage {
  text: string = "";
  posts: any[] = [];
  pageSize: number = 5;
  cursor: any;
  infiniteEvent: any;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public loadingCtrl: LoadingController,
    public toastCtrl: ToastController,
    private camera: Camera
  ) {
    this.getPosts();
  }
  //get posts from the cloud
  getPosts() {
    this.posts = [];
    let loading = this.loadingCtrl.create({
      content: "Loading Data From Firebase ...",
      duration: 5000
    });
    loading.present();
    let query = firebase
      .firestore()
      .collection("posts")
      .orderBy("created", "desc")
      .limit(this.pageSize);

    query.onSnapshot(snapshot => {
      let dataChanges = snapshot.docChanges();
      dataChanges.forEach(dataChange => {
        if (dataChange.type == "added") {
          //
        }
        if (dataChange.type == "modified") {
          //
          console.log("Document ID " + dataChange.doc.id + "modified");
        }
        if (dataChange.type == "removed") {
          //
        }
      });
    });
    query
      .get()
      .then(data => {
        // re-arrange posts by descending order

        data.forEach(document => {
          this.posts.push(document);
        });
        loading.dismiss();
        console.log(this.posts);
        this.cursor = this.posts[this.posts.length - 1];
      })
      .catch(err => {
        console.log(err);
      });
  }

  ionViewDidLoad() {
    console.log("ionViewDidLoad FeedPage");
  }
  postUpdate() {
    firebase
      .firestore()
      .collection("posts")
      .add({
        text: this.text,
        created: firebase.firestore.FieldValue.serverTimestamp(),
        owner: firebase.auth().currentUser.uid,
        owner_name: firebase.auth().currentUser.displayName
      })
      .then(doc => {
        console.log(doc);
        this.getPosts();
        this.text = "";
        let toast = this.toastCtrl
          .create({
            message: "Your post has been created successfully.",
            duration: 4000
          })
          .present();

      })

      .catch(err => {
        console.log(err);
      });
  }
  logOut() {
    firebase
      .auth()
      .signOut()
      .then(() => {
        let toast = this.toastCtrl
          .create({
            message: "You have been logged out successfully.",
            duration: 4000
          })
          .present();

        this.navCtrl.setRoot(LoginPage);
      });
  }

  timeStamp(time) {
    let timeDiff = moment(time).diff(moment());
    return moment.duration(timeDiff).humanize();
  }
  refresh(event) {
    this.posts = [];
    this.getPosts();
    if (this.infiniteEvent) {
      this.infiniteEvent.enable(true);
    }
    event.complete();
  }
  loadMorePosts(event) {
    firebase
      .firestore()
      .collection("posts")
      .orderBy("created", "desc")
      .startAfter(this.cursor)
      .limit(this.pageSize)
      .get()
      .then(data => {
        // re-arrange posts by descending order

        data.forEach(document => {
          this.posts.push(document);
        });
        console.log(this.posts);
        if (data.size < this.pageSize) {
          //all data from firestore have been loaded
          event.enable(false);
          this.infiniteEvent = event;
        } else {
          event.complete();
          this.cursor = this.posts[this.posts.length - 1];
        }
      })
      .catch(err => {
        console.log(err);
      });
  }
  //add images
  addImages() {
    this.launchCamera();
  }

  launchCamera() {
    let imageOptions: CameraOptions = {
      quality: 100,
      sourceType: this.camera.PictureSourceType.CAMERA,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.PNG,
      mediaType: this.camera.MediaType.PICTURE,
      correctOrientation: true,
      targetHeight: 512,
      targetWidth: 512,
      allowEdit: true
    };
    this.camera
      .getPicture(imageOptions)
      .then(base64Image => {
        console.log(base64Image);
      })
      .catch(err => {
        console.log(err);
      });
  }
}
