import { AfterViewInit, Component, EventEmitter, Input, OnChanges, OnDestroy, Output } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, throttleTime } from 'rxjs/operators';
import { PlotsService, StatusService } from 'scicharts';
import { PlayingService } from 'src/app/services';

@Component({
    selector: 'swt-time-player',
    templateUrl: './time-player.component.html',
    styleUrls: [ './time-player.component.scss' ]
})
export class TimePlayerComponent implements AfterViewInit, OnChanges, OnDestroy {
    @Input() pvView: any;
    @Input() timeIndex: number;
    @Input() timeTicks: number[];
    @Output() updateTime = new EventEmitter();

    crosshairPositionPercent: number;

    playing = false;
    playingDebouncer: Subject<boolean> = new Subject<boolean>();
    // since crosshairs are synced, only one plotId is needed
    plotId: string;

    session: {
        subscribe: (arg0: string, arg1: (image: any) => void) => Subscription;
        call: (arg0: string, arg1: number[]) => Promise<any>;
    };
    startTime: string;
    subscriptions: Subscription[] = [];
    timePlayerHover = false;
    timestepDebouncer: Subject<number> = new Subject<number>();


    // instead of directly updating the crosshair position, use this Subject to throttle updates
    private _xTimestampSubject: Subject<number> = new Subject<number>();

    constructor(
        private _playingService: PlayingService,
        private _plotsService: PlotsService,
        private _statusService: StatusService
    ) {
        this.subscriptions.push( this._playingService.playing$.subscribe( (playing: boolean) => {
            this.playing = playing;
            this.playingDebouncer.next( playing );
        }));

        this.subscriptions.push(
            this.playingDebouncer.pipe(
                debounceTime(300),
                filter( (playing: boolean) => playing === true )
            ).subscribe( () => {
                // play when play button is pressed
                this.playNextTimestep();
            })
        );
        this.subscriptions.push(
            this._statusService.allPlotsStable$.subscribe( ( allPlotsStable: boolean ) => {
                if ( allPlotsStable ) {
                    this.plotId = this._plotsService.getPlots$().value[0].plotId;
                    this._plotsService.setXyPosition( this.plotId, this.timeTicks[this.timeIndex] * 1000 );
                }
            })
        );
    }

    ngOnChanges(): void {
        // any time there are changes to the inputs, make sure playing is false
        this._playingService.playing$.next(false);

        // get session once, when pvView is defined
        if ( this.pvView && !this.session ) {
            this.session = this.pvView.get().session;

            this.subscriptions.push(
                // subscribe to image push events, triggered when a new image is received from paraview
                this.session.subscribe('viewport.image.push.subscription', () => {
                    // keep timeIndex in sync when new image is received
                    this.session.call('pv.time.index.get', []).then( (timeIndex) => {
                        // stop playing if end of time is reached
                        if ( timeIndex === this.timeTicks.length - 1 ) {
                            this._playingService.playing$.next(false);
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

    ngAfterViewInit(): void {
        this.crosshairPositionPercent = this.timeIndex * 100 / ( this.timeTicks.length - 1 );

        // throttle calls to setting the xPosition of crosshairs
        this.subscriptions.push(this._xTimestampSubject.pipe(
            throttleTime(
                1000/60, // 60Hz
                undefined,
                { leading: true, trailing: true }
            )
        ).subscribe( timestamp => {
            this.crosshairPositionPercent = ( this._getNearestTick( timestamp / 1000 ) * 100 ) / ( this.timeTicks.length - 1 );
            // only update scicharts crosshair when the time player is being hovered
            if ( this.timePlayerHover ) {
                this._plotsService.setXyPosition( this.plotId, timestamp );
            }
        }));

        this.subscriptions.push( this._plotsService.getXyPosition$().pipe(
            filter( position => position != null ),
            distinctUntilChanged( ( prev, curr ) => prev.xPosition === curr.xPosition )
        ).subscribe( ( xyPosition ) => {
            if ( !this.timePlayerHover ) {
                this._xTimestampSubject.next( xyPosition.xPosition );
            }
        }));

        // when the user clicks on a plot, set the time index to the nearest tick
        this.subscriptions.push(this._plotsService.getXyClicked$().subscribe(( plotClicked ) => {
            const timestampInSeconds = plotClicked.xPosition / 1000;
            const nearestTimeIndex = this._getNearestTick( timestampInSeconds );
            this.updateTime.emit( nearestTimeIndex );
        }));
    }

    ngOnDestroy(): void {
        // stop playing and set index when time player is destroyed
        this._playingService.playing$.next(false);
        this.updateTime.emit( this.timeIndex );
        this.subscriptions.forEach( subscription => subscription.unsubscribe() );
    }

    newTimestep(newIndex: { value: number }) {
        // stop playing when there is a click on the timeline
        this._playingService.playing$.next(false);
        this.setTimeIndex( newIndex.value );
    }

    playNextTimestep() {
        const nextIndex = this.timeIndex + 1;
        if ( nextIndex === this.timeTicks.length ) {
            this._playingService.playing$.next(false);
        }
        if ( this.playing === true) {
            this.setTimeIndex( nextIndex );
        }
    }

    setTimeIndex( newIndex: number ) {
        // setting the index will drive the image-push subscription
        this.session.call('pv.time.index.set', [ newIndex ]);
        // update the crosshairs on the plots
        this._plotsService.setXyPosition( this.plotId, this.timeTicks[newIndex] * 1000 );
    }

    /** using a binary search, find the closest value to the target of a pre-sorted list (code borrowed from scicharts) */
    findNearestValue( target: number, sortedList: number[] ): number {
        if ( target < sortedList[0] ) {
            return sortedList[0];
        }
        if ( target > sortedList[ sortedList.length - 1 ]) {
            return sortedList[ sortedList.length - 1 ];
        }

        let low = 0;
        let high = sortedList.length - 1;

        while ( low <= high ) {
            const mid = Math.floor( ( high + low ) / 2 );

            if ( target < sortedList[ mid ] ) {
                high = mid - 1;
            } else if ( target > sortedList[ mid ]) {
                low = mid + 1;
            } else {
                return sortedList[ mid ];
            }
        }
        return ( sortedList[ low ] - target ) < ( target - sortedList[ high ] ) ? sortedList[ low ] : sortedList[ high ];
    }

    hoverValue( event: MouseEvent ) {
        if ( !this.playing ) {
            this.timePlayerHover = true;
            const xPosition: number = event.x;
            const sliderWidth: number = (event.target as HTMLElement).clientWidth;
            const timestamp: number =
                this.timeTicks[ Math.round( ( xPosition / sliderWidth ) * ( this.timeTicks.length - 1 ) ) ] * 1000;
            this._xTimestampSubject.next(timestamp);
        }
    }

    mouseleave() {
        this.timePlayerHover = false;
    }

    togglePlay() {
        this._playingService.playing$.next(!this.playing);
    }

    /** find the closest tick value to a given timestamp */
    private _getNearestTick( timestamp: number ): number {
        const nearestTimestamp = this.findNearestValue( timestamp, this.timeTicks );
        return this.timeTicks.indexOf( nearestTimestamp );
    }
}
