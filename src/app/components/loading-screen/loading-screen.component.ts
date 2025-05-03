import { Component } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-loading-screen',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loading-screen.component.html',
  styleUrl: './loading-screen.component.scss',
  animations: [
    trigger('fadeInOut', [
      state('in', style({ opacity: 1 })),
      transition(':enter', [
        style({ opacity: 0 }),
        animate('600ms ease-in')
      ]),
    ]),
    trigger('pulse', [
      state('in', style({ transform: 'scale(1)' })),
      state('out', style({ transform: 'scale(1.1)' })),
      transition('in => out', animate('700ms ease-in-out')),
      transition('out => in', animate('700ms ease-in-out'))
    ])
  ]
})
export class LoadingScreenComponent {
  pulseState = 'in';
  loadingMessages: string[] = [
    'Fetching your conversations...',
    'Loading messages...',
    'Connecting to server...',
    'Preparing your data...',
    'Almost there...'
  ];
  currentMessage: string = this.loadingMessages[0];
  messageIndex: number = 0;

  constructor() { }

  ngOnInit(): void {
    this.animatePulse();
    this.rotateMessages();
  }

  animatePulse(): void {
    setInterval(() => {
      this.pulseState = this.pulseState === 'in' ? 'out' : 'in';
    }, 700);
  }

  rotateMessages(): void {
    setInterval(() => {
      this.messageIndex = (this.messageIndex + 1) % this.loadingMessages.length;
      this.currentMessage = this.loadingMessages[this.messageIndex];
    }, 3000);
  }
}
