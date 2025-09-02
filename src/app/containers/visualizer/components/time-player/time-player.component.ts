import { AfterViewInit, Component, EventEmitter, Input, OnChanges, OnDestroy, Output } from '@angular/core';
import * as d3 from 'd3';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, throttleTime } from 'rxjs/operators';
import { ImageViewerService, IPlot, PlotsService, StatusService } from 'scicharts';
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
    hoveredTime: number;
    hasImageDatasets: boolean;
    playingDebouncer: Subject<boolean> = new Subject<boolean>();
    // since crosshairs are synced, only one plotId is needed
    plotId: string;
    session: {
        subscribe: (arg0: string, arg1: (image: any) => void) => Subscription;
        call: (arg0: string, arg1: number[]) => Promise<any>;
    };
    startTime: string;
    statusSubscription: any;
    subscriptions: Subscription[] = [];
    timePlayerHover = false;
    timeScale: d3.ScaleLinear<number, number>;
    timestepDebouncer: Subject<number> = new Subject<number>();

    // instead of directly updating the crosshair position, use this Subject to throttle updates
    private _xTimestampSubject: Subject<number> = new Subject<number>();

    constructor(
        protected _playingService: PlayingService,
        private _imageViewerService: ImageViewerService,
        private _plotsService: PlotsService,
        private _statusService: StatusService
    ) {
        this.subscriptions.push( this._playingService.playing$.pipe(
            debounceTime(300),
            filter( (playing: boolean) => playing === true )
        ).subscribe( (playing: boolean) => {
            this.playNextTimestep();
        }));

        this.subscriptions.push(
            this._plotsService.getPlots$().pipe( filter( plots => plots.length > 0 )).subscribe( ( plots: IPlot[] ) => {
                this.plotId = plots[0].plotId;
                if ( this.statusSubscription ) {
                    this.statusSubscription.unsubscribe();
                }
                const imageDatasets = plots.filter( ( plot ) => plot.type === 'IMAGE' );
                this.hasImageDatasets = imageDatasets.length > 0;
                // TODO: until we can have a status from the statusService that does not require a plotId, use this subscription
                // to set the crosshair position after the plots have rendered
                this.statusSubscription =
                    this._statusService.getStatus$(this.plotId).subscribe( ( plotsStatus ) => {
                        if ( plotsStatus >= 50 ) {
                            if ( this.hasImageDatasets ) {
                                this._imageViewerService.updateTimeSync({ timestamp: this.timeTicks[this.timeIndex] * 1000 });
                            } else {
                                this._plotsService.setXyPosition( this.plotId, this.timeTicks[this.timeIndex] * 1000 );
                            }
                        }
                    });
            })
        );
    }

    ngOnChanges(): void {
        // any time there are changes to the inputs, make sure playing is false
        this._playingService.playing$.next(false);

        // get session once, when pvView is defined
        if ( this.pvView && !this.session ) {
            this.session = this.pvView.get().session;

            // note that these paraview subscriptions are not able to use .pipe(), so no
            // rxjs operators can be used and we rely on subscriptions.push()
            this.subscriptions.push(
                // subscribe to image push events, triggered when a new image is received from paraview
                this.session.subscribe('viewport.image.push.subscription', () => {
                    // keep timeIndex in sync when new image is received
                    this.session.call('pv.time.index.get', []).then( (timeIndex) => {
                        // stop playing if end of time is reached
                        if ( timeIndex === this.timeTicks.length - 1 ) {
                            this._playingService.playing$.next(false);
                        }
                        if ( this._playingService.playing$.value === true ) {
                            this.timeIndex = timeIndex;
                            this.playNextTimestep();
                        } else {
                            // if not playing, stop and get most recent time index to emit
                            this.session.call('pv.time.stop', []).then( () => {
                                this.session.call('pv.time.index.get', []).then( (currentIndex) => {
                                    this.timeIndex = currentIndex;
                                    // update the crosshairs on the plots
                                    this._plotsService.setXyPosition( this.plotId, this.timeTicks[currentIndex] * 1000 );
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
        this.timeScale = d3.scaleLinear()
            .domain([ 0, 1 ])
            .range([ this.timeTicks[0], this.timeTicks[this.timeTicks.length - 1] ]);

        // throttle calls to setting the xPosition of crosshairs
        this.subscriptions.push(this._xTimestampSubject.pipe(
            throttleTime(
                1000/60, // 60Hz
                undefined,
                { leading: true, trailing: true }
            )
        ).subscribe( hoveredTime => {
            const timeIndex = this._getNearestTick( hoveredTime );
            this.hoveredTime = this.timeTicks[timeIndex];
            this.crosshairPositionPercent = ( timeIndex * 100 ) / ( this.timeTicks.length - 1 );
            // only update scicharts crosshair when the time player is playing or being hovered
            if ( this._playingService.playing$.value === true || this.timePlayerHover ) {
                this._plotsService.setXyPosition( this.plotId, hoveredTime * 1000 );
            }
        }));

        // subscribe to hovering on the scicharts plots
        this.subscriptions.push( this._plotsService.xyPosition$.pipe(
            filter( position => position != null ),
            distinctUntilChanged( ( prev, curr ) => prev.xPosition === curr.xPosition )
        ).subscribe( ( xyPosition ) => {
            if ( !this.timePlayerHover ) {
                this._xTimestampSubject.next( xyPosition.xPosition / 1000 );
            }
        }));

        // when the user clicks on the image plot (or a plot), set the time player crosshair to the nearest tick
        // the image service is also called whenever the user clicks on a plot, so this is the only update needed
        // when an image dataset is present
        this.subscriptions.push( this._imageViewerService.syncTime$.pipe(
            filter( ( time ) => time != null ),
            distinctUntilChanged( (prev, curr) => prev.timestamp === curr.timestamp )
        ).subscribe( ( time ) => {
            if ( this.hasImageDatasets && !this.timePlayerHover && this._playingService.playing$.value === false ) {
                const nearestTimeIndex = this._getNearestTick( time.timestamp / 1000 );
                this.updateTime.emit( nearestTimeIndex );
            }
        }));

        // when the user clicks on a scicharts plot, set the time player crosshair to the nearest tick
        this.subscriptions.push(this._plotsService.xyClicked$.subscribe(( plotClicked ) => {
            if ( !this.hasImageDatasets ) {
                const timestampInSeconds = plotClicked.xPosition / 1000;
                const nearestTimeIndex = this._getNearestTick( timestampInSeconds );
                this.updateTime.emit( nearestTimeIndex );
            }
        }));
    }

    ngOnDestroy(): void {
        // stop playing and set index when time player is destroyed
        this._playingService.playing$.next(false);
        this.updateTime.emit( this.timeIndex );
        this.statusSubscription.unsubscribe();
        this.subscriptions.forEach( subscription => subscription.unsubscribe() );
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

    hoverTimeline( event: MouseEvent ) {
        // don't do mouse interaction when playing
        if ( this._playingService.playing$.value === false ) {
            this.timePlayerHover = true;
            // this is hacky and relies on the .mdc-slider__input styles, if these styles change, this will likely break
            // the idea is to get the bounding box and parse the style strings to determine an accurate x position of the mouse relative
            // to the slider ( mouseXPosition - boundingBoxXPosition + leftStyles)
            // and to get an accurate width of the slider ( clientWidth - paddingLeft - paddingRight )
            const boundingBoxXPosition = (event.target as HTMLElement).getBoundingClientRect().x;
            const transformLeft = parseInt((event.target as HTMLElement).style.left, 10);
            const additionalPadding =
                parseInt((event.target as HTMLElement).style.paddingLeft, 10) +
                parseInt((event.target as HTMLElement).style.paddingRight, 10);
            const additionalWidth = parseInt((event.target as HTMLElement).style.width.split('+')[1], 10);

            const xPosition: number = event.x - boundingBoxXPosition + transformLeft;
            const sliderWidth: number = (event.target as HTMLElement).clientWidth - additionalPadding - additionalWidth;
            // use timeScale to convert the xPosition/sliderWidth ratio to a timestamp
            const hoveredTimestamp: number = this.timeScale( xPosition / sliderWidth );
            this._xTimestampSubject.next(hoveredTimestamp);
        }
    }

    mouseleave() {
        // turn off updates to scicharts
        this.timePlayerHover = false;
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
        if ( this._playingService.playing$.value === true) {
            this.setTimeIndex( nextIndex );
        }
    }

    setTimeIndex( newIndex: number ) {
        // setting the index will drive the image-push subscription
        this.session.call('pv.time.index.set', [ newIndex ]);
        const timestamp = this.timeTicks[newIndex];
        this._xTimestampSubject.next(timestamp);
        if ( this.hasImageDatasets ) {
            this._imageViewerService.updateTimeSync({ timestamp: timestamp * 1000 });
        }
    }

    togglePlay() {
        const playingStatus = this._playingService.playing$.value;
        this._playingService.playing$.next(!playingStatus);
    }

    /** find the closest tick value to a given timestamp */
    private _getNearestTick( timestamp: number ): number {
        const nearestTimestamp = this.findNearestValue( timestamp, this.timeTicks );
        return this.timeTicks.indexOf( nearestTimestamp );
    }
}
