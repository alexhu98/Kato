import { Injectable, NgZone, OnDestroy } from '@angular/core';
import { auth } from 'firebase/app';
// import { User } from "./user";
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { SubSink } from 'subsink'

@Injectable({
  providedIn: 'root'
})

export class AuthenticationService implements OnDestroy {

  public ready = false;
  public userData: any;
  private subs = new SubSink()

  constructor(
    public afStore: AngularFirestore,
    public ngFireAuth: AngularFireAuth,
    public router: Router,
    public ngZone: NgZone
  )
  {
/*
    this.subs.add(this.ngFireAuth.authState.subscribe(user => {
      // console.log(`AuthenticationService -> user`, user)
      this.ready = true;
      this.userData = user;
      if (user) {
        localStorage.setItem('user', JSON.stringify(this.userData));
        JSON.parse(localStorage.getItem('user'));
      }
      else {
        localStorage.setItem('user', null);
        JSON.parse(localStorage.getItem('user'));
      }
    }));
*/
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe()
  }

  isReady() {
    return this.ready;
  }

  getProfileImage() {
    return this.userData?.photoURL || '';
  }
/*
  // Login in with email/password
  signIn(email, password) {
    return this.ngFireAuth.signInWithEmailAndPassword(email, password)
  }

  // Register user with email/password
  registerUser(email, password) {
    return this.ngFireAuth.createUserWithEmailAndPassword(email, password)
  }

  // Email verification when new user register
  sendVerificationMail() {
    return this.ngFireAuth.currentUser.sendEmailVerification()
    .then(() => {
      this.router.navigate(['verify-email']);
    })
  }

  // Recover password
  passwordRecover(passwordResetEmail) {
    return this.ngFireAuth.sendPasswordResetEmail(passwordResetEmail)
    .then(() => {
      window.alert('Password reset email has been sent, please check your inbox.');
    }).catch((error) => {
      window.alert(error)
    })
  }
*/
  // Returns true when user is looged in
  get isLoggedIn(): boolean {
    const user = JSON.parse(localStorage.getItem('user'));
    return (user !== null && user.emailVerified !== false) ? true : false;
  }
/*
  // Returns true when user's email is verified
  get isEmailVerified(): boolean {
    const user = JSON.parse(localStorage.getItem('user'));
    return (user.emailVerified !== false) ? true : false;
  }
*/
  // Sign in with Gmail
  googleAuth() {
    return this.authLogin(new auth.GoogleAuthProvider());
  }

  // Auth providers
  authLogin(provider) {
    return this.ngFireAuth.signInWithPopup(provider)
    .then((result) => {
      console.log(`AuthenticationService -> authLogin -> result`, result)
      //  this.ngZone.run(() => {
      //     this.router.navigate(['dashboard']);
      //   })
      // this.setUserData(result.user);
    }).catch((error) => {
      console.log(`AuthenticationService -> authLogin -> error`, error)
      // window.alert(error)
    })
  }
/*
  // Store user in localStorage
  setUserData(user) {
    const userRef: AngularFirestoreDocument<any> = this.afStore.doc(`users/${user.uid}`);
    const userData: User = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      emailVerified: user.emailVerified
    }
    return userRef.set(userData, {
      merge: true
    })
  }
*/
  // Sign-out
  signOut() {
    this.userData = undefined;
    return this.ngFireAuth.signOut().then(() => {
      console.log(`AuthenticationService -> signOut`)
      localStorage.removeItem('user');
      // this.router.navigate(['login']);
    })
  }
}
