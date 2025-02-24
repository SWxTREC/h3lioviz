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
            this.playingDebouncer.pipe(
                debounceTime(300)
            ).subscribe( (playing: boolean) => {
                if ( playing ) {
                    // play when play button is pressed
                    this.playNextTimestep();
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
            this.subscriptions.push(
                // subscribe to image push events, triggered when a new image is received from paraview
                this.session.subscribe('viewport.image.push.subscription', (thing) => {
                    // keep timeIndex in sync when new image is received
                    this.session.call('pv.time.index.get', []).then( (timeIndex) => {
                        // stop playing if end of time is reached
                        if ( timeIndex === this.timeTicks.length - 1 ) {
                            this.playing = false;
                        }
                        if ( this.playing ) {
                            this.timeIndex = timeIndex;
                            this.playNextTimestep();
                        } else {
                            // if not playing, stop and get most recent time index to emit
                            this.session.call('pv.time.stop', []).then( () => {
                                this.session.call('pv.time.index.get', []).then( (currentIndex) => {
                                    this.timeIndex = currentIndex;
                                    this.updateTime.emit( currentIndex );
                                });
                            });
                        }
                    });
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

    newTimestep(newIndex: { value: number }) {
        // stop playing when there is a click on the timeline
        this.playing = false;
        this.setTimeIndex( newIndex.value );
    }

    setTimeIndex( newIndex: number ) {
        // setting the index will drive the image-push subscription
        this.session.call('pv.time.index.set', [ newIndex ]);
    }

    playNextTimestep() {
        const nextIndex = this.timeIndex + 1;
        if ( nextIndex === this.timeTicks.length ) {
            this.playing = false;
        }
        if ( this.playing ) {
            this.setTimeIndex( nextIndex );
        }
    }

    togglePlay() {
        this.playing = !this.playing;
        this.playingDebouncer.next( this.playing );
    }
}
