import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
    selector: 'swt-time-player',
    templateUrl: './time-player.component.html',
    styleUrls: [ './time-player.component.scss' ]
})
export class TimePlayerComponent implements OnChanges, OnDestroy {
    @Input() pvView: any;
    @Input() timeIndex: number;
    @Input() timeTicks: number[];
    @Output() updateTime = new EventEmitter();

    playing = false;
    playingDebouncer: Subject<boolean> = new Subject<boolean>();

    session: { call: (arg0: string, arg1: any[]) => Promise<any> };
    startTime: string;
    timestepDebouncer: Subject<number> = new Subject<number>();

    subscriptions: Subscription[] = [];

    constructor() {
        this.subscriptions.push(
            this.timestepDebouncer.pipe(
                debounceTime(300)
            ).subscribe((value) => this.updateTime.emit(value)));
        this.subscriptions.push(
            this.playingDebouncer.pipe(
                debounceTime(300)
            ).subscribe( (playing: boolean) => {
                if ( playing ) {
                    // play when play button is pressed
                    this.playTimesteps( this.timeIndex );
                } else {
                    // stop when the pause button is pressed
                    this.updateTime.emit( this.timeIndex );
                }
            })
        );
    }

    ngOnChanges(): void {
        // get session once, when pvView is defined
        if ( this.pvView && !this.session ) {
            this.session = this.pvView.get().session;
        }
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach( subscription => subscription.unsubscribe() );
    }

    newTimestep(index: { value: number }) {
        // if playing, immediately stop when there is a click on the timeline
        if ( this.playing ) {
            this.playing = false;
        }
        this.timestepDebouncer.next( index.value );
    }

    playTimesteps( index: number ) {
        const nextIndex = index + 1;
        if ( nextIndex < this.timeTicks.length ) {
            this.session.call( 'pv.time.index.set', [ nextIndex ]).then( () => {
                if (this.playing) {
                    // increment timeIndex here, once graphics are loaded
                    this.timeIndex = index;
                    this.playTimesteps( nextIndex );
                } else {
                    this.updateTime.emit( this.timeIndex );
                }
            });
        } else {
            // stop when last time step is reached
            this.playing = false;
            this.timeIndex = this.timeTicks.length - 1;
            this.updateTime.emit( this.timeIndex );
        }
    }

    togglePlay() {
        this.playing = !this.playing;
        this.playingDebouncer.next( this.playing );
    }
}
