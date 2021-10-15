import { ChangeContext, Options } from '@angular-slider/ngx-slider';
import { Component, Input, OnChanges, OnDestroy } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { snakeCase } from 'lodash';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { IVariableInfo } from 'src/app/models';

@Component({
    selector: 'swt-control-panel',
    templateUrl: './control-panel.component.html',
    styleUrls: [ './control-panel.component.scss' ]
})
export class ControlPanelComponent implements OnChanges, OnDestroy {
    @Input() pvView: any;

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

    variables: string[] = Object.keys(this.VARIABLE_CONFIG);
    defaultColorVariable = this.variables[ 6 ];
    colorOptions: Options = {
        floor: this.VARIABLE_CONFIG[ this.defaultColorVariable ].range[0],
        ceil: this.VARIABLE_CONFIG[ this.defaultColorVariable ].range[1],
        step: this.VARIABLE_CONFIG[ this.defaultColorVariable ].step
    };
    defaultThresholdVariable = this.variables[ 1 ];
    colorRange: [number, number] = ( this.VARIABLE_CONFIG[ this.defaultColorVariable ].range );
    controlPanel: FormGroup = new FormGroup({
        colorVariable: new FormControl( this.defaultColorVariable ),
        cme: new FormControl( true ),
        latSlice: new FormControl( true ),
        lonArrows: new FormControl( false ),
        lonSlice: new FormControl( false ),
        lonStreamlines: new FormControl( false ),
        opacity: new FormControl([ 0, 90 ]),
        threshold: new FormControl( false ),
        thresholdVariable: new FormControl( this.defaultThresholdVariable )
    });
    initialControlPanelValues = {
        colorVariable: this.defaultColorVariable,
        cme: true,
        latSlice: true,
        lonArrows: false,
        lonSlice: false,
        lonStreamlines: false,
        opacity: [ 0, 90 ],
        threshold: false,
        thresholdVariable: this.defaultThresholdVariable
    };
    opacityOptions: Options = {
        floor: 0,
        ceil: 100,
        step: 10
    };
    renderDebouncer: Subject<string> = new Subject<string>();
    session: { call: (arg0: string, arg1: any[]) => Promise<any>; };
    subscriptions: Subscription[] = [];
    thresholdOptions: Options = {
        floor: this.VARIABLE_CONFIG[ this.defaultThresholdVariable ].range[0],
        ceil: this.VARIABLE_CONFIG[ this.defaultThresholdVariable ].range[1],
        step: this.VARIABLE_CONFIG[ this.defaultThresholdVariable ].step
    };
    thresholdRange: [number, number] = ( this.VARIABLE_CONFIG[ this.defaultThresholdVariable ].range);
    zoomState: 'on' | 'off' = 'on';

    constructor() {
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
                const colorVariableServerName = this.VARIABLE_CONFIG[ newColorVariable ].serverName;
                this.session.call('pv.enlil.colorby', [ colorVariableServerName ]);
                this.colorOptions = {
                    floor: this.VARIABLE_CONFIG[ newColorVariable ].range[0],
                    ceil: this.VARIABLE_CONFIG[ newColorVariable ].range[1],
                    step: this.VARIABLE_CONFIG[ newColorVariable ].step
                };
                this.colorRange = this.VARIABLE_CONFIG[ newColorVariable ].range;
                this.session.call('pv.enlil.set_range', [ colorVariableServerName, this.colorRange ]);
            }));
        // subscribe to threshold variable changes and reset threshold slider options, threshold range, and 'set_threshold'
        this.subscriptions.push( this.controlPanel.controls.thresholdVariable.valueChanges
            .pipe( debounceTime( 300 ) ).subscribe( newThresholdVariable => {
                const thresholdVariableServerName = this.VARIABLE_CONFIG[ newThresholdVariable ].serverName;
                this.thresholdOptions = {
                    floor: this.VARIABLE_CONFIG[ newThresholdVariable ].range[0],
                    ceil: this.VARIABLE_CONFIG[ newThresholdVariable ].range[1],
                    step: this.VARIABLE_CONFIG[ newThresholdVariable ].step
                };
                this.thresholdRange = this.VARIABLE_CONFIG[ newThresholdVariable ].defaultRange;
                this.session.call('pv.enlil.set_threshold', [ thresholdVariableServerName, this.thresholdRange ]);
            }));
        // subscribe to opacity slider and 'set_opacity'
        this.subscriptions.push( this.controlPanel.controls.opacity.valueChanges
            .pipe( debounceTime( 300 ) ).subscribe( () => {
                const name = this.VARIABLE_CONFIG[this.controlPanel.value.colorVariable].serverName;
                const opacityLow: number = this.controlPanel.value.opacity[0] / 100;
                const opacityHigh: number = this.controlPanel.value.opacity[1] / 100;
                if ( name[ 0 ] === 'b' ) {
                    this.session.call( 'pv.enlil.set_opacity', [ name, [ opacityHigh, opacityLow, opacityHigh ] ] );
                } else {
                    this.session.call( 'pv.enlil.set_opacity', [ name, [ opacityLow, opacityHigh ] ] );
                }
            }));
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
            this.controlPanel.setValue( this.initialControlPanelValues );
        }
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach( subscription => subscription.unsubscribe() );
    }

    resetZoom() {
        this.pvView.get().viewStream.resetCamera();
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
        const variable: string = this.controlPanel.value.colorVariable;
        this.colorRange = [ event.value, event.highValue ];
        this.session.call('pv.enlil.set_range', [ this.VARIABLE_CONFIG[ variable ].serverName, this.colorRange ] );
        this.renderDebouncer.next();
    }

    updateThresholdRange( event: ChangeContext ) {
        const variable: string = this.controlPanel.value.thresholdVariable;
        this.thresholdRange = [ event.value, event.highValue ];
        this.session.call('pv.enlil.set_threshold', [ this.VARIABLE_CONFIG[ variable ].serverName, this.thresholdRange ] );
        this.renderDebouncer.next();
    }
}
