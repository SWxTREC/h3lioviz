import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { snakeCase } from 'lodash';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
    selector: 'swt-control-panel',
    templateUrl: './control-panel.component.html',
    styleUrls: [ './control-panel.component.scss' ]
})
export class ControlPanelComponent {
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
    timeIndex = 0;
    zoomState: 'on' | 'off' = 'on';
    playingDebouncer: Subject<boolean> = new Subject<boolean>();

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
        ).subscribe(() => {
            const session = this.pvView.get().session;
            if ( this.playing ) {
                session.call( 'pv.time.index.get', [] ).then(( index: number ) => this.playTimeSteps( session, index ));
            }
        });
    }

    resetZoom() {
        this.pvView.get().viewStream.resetCamera();
    }

    getTime(index: { value: number; }) {
        this.numberDebouncer.next( index.value );
    }

    playTimeSteps( session: { call: (arg0: string, arg1: number[]) => Promise<any>; }, index: number ) {
        if (this.playing) {
            const incremented = index + 1;
            session.call('pv.time.index.set', [ incremented ]).then( () => {
                this.timeIndex = incremented;
                if ( this.timeIndex < this.timeTicks.length - 1 ) {
                    this.playTimeSteps(session, this.timeIndex );
                } else {
                    // stop when last time step is reached
                    this.playing = false;
                }
            });
        } else {
            // stop when the pause button is pressed
            session.call( 'pv.time.index.set', [ index ] );
        }
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
        const session = this.pvView.get().session;
        Object.keys( controlStates ).forEach( controlName => {
            if (typeof controlStates[ controlName ] === 'boolean') {
                const name = snakeCase( controlName );
                const state = controlStates[ controlName ] === true ? 'on' : 'off';
                if ( typeof controlStates[ controlName ] === 'boolean' ) {
                    session.call( 'pv.enlil.visibility', [ name, state ] );
                }
            } else if ( controlName === 'opacity' ) {
                const name = this.controlPanel.value.colorVariable.toLowerCase();
                const opacity = this.controlPanel.value.opacity / 100;
                if ( name[ 0 ] === 'b' ) {
                    session.call( 'pv.enlil.set_opacity', [ name, [ opacity, opacity, opacity ] ] );
                } else {
                    session.call( 'pv.enlil.set_opacity', [ name, [ opacity, opacity ] ] );
                }
            } else if ( controlName === 'colorVariable' ) {
                const serverVariableName = this.controlPanel.value.colorVariable.toLowerCase();
                session.call('pv.enlil.colorby', [ serverVariableName ]);
            }
        });
        this.pvView.render();
    }
}
