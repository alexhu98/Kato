import { Injectable, NgZone, OnDestroy } from '@angular/core';
import { isPlatform } from '@ionic/angular'
import { GooglePlus } from '@ionic-native/google-plus/ngx';
import { GoogleAuthService } from 'ng-gapi'
import { BehaviorSubject } from 'rxjs'
import { SubSink } from 'subsink'
import { environment } from '../../environments/environment';

const EXPIRY_TOLERANCE = 60 * 1000
const WEB_CLIENT_ID = environment.googlePlusConfig.webClientId;

const GOOGLE_PLUS_OPTIONS = {
  webClientId: WEB_CLIENT_ID,
  offline: false,
};

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

  private googleAuth: gapi.auth2.GoogleAuth = undefined;
  private googleUser: gapi.auth2.GoogleUser = undefined;
  private subs = new SubSink()

  constructor(
    private ngZone: NgZone,
    private googlePlus: GooglePlus,
    private googleAuthService: GoogleAuthService,
  )
  {
    if (this.isAndroid()) {
      this.googlePlus.trySilentLogin(GOOGLE_PLUS_OPTIONS)
        .then((result: any) => {
          this.updateUserDataByGooglePlus(result)
        })
        .catch((ex: any) => {
          console.error(`AuthenticationService -> googlePlus.trySilentLogin -> ex`, ex)
          this.emit(NOT_SIGNED_IN_USER_DATA);
        });
    }
    else {
      this.subs.add(this.googleAuthService.getAuth().subscribe(auth => {
        this.googleAuth = auth;
        const user = auth.currentUser.get();
        if (user.isSignedIn()) {
          this.googleUser = user;
          this.updateUserDataByGoogleAuth(this.googleUser, this.googleUser.getAuthResponse());
        }
        else {
          this.emit(NOT_SIGNED_IN_USER_DATA);
        }
      }));
    }
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  // Sign in with Google
  async signIn() {
    if (this.isAndroid()) {
      let result: any;
      try {
        result = await this.googlePlus.trySilentLogin(GOOGLE_PLUS_OPTIONS)
      }
      catch (ex) {
        console.error(`AuthenticationService -> signIn -> googlePlus.trySilentLogin -> ex`, ex)
      }
      try {
        if (!result) {
          result = await this.googlePlus.login(GOOGLE_PLUS_OPTIONS)
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
        this.googleUser = await this.googleAuth.signIn();
        this.updateUserDataByGoogleAuth(this.googleUser, this.googleUser.getAuthResponse());
      }
      catch (ex) {
        console.error(`AuthenticationService -> googleAuth.signIn -> ex =`, ex)
      }
    }
  }

  // Sign-out
  async signOut() {
    this.emit(NOT_SIGNED_IN_USER_DATA);
    localStorage.removeItem('user')
    if (this.isAndroid()) {
      try {
        await this.googlePlus.logout();
      }
      catch (ex) {
        console.error(`AuthenticationService -> googlePlus.logout -> ex`, ex)
      }
    }
    else if (this.googleAuth) {
      try {
        await this.googleAuth.signOut()
      }
      catch (ex) {
        console.error(`AuthenticationService -> googleAuth.signOut -> ex`, ex)
      }
    }
  }

  async getAccessToken() {
    const userData = this.user$.getValue()
    if (userData.signedIn && this.accessTokenExpired(userData.expiresAt)) {
      await this.refreshToken()
    }
    return this.user$.getValue()?.accessToken;
  }

  accessTokenExpired(expiredAt: number): boolean {
    const now = (new Date()).getTime()
    return now + EXPIRY_TOLERANCE >= expiredAt
  }

  emit(userData: UserData) {
    this.ngZone.run(() => {
      this.user$.next(userData);
    });
  }

  isAndroid(): boolean {
    return isPlatform('capacitor');
  }

  updateUserDataByGooglePlus(result: any) {
    const userData = {
      ready: true,
      signedIn: true,
      name: result.displayName,
      profileImage: result.imageUrl,
      idToken: result.idToken,
      accessToken: result.accessToken,
      expiresAt: result.expires * 1000,
    };
    this.emit(userData);
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
    this.emit(userData);
  }

  async refreshToken() {
    try {
      if (this.isAndroid()) {
        const result = await this.googlePlus.trySilentLogin(GOOGLE_PLUS_OPTIONS)
        this.updateUserDataByGooglePlus(result)
      }
      else {
        if (this.googleAuth && this.googleUser) {
          const authResponse = await this.googleUser.reloadAuthResponse();
          this.updateUserDataByRefreshToken(authResponse);
        }
      }
    }
    catch (ex) {
      console.error(`AuthenticationService -> refreshToken -> ex`, ex)
    }
  }

  updateUserDataByRefreshToken(authResponse: gapi.auth2.AuthResponse) {
    const userData = {
      ...this.user$.getValue(),
      idToken: authResponse.id_token,
      accessToken: authResponse.access_token,
      expiresAt: authResponse.expires_at,
    };
  }
}
