import { ChangeContext, Options } from '@angular-slider/ngx-slider';
import { Component, Input, OnChanges, OnDestroy } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { snakeCase } from 'lodash';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { IKeyboard, IVariableInfo, KEYBOARD_SHORTCUTS } from 'src/app/models';

@Component({
    selector: 'swt-control-panel',
    templateUrl: './control-panel.component.html',
    styleUrls: [ './control-panel.component.scss' ]
})
export class ControlPanelComponent implements OnChanges, OnDestroy {
    @Input() pvView: any;
    keyboardShortcuts = KEYBOARD_SHORTCUTS;

    // TODO: set these in the server on load
    VARIABLE_CONFIG: { [param: string]: IVariableInfo } = {
        velocity: {
            serverName: 'velocity',
            displayName: 'Velocity',
            units: 'km/s',
            range: [ 300, 900 ],
            defaultRange: [ 600, 900 ],
            step: 100
        },
        density: {
            serverName: 'density',
            displayName: 'Density',
            units: 'r<sup>2</sup>N/cm<sup>3</sup>',
            range: [ 0, 30 ],
            defaultRange: [ 15, 30 ],
            step: 1
        },
        temperature: {
            serverName: 'temperature',
            displayName: 'Temperature',
            units: 'K',
            range: [ 10000, 1000000 ],
            defaultRange: [ 500000, 1000000 ],
            step: 10000
        },
        b: {
            serverName: 'b',
            displayName: 'B',
            units: 'nT',
            range: [ -10, 10 ],
            defaultRange: [ -10, 0 ],
            step: 1
        },
        bx: {
            serverName: 'bx',
            displayName: 'Bx',
            units: 'nT',
            range: [ -10, 10 ],
            defaultRange: [ -10, 0 ],
            step: 1
        },
        by: {
            serverName: 'by',
            displayName: 'By',
            units: 'nT',
            range: [ -10, 10 ],
            defaultRange: [ -10, 0 ],
            step: 1
        },
        bz: {
            serverName: 'bz',
            displayName: 'Bz',
            units: 'nT',
            range: [ -10, 10 ],
            defaultRange: [ -10, 0 ],
            step: 1
        }
    };
    defaultColorVariable: IVariableInfo = this.VARIABLE_CONFIG.velocity;
    defaultThresholdVariable: IVariableInfo = this.VARIABLE_CONFIG.density;
    CONTROL_PANEL_DEFAULT_VALUES = {
        colorVariable: this.defaultColorVariable,
        cme: true,
        latSlice: true,
        lonArrows: false,
        lonSlice: true,
        lonStreamlines: false,
        opacity: [ 0, 90 ],
        threshold: false,
        thresholdVariable: this.defaultThresholdVariable
    };

    colorOptions: Options = {
        floor: this.defaultColorVariable.range[0],
        ceil: this.defaultColorVariable.range[1],
        step: this.defaultColorVariable.step,
        animate: false
    };
    colorRange: [number, number] = ( this.defaultColorVariable.range );
    controlPanel: FormGroup = new FormGroup({});
    opacityOptions: Options = {
        floor: 0,
        ceil: 100,
        step: 10,
        animate: false
    };
    renderDebouncer: Subject<string> = new Subject<string>();
    session: { call: (arg0: string, arg1: any[]) => Promise<any>; };
    subscriptions: Subscription[] = [];
    thresholdOptions: Options = {
        floor: this.defaultThresholdVariable.range[0],
        ceil: this.defaultThresholdVariable.range[1],
        step: this.defaultThresholdVariable.step,
        animate: false
    };
    thresholdRange: [number, number] = ( this.defaultThresholdVariable.range );
    variables: IVariableInfo[] = Object.values(this.VARIABLE_CONFIG);
    zoomState: 'on' | 'off' = 'on';

    constructor() {
        // create FormGroup with default control panel names and values
        Object.keys(this.CONTROL_PANEL_DEFAULT_VALUES).forEach( controlName => {
            this.controlPanel.addControl(controlName, new FormControl(this.CONTROL_PANEL_DEFAULT_VALUES[controlName]));
        });
        // debounce render
        this.subscriptions.push(
            this.renderDebouncer.pipe(
                debounceTime( 300 )
            ).subscribe(() => {
                this.pvView.render();
            }
        ));
    }

    ngOnChanges(): void {
        // get session once, when pvView is defined
        if ( this.pvView && !this.session ) {
            this.session = this.pvView.get().session;
            // once we have a session, set form subscriptions
            this.setFormSubscriptions();
            // once form is interacting with session via subscriptions, set the defaults
            this.controlPanel.setValue( this.CONTROL_PANEL_DEFAULT_VALUES );
        }
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach( subscription => subscription.unsubscribe() );
    }

    resetZoom() {
        this.pvView.get().viewStream.resetCamera();
    }

    setFormSubscriptions() {
        // subscribe to any form change
        this.subscriptions.push( this.controlPanel.valueChanges
            .pipe( debounceTime( 300 ) ).subscribe( newFormValues => {
                this.updateVisibilityControls( newFormValues );
                // this will render every time any named control of the form is updated
                // the threshold and color ranges are outside of the form and are updated and rendered manually
                this.renderDebouncer.next();
            }));
        // subscribe to color variable changes and reset color slider options, color range, and 'set_range' for color
        this.subscriptions.push( this.controlPanel.controls.colorVariable.valueChanges
            .pipe( debounceTime( 300 ) ).subscribe( newColorVariable => {
                const colorVariableServerName = newColorVariable.serverName;
                this.session.call('pv.enlil.colorby', [ colorVariableServerName ]);
                this.colorOptions = {
                    floor: newColorVariable.range[0],
                    ceil: newColorVariable.range[1],
                    step: newColorVariable.step,
                    animate: false
                };
                this.colorRange = newColorVariable.range;
                this.session.call('pv.enlil.set_range', [ colorVariableServerName, this.colorRange ]);
            }));
        // subscribe to threshold variable changes and reset threshold slider options, threshold range, and 'set_threshold'
        this.subscriptions.push( this.controlPanel.controls.thresholdVariable.valueChanges
            .pipe( debounceTime( 300 ) ).subscribe( newThresholdVariable => {
                const thresholdVariableServerName = newThresholdVariable.serverName;
                this.thresholdOptions = {
                    floor: newThresholdVariable.range[0],
                    ceil: newThresholdVariable.range[1],
                    step: newThresholdVariable.step,
                    animate: false
                };
                this.thresholdRange = newThresholdVariable.defaultRange;
                this.session.call('pv.enlil.set_threshold', [ thresholdVariableServerName, this.thresholdRange ]);
            }));
        // subscribe to opacity slider and 'set_opacity'
        this.subscriptions.push( this.controlPanel.controls.opacity.valueChanges
            .pipe( debounceTime( 300 ) ).subscribe( () => {
                const name = this.controlPanel.value.colorVariable.serverName;
                const opacityLow: number = this.controlPanel.value.opacity[0] / 100;
                const opacityHigh: number = this.controlPanel.value.opacity[1] / 100;
                if ( name[ 0 ] === 'b' ) {
                    this.session.call( 'pv.enlil.set_opacity', [ name, [ opacityHigh, opacityLow, opacityHigh ] ] );
                } else {
                    this.session.call( 'pv.enlil.set_opacity', [ name, [ opacityLow, opacityHigh ] ] );
                }
            }));
    }

    snapTo( view: string ) {
        this.session.call( 'pv.enlil.snap_to_view', [ view ] );
        this.renderDebouncer.next();
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

    updateVisibilityControls(controlStates: { [parameter: string]: any; }) {
        Object.keys( controlStates ).forEach( controlName => {
            if (typeof controlStates[ controlName ] === 'boolean') {
                const name = snakeCase( controlName );
                const state = controlStates[ controlName ] === true ? 'on' : 'off';
                this.session.call( 'pv.enlil.visibility', [ name, state ] );
            }
        });
    }

    updateColorRange( event: ChangeContext ) {
        const variable: IVariableInfo = this.controlPanel.value.colorVariable;
        this.colorRange = [ event.value, event.highValue ];
        this.session.call('pv.enlil.set_range', [ variable.serverName, this.colorRange ] );
        this.renderDebouncer.next();
    }

    updateThresholdRange( event: ChangeContext ) {
        const variable: IVariableInfo = this.controlPanel.value.thresholdVariable;
        this.thresholdRange = [ event.value, event.highValue ];
        this.session.call('pv.enlil.set_threshold', [ variable.serverName, this.thresholdRange ] );
        this.renderDebouncer.next();
    }
}
