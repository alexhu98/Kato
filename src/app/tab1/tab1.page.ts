import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../services/authentication.service'

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})

export class Tab1Page {

  constructor(private authService: AuthenticationService) {}

  isAuthReady() {
    return this.authService.isReady()
  }

  getProfileImage() {
    return this.authService.getProfileImage()
  }

  login() {
    this.authService.googleAuth()
  }

  logout() {
    this.authService.signOut()
  }
}
