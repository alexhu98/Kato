import { Injectable, NgZone, OnDestroy } from '@angular/core';
// import { auth } from 'firebase/app';
// import { AngularFireAuth } from '@angular/fire/auth';
import { isPlatform } from '@ionic/angular'
import { GooglePlus } from '@ionic-native/google-plus/ngx';
import { GoogleApiService, GoogleAuthService, NgGapiClientConfig } from 'ng-gapi'
import { SubSink } from 'subsink'
import { environment } from '../../environments/environment';
import { BehaviorSubject } from 'rxjs'

const WEB_CLIENT_ID = environment.googlePlusConfig.webClientId;

interface UserData {
  ready: boolean;
  signedIn: boolean;
  name: string;
  profileImage: string;
  idToken: string;
  accessToken: string;
  expiresAt: number;
}

const NOT_READY_USER_DATA: UserData = {
  ready: false,
  signedIn: false,
  name: '',
  profileImage: '',
  idToken: '',
  accessToken: '',
  expiresAt: 0,
}

const NOT_SIGNED_IN_USER_DATA: UserData = {
  ready: true,
  signedIn: false,
  name: '',
  profileImage: '',
  idToken: '',
  accessToken: '',
  expiresAt: 0,
}

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService implements OnDestroy {

  user$ = new BehaviorSubject<UserData>(NOT_READY_USER_DATA);

  private ready = false;
  private userData: UserData | undefined = undefined;
  private googleAuth: gapi.auth2.GoogleAuth = undefined;
  private googleUser: gapi.auth2.GoogleUser = undefined;
  private googleAuthResponse: gapi.auth2.AuthResponse = undefined;
  private subs = new SubSink()

  constructor(
    private ngZone: NgZone,
    private googlePlus: GooglePlus,
    private gapiService: GoogleApiService,
    private googleAuthService: GoogleAuthService,
  )
  {
    this.subs.add(this.gapiService.onLoad().subscribe(() => {
      gapi.load('client', async () => {
        await gapi.client.load('calendar', 'v3');
        console.log(`AuthenticationService -> this.ready`)
        if (!this.isAndroid()) {
          this.subs.add(this.googleAuthService.getAuth().subscribe(auth => {
            this.googleAuth = auth;
            console.log(`AuthenticationService -> googleAuth =`, this.googleAuth);
            const user = auth.currentUser.get();
            console.log(`AuthenticationService -> user.isSignedIn()`, user.isSignedIn())
            if (user.isSignedIn()) {
              this.googleUser = user;
              console.log(`AuthenticationService -> this.googleUser =`, this.googleUser);
              this.googleAuthResponse = this.googleUser.getAuthResponse();
              this.updateUserDataByGoogleAuth(this.googleUser, this.googleAuthResponse);
            }
          }));
        }
      });
    }));
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  isAndroid(): boolean {
    return isPlatform('capacitor');
  }

  // Sign in with Google
  async signIn() {
    try {
      console.log(`AuthenticationService -> signIn -> isAndroid =`, this.isAndroid())
      if (this.isAndroid()) {
        const options = {
          webClientId: WEB_CLIENT_ID,
          offline: true,
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
        try {
          if (!result) {
            console.log(`AuthenticationService -> signIn -> googlePlus.login -> calling`)
            result = await this.googlePlus.login(options)
            console.log(`AuthenticationService -> signIn -> googlePlus.login -> result`, result)
          }
        }
        catch (ex) {
          console.error(`AuthenticationService -> signIn -> googlePlus.login -> ex`, ex)
        }
        if (result) {
          this.updateUserDataByGooglePlus(result);
        }
      }
      else if (this.googleAuth) {
        try {
          console.log(`AuthenticationService -> googleAuth.signIn -> calling`);
          const user = await this.googleAuth.signIn();
          console.log(`AuthenticationService -> googleAuth.signIn -> user`, user)
          this.googleUser = user;
          this.googleAuthResponse = user.getAuthResponse();
          this.updateUserDataByGoogleAuth(user, this.googleAuthResponse);
        }
        catch (ex) {
          console.error(`AuthenticationService -> googleAuth.signIn -> ex =`, ex)
        }
      }
    }
    catch (ex) {
      console.error(`AuthenticationService -> signIn -> ex`, ex)
    }
  }

  // Sign-out
  async signOut() {
    try {
      this.user$.next(NOT_SIGNED_IN_USER_DATA);
      localStorage.removeItem('user')
      // console.log(`AuthenticationService -> angularFireAuth.signOut -> calling`)
      if (this.isAndroid()) {
        try {
          console.log(`AuthenticationService -> googlePlus.logout -> calling`)
          await this.googlePlus.logout();
          console.log(`AuthenticationService -> googlePlus.logout -> called`)
        }
        catch (ex) {
          console.log(`AuthenticationService -> googlePlus.logout -> ex`, ex)
        }
      }
      else if (this.googleAuth) {
        try {
          console.log(`AuthenticationService -> googleAuth.signOut -> calling`)
          await this.googleAuth.signOut()
          console.log(`AuthenticationService -> googleAuth.signOut -> called`)
        }
        catch (ex) {
          console.log(`AuthenticationService -> googleAuth.signOut -> ex`, ex)
        }
      }
    }
    catch (ex) {
      console.log(`AuthenticationService -> signOut -> ex`, ex)
    }
  }

  async refreshToken() {
    try {
      if (this.googleAuth && this.googleUser && this.userData) {
        const autoResponse = await this.googleUser.reloadAuthResponse();
        console.log(`AuthenticationService -> refreshToken -> this.googleUser.reloadAuthResponse`, autoResponse);
        this.updateUserDataByRefreshToken(autoResponse);
      }
    }
    catch (ex) {
      console.log(`AuthenticationService -> refreshToken -> ex`, ex)
    }
  }

  getAccessToken() {
    return this.user$.getValue()?.accessToken;
  }

  updateUserDataByGooglePlus(result: any) {
    const userData = {
      ready: true,
      signedIn: true,
      name: result.displayName,
      profileImage: result.imageUrl,
      idToken: result.idToken,
      accessToken: result.accessToken,
      expiresAt: result.expires,
    };
    this.ngZone.run(() => {
      this.user$.next(userData);
    });
  }

  updateUserDataByGoogleAuth(user: gapi.auth2.GoogleUser, authResponse: gapi.auth2.AuthResponse) {
    const userData = {
      ready: true,
      signedIn: true,
      name: user.getBasicProfile().getName(),
      profileImage: user.getBasicProfile().getImageUrl(),
      idToken: authResponse.id_token,
      accessToken: authResponse.access_token,
      expiresAt: authResponse.expires_at,
    }
    this.ngZone.run(() => {
      this.user$.next(userData);
    });
  }

  updateUserDataByRefreshToken(authResponse: gapi.auth2.AuthResponse) {
    const userData = {
      ...this.user$.getValue(),
      idToken: authResponse.id_token,
      accessToken: authResponse.access_token,
      expiresAt: authResponse.expires_at,
    };
    this.ngZone.run(() => {
      this.user$.next(userData);
    });
  }
}
