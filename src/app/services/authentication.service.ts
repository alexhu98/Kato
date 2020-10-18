import { Injectable, OnDestroy } from '@angular/core';
import { auth } from 'firebase/app';
import { AngularFireAuth } from '@angular/fire/auth';
import { isPlatform } from '@ionic/angular'
import { GooglePlus } from '@ionic-native/google-plus/ngx';
import { SubSink } from 'subsink'
import { environment } from '../../environments/environment';

const WEB_CLIENT_ID = environment.googlePlusConfig.webClientId;

@Injectable({
  providedIn: 'root'
})

export class AuthenticationService implements OnDestroy {

  private ready = false;
  private userData: any;
  private subs = new SubSink()

  constructor(
    private googlePlus: GooglePlus,
    public angularFireAuth: AngularFireAuth,
  )
  {
    this.subs.add(this.angularFireAuth.authState.subscribe(user => {
      console.log(`AuthenticationService -> authState -> user`, user)
      this.ready = true;
      this.userData = user;
      localStorage.setItem('user', user ? JSON.stringify(this.userData) : null);
    }));
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  isAndroid(): boolean {
    return isPlatform('android');
  }

  isReady(): boolean {
    return this.ready;
  }

  getProfileImage(): string {
    return this.userData?.photoURL || '';
  }

  isSignedIn(): boolean {
    const user = JSON.parse(localStorage.getItem('user'));
    return !!user;
  }

  // Sign in with Google
  async signIn() {
    try {
      if (this.isAndroid()) {
        const options = {
          webClientId: WEB_CLIENT_ID,
          offline: false,
        };

        let result: any;
        try {
          console.log(`AuthenticationService -> signIn -> googlePlus.trySilentLogin -> calling`)
          result = await this.googlePlus.trySilentLogin(options)
          console.log(`AuthenticationService -> signIn -> googlePlus.trySilentLogin -> result`, result)
        }
        catch (ex) {
          console.error(`AuthenticationService -> signIn -> googlePlus.trySilentLogin -> ex`, ex)
        }
        if (!result) {
          console.log(`AuthenticationService -> signIn -> googlePlus.login -> calling`)
          result = await this.googlePlus.login(options)
          console.log(`AuthenticationService -> signIn -> googlePlus.login -> result`, result)
        }
        console.log(`AuthenticationService -> signIn -> signInWithCredential -> calling`)
        result = await this.angularFireAuth.signInWithCredential(auth.GoogleAuthProvider.credential(result.idToken))
        console.log(`AuthenticationService -> signIn -> signInWithCredential -> result`, result)
      }
      else {
        console.log(`AuthenticationService -> signIn -> signInWithPopup -> calling`)
        const result = await this.angularFireAuth.signInWithPopup(new auth.GoogleAuthProvider())
        console.log(`AuthenticationService -> signIn -> signInWithPopup -> result`, result)
      }
    }
    catch (ex) {
      console.error(`AuthenticationService -> signIn -> ex`, ex)
    }
  }

  // Sign-out
  async signOut() {
    try {
      this.ready = false;
      this.userData = undefined;
      localStorage.removeItem('user')
      console.log(`AuthenticationService -> angularFireAuth.signOut -> calling`)
      let result = await this.angularFireAuth.signOut();
      console.log(`AuthenticationService -> angularFireAuth.signOut -> result`, result)
      if (this.isAndroid()) {
        console.log(`AuthenticationService -> googlePlus.logout -> calling`)
        result = await this.googlePlus.logout();
        console.log(`AuthenticationService -> googlePlus.logout -> result`, result)
      }
    }
    catch (ex) {
      console.log(`AuthenticationService -> signOut -> ex`, ex)
    }
  }
}
