import { Component } from "@angular/core";
import {
  NavController,
  NavParams,
  LoadingController,
  ToastController
} from "ionic-angular";

import { HttpClient } from '@angular/common/http'

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
  image: string;
  /**
   *
   * @param navCtrl
   * @param navParams
   * @param loadingCtrl
   * @param toastCtrl
   * @param camera
   */
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public loadingCtrl: LoadingController,
    public toastCtrl: ToastController,
    private camera: Camera, 
    private http:HttpClient
  ) {
    this.getPosts();
  }

  /**
   * get posts from the cloud
   */
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
  /**
   * update new post by getting more data from firebase
   */
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
      .then( async doc => {
        console.log(doc);

        if (this.image) {
           await this.uploadImage(doc.id);
        }

        this.text = "";
        this.image = undefined
        let toast = this.toastCtrl
          .create({
            message: "Your post has been created successfully.",
            duration: 4000
          })
          .present();
        this.getPosts();
      })

      .catch(err => {
        console.log(err);
      });
  }
  /**
   * Logout of current session.Then set root page to login page
   */
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
  /**
   * Reads time captured by firebase
   * @param time current time.
   * Function returns a human readable time
   */
  timeStamp(time) {
    let timeDiff = moment(time).diff(moment());
    return moment.duration(timeDiff).humanize();
  }
  /**
   * Refresh page content. Get more data from firebase
   * @param event current app session
   */
  refresh(event) {
    this.posts = [];
    this.getPosts();
    if (this.infiniteEvent) {
      this.infiniteEvent.enable(true);
    }
    event.complete();
  }
  /**
   * Load more data from firebase
   * @param event
   */
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
  /**
   * Open native camera and set camera options
   */
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
        this.image = "data:image/png;base64," + base64Image;
      })
      .catch(err => {
        console.log(err);
      });
  }
  /**
   * Upload an image to firestore
   * @param name unique id to store photo to firestore
   * return promise to resolve async operations
   */
  uploadImage(name: string) {
    return new Promise((resolve, reject) => {

      let loading = this.loadingCtrl.create({
        content: "Uploading photo to firestore..."
      })
      loading.present(); 

      let ref = firebase.storage().ref("postImages/" + name);
      let uploadTask = ref.putString(this.image.split(',')[1], "base64");
      uploadTask.on(
        "state_changed",
        (taskSnapshot:any) => {
          console.log(taskSnapshot);
          let calculatedPercentage = taskSnapshot.bytesTransferred / taskSnapshot.totalBytes * 100;
          loading.setContent("Uploaded "+calculatedPercentage+" % ...")
        },
        (err) => {
          console.log(err);
        },
        () => {
          console.log("Upload completed!!");
          uploadTask.snapshot.ref
            .getDownloadURL()
            .then(url => {
              firebase
                .firestore()
                .collection("posts")
                .doc(name)
                .update({
                  image: url
                })
                .then(() => {
                  loading.dismiss();
                  resolve();
                })
                .catch(err => {
                  loading.dismiss();
                  reject();
                });
            })
            .catch(err => {
              loading.dismiss();
              reject();
            });
        }
      );
    });
  }
  /**
   * 
   * @param post 
   */
  likePost(post){
    // create JSON obj 
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let body = {
      postId: post.id, 
      userId: firebase.auth().currentUser.uid, 
      action: post.data().likes && post.data().likes[firebase.auth().currentUser.uid] == true ? "unlike" : "like" 
    }
    console.log(JSON.stringify(body));
    
    this.http.post("https://us-central1-fir-app-cc115.cloudfunctions.net/updateLikeCount", JSON.stringify(body),{
      responseType: 'text'
    }).subscribe((data)=>{
      console.log(data);
      
    },(err)=>{
      console.log(err);
      
    })
  }
}
