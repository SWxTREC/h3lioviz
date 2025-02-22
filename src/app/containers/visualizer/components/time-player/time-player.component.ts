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

    session: {
        subscribe: (arg0: string, arg1: (image: any) => void) => Subscription;
        call: (arg0: string, arg1: number[]) => Promise<any>;
    };
    startTime: string;
    timestepDebouncer: Subject<number> = new Subject<number>();

    subscriptions: Subscription[] = [];

    constructor() {
        this.subscriptions.push(
            this.timestepDebouncer.pipe(
                debounceTime(300)
            ).subscribe((index) => this.updateTime.emit(index))
        );

        this.subscriptions.push(
            this.playingDebouncer.pipe(
                debounceTime(300)
            ).subscribe( (playing: boolean) => {
                if ( playing ) {
                    // play when play button is pressed
                    this.playTimesteps();
                }
            })
        );
    }

    ngOnChanges(): void {
        // any time there are changes to the inputs, make sure playing is false
        this.playing = false;

        // get session once, when pvView is defined
        if ( this.pvView && !this.session ) {
            this.session = this.pvView.get().session;
            // subscribe to image changes
            this.subscriptions.push(
                this.session.subscribe('viewport.image.push.subscription', () => {
                    // keep timeIndex in sync while playing only
                    if ( this.playing ) {
                        this.session.call('pv.time.index.get', []).then( (currentIndex) => {
                            this.timeIndex = currentIndex;
                            if ( this.timeIndex === this.timeTicks.length - 1 ) {
                            // stop playing when end of time is reached
                                this.playing = false;
                            }
                        });
                    }
                })
            );
        }
    }

    ngOnDestroy(): void {
        // stop playing and set index when time player is destroyed
        this.playing = false;
        this.updateTime.emit( this.timeIndex );
        this.subscriptions.forEach( subscription => subscription.unsubscribe() );
    }

    newTimestep(index: { value: number }) {
        // if playing, immediately stop when there is a click on the timeline
        if ( this.playing ) {
            this.playing = false;
        }
        this.timestepDebouncer.next( index.value );
    }

    playTimesteps() {
        const nextIndex = this.timeIndex + 1;
        if ( this.playing && nextIndex < this.timeTicks.length) {
            this.session.call( 'pv.time.index.set', [ nextIndex ]).then( () => {
                // once graphics are loaded, increment the time index and play the next timestep
                this.playTimesteps();
            });
        } else {
            // stop when end is reached or pause button is pressed
            this.session.call('pv.time.stop', []).then( () => {
                this.updateTime.emit( this.timeIndex );
            });
        }
    }

    togglePlay() {
        this.playing = !this.playing;
        this.playingDebouncer.next( this.playing );
    }
}
