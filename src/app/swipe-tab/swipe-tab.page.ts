import { AfterViewInit, ElementRef, NgZone, ViewChild } from '@angular/core';
import { Router } from '@angular/router'
import { GestureController } from '@ionic/angular'

export class SwipeTabPage implements AfterViewInit {

  @ViewChild('swipeTabPage') swipeTabPage: ElementRef;

  private panStartX = 0;

  constructor(
    protected router: Router,
    protected zone: NgZone,
    protected gestureController: GestureController,
    protected swipeLeftUrl: string,
    protected swipeRightUrl: string,
  ) {}

  ngAfterViewInit(): void {
    this.createGesture();
  }

  createGesture(): void {
    if (this.swipeTabPage?.nativeElement) {
      const gesture = this.gestureController.create({
        gestureName: 'swipe-tab',
        gesturePriority: 100,
        el: this.swipeTabPage.nativeElement,
        direction: 'x',
        onStart: (ev) => this.onStart(ev),
        onEnd: (ev) => this.onEnd(ev),
      })
      gesture.enable()
    }
    else {
      console.error(`SwipeTabPage -> createGesture -> swipeTabPage`, this.swipeTabPage)
    }
  }

  private onStart(ev) {
    this.panStartX = ev.currentX;
  }

  private onEnd(ev) {
    if (ev.type === 'pan') {
      const panStartX = this.panStartX;
      const panEndX = ev.currentX;
      if (Math.abs(ev.velocityX) > 0.10 && Math.abs(ev.velocityX) > Math.abs(ev.velocityY) * 2) {
        if (panStartX > panEndX) {
          this.onSwipeLeft();
        }
        else {
          this.onSwipeRight();
        }
      }
    }
  }

  protected onSwipeLeft(): void {
    this.zone.run(async () => {
      await this.router.navigate([this.swipeLeftUrl]);
    });
  }

  protected onSwipeRight(): void {
    this.zone.run(async () => {
      await this.router.navigate([this.swipeRightUrl]);
    });
  }
}
