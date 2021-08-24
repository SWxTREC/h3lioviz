import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { snakeCase } from 'lodash';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
    selector: 'swt-control-panel',
    templateUrl: './control-panel.component.html',
    styleUrls: [ './control-panel.component.scss' ]
})
export class ControlPanelComponent implements OnChanges {
    @Input() pvView: any;
    @Input() timeTicks: number[];
    @Output() updateTime = new EventEmitter();

    colorVariables: string[] = [ 'Velocity', 'Density', 'Temperature', 'B', 'Bx', 'By', 'Bz' ];
    controlPanel: FormGroup = new FormGroup({
        bvec: new FormControl( false ),
        colorVariable: new FormControl( 'Bz'),
        cme: new FormControl( true ),
        latSlice: new FormControl( true ),
        lonArrows: new FormControl( false ),
        lonSlice: new FormControl( false ),
        lonStreamlines: new FormControl( false ),
        magneticFields: new FormGroup({
            x: new FormControl({ value: false, disabled: true }),
            y: new FormControl({ value: false, disabled: true }),
            z: new FormControl({ value: false, disabled: true })
        }),
        opacity: new FormControl(90)
    });
    displayedTime: number;
    numberDebouncer: Subject<number> = new Subject<number>();
    playing = false;
    playingDebouncer: Subject<boolean> = new Subject<boolean>();
    session: { call: (arg0: string, arg1: any[]) => Promise<any>; };
    startTime: string;
    timeIndex = 0;
    zoomState: 'on' | 'off' = 'on';

    constructor() {
        this.controlPanel.valueChanges.pipe(debounceTime( 300 )).subscribe( newFormValues => {
            this.updateControls( newFormValues );
        });
        this.updateTime.emit(0);
        this.numberDebouncer.pipe(
            debounceTime(300)
        ).subscribe((value) => this.updateTime.emit(value));
        this.playingDebouncer.pipe(
            debounceTime(300)
        ).subscribe( (playing: boolean) => {
            if ( playing ) {
                // play when play button is pressed
                this.playTimesteps( this.timeIndex );
            } else {
                // stop when the pause button is pressed
                this.session.call( 'pv.time.index.set', [ this.timeIndex ] );
            }
        });
    }

    ngOnChanges() {
        // get session once, when pvView is defined
        if ( this.pvView && !this.session ) {
            this.session = this.pvView.get().session;
            // Time within the app is always in seconds from this epoch UTC
            this.startTime = '1970-01-01T00:00';
            // initialize server to state of form
            this.updateControls( this.controlPanel.value );
        }
    }

    newTimestep(index: { value: number; }) {
        // if playing, immediately stop when there is a click on the timeline
        if ( this.playing ) {
            this.playing = false;
        }
        this.numberDebouncer.next( index.value );
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
                    this.session.call('pv.time.index.set', [ this.timeIndex ]);
                }
            });
        } else {
            // stop when last time step is reached
            this.playing = false;
            this.timeIndex = this.timeTicks.length - 1;
            this.session.call('pv.time.index.set', [ this.timeIndex ]);
        }
    }

    resetZoom() {
        this.pvView.get().viewStream.resetCamera();
    }

    togglePlay() {
        this.playing = !this.playing;
        this.playingDebouncer.next( this.playing );
    }

    toggleZoom() {
        const getZoom = this.pvView.get().rpcWheelEvent;
        // if zoom is on, turn it off and vice versa
        if (getZoom) {
            this.zoomState = 'off';
            this.pvView.setRpcWheelEvent( undefined );
        } else {
            this.zoomState = 'on';
            this.pvView.setRpcWheelEvent( 'viewport.mouse.zoom.wheel' );
        }
    }

    updateControls(controlStates: { [parameter: string]: any; }) {
        Object.keys( controlStates ).forEach( controlName => {
            if (typeof controlStates[ controlName ] === 'boolean') {
                const name = snakeCase( controlName );
                const state = controlStates[ controlName ] === true ? 'on' : 'off';
                if ( typeof controlStates[ controlName ] === 'boolean' ) {
                    this.session.call( 'pv.enlil.visibility', [ name, state ] );
                }
            } else if ( controlName === 'opacity' ) {
                const name = this.controlPanel.value.colorVariable.toLowerCase();
                const opacity = this.controlPanel.value.opacity / 100;
                if ( name[ 0 ] === 'b' ) {
                    this.session.call( 'pv.enlil.set_opacity', [ name, [ opacity, opacity, opacity ] ] );
                } else {
                    this.session.call( 'pv.enlil.set_opacity', [ name, [ opacity, opacity ] ] );
                }
            } else if ( controlName === 'colorVariable' ) {
                const serverVariableName = this.controlPanel.value.colorVariable.toLowerCase();
                this.session.call('pv.enlil.colorby', [ serverVariableName ]);
            }
        });
        this.pvView.render();
    }
}
