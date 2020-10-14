import { Component, ElementRef } from '@angular/core';
import { GestureController } from '@ionic/angular'

@Component({
  selector: 'app-swipeable-tab',
  templateUrl: './swipeable-tab.component.html',
  styleUrls: ['./swipeable-tab.component.scss'],
})
export class SwipeableTabComponent {

  constructor() {}

  private panStartX = 0;

  initializeSwipeableTab(gestureController: GestureController, tabContent: ElementRef): void {
    if (tabContent?.nativeElement) {
      const gesture = gestureController.create({
        gestureName: 'swipe-tab',
        gesturePriority: 100,
        el: tabContent.nativeElement,
        direction: 'x',
        onStart: (ev) => this.onStart(ev),
        onEnd: (ev) => this.onEnd(ev),
      })
      gesture.enable()
    }
    else {
      console.error(`SwipeableTabComponent -> initializeSwipeableTab -> content`, tabContent)
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

  protected onSwipeLeft(): void {}
  protected onSwipeRight(): void {}
}
