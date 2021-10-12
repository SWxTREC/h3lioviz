import { ChangeContext, Options } from '@angular-slider/ngx-slider';
import { Component, Input, OnChanges, OnDestroy } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { snakeCase } from 'lodash';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
    selector: 'swt-control-panel',
    templateUrl: './control-panel.component.html',
    styleUrls: [ './control-panel.component.scss' ]
})
export class ControlPanelComponent implements OnChanges, OnDestroy {
    @Input() pvView: any;

    // TODO: set these in the server on load, possibly create a constant for all load configurations
    LUT_RANGE: { [param: string]: [number, number] } = {
        Velocity: [ 300, 900 ],
        Density: [ 0, 30 ],
        Temperature: [ 1e4, 1e6 ],
        Br: [ -10, 10 ],
        Bx: [ -10, 10 ],
        By: [ -10, 10 ],
        Bz: [ -10, 10 ]
    };
    // TODO: variables list of objects with serverName, name, units, range

    colorVariables: string[] = [ 'Velocity', 'Density', 'Temperature', 'B', 'Bx', 'By', 'Bz' ];
    defaultColorVariable = this.colorVariables[ 6 ];
    colorOptions: Options = {
        floor: this.LUT_RANGE[ this.defaultColorVariable ][0],
        ceil: this.LUT_RANGE[ this.defaultColorVariable ][1],
        step: 5
    };
    defaultThresholdVariable = this.defaultColorVariable;
    colorRange: [number, number] = ( this.LUT_RANGE[ this.defaultColorVariable ] );
    controlPanel: FormGroup = new FormGroup({
        colorVariable: new FormControl( this.defaultColorVariable ),
        cme: new FormControl( true ),
        latSlice: new FormControl( true ),
        lonArrows: new FormControl( false ),
        lonSlice: new FormControl( false ),
        lonStreamlines: new FormControl( false ),
        opacity: new FormControl(90),
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
        opacity: 90,
        threshold: false,
        thresholdVariable: this.defaultThresholdVariable
    };
    renderDebouncer: Subject<string> = new Subject<string>();
    session: { call: (arg0: string, arg1: any[]) => Promise<any>; };
    subscriptions: Subscription[] = [];
    thresholdOptions: Options = {
        floor: this.LUT_RANGE[ this.defaultThresholdVariable ][0],
        ceil: this.LUT_RANGE[ this.defaultThresholdVariable ][1],
        step: 5
    };
    thresholdRange: [number, number] = ( this.LUT_RANGE[ this.defaultThresholdVariable ]);
    zoomState: 'on' | 'off' = 'on';

    constructor() {
        this.subscriptions.push( this.controlPanel.valueChanges
            .pipe( debounceTime( 300 ) ).subscribe( newFormValues => {
                this.updateVisibilityControls( newFormValues );
                // this will render every time any part of the form is updated
                this.renderDebouncer.next('visibility');

            }));
        this.subscriptions.push( this.controlPanel.controls.colorVariable.valueChanges
            .pipe( debounceTime( 300 ) ).subscribe( newColorVariable => {
                const colorVariableName = newColorVariable.toLowerCase();
                const twentySteps = (this.LUT_RANGE[ newColorVariable ][1] - this.LUT_RANGE[ newColorVariable ][0]) / 20;
                this.session.call('pv.enlil.colorby', [ colorVariableName ]);
                this.colorOptions = {
                    floor: this.LUT_RANGE[ newColorVariable ][0],
                    ceil: this.LUT_RANGE[ newColorVariable ][1],
                    step: twentySteps
                };
                this.session.call('pv.enlil.set_range', [ colorVariableName, this.colorRange ]);
            }));
        this.subscriptions.push( this.controlPanel.controls.thresholdVariable.valueChanges
            .pipe( debounceTime( 300 ) ).subscribe( newThresholdVariable => {
                const thresholdVariableName = newThresholdVariable.toLowerCase();
                // TODO: make this a function that takes the number of steps as a parameter
                const twentySteps = (this.LUT_RANGE[ newThresholdVariable ][1] - this.LUT_RANGE[ newThresholdVariable ][0]) / 20;
                this.thresholdOptions = {
                    floor: this.LUT_RANGE[ newThresholdVariable ][0],
                    ceil: this.LUT_RANGE[ newThresholdVariable ][1],
                    step: twentySteps
                };
                const quarter = 5 * this.thresholdOptions.step;
                const defaultThresholdRange: [number, number] =
                    [ this.thresholdOptions.floor + quarter, this.thresholdOptions.ceil - quarter ];
                this.thresholdRange = defaultThresholdRange;
                this.session.call('pv.enlil.set_threshold', [ thresholdVariableName, defaultThresholdRange ]);
            }));
        this.subscriptions.push( this.controlPanel.controls.opacity.valueChanges
            .pipe( debounceTime( 300 ) ).subscribe( newOpacity => {
                const name = this.controlPanel.value.colorVariable.toLowerCase();
                const opacity = this.controlPanel.value.opacity / 100;
                if ( name[ 0 ] === 'b' ) {
                    this.session.call( 'pv.enlil.set_opacity', [ name, [ opacity, opacity, opacity ] ] );
                } else {
                    this.session.call( 'pv.enlil.set_opacity', [ name, [ opacity, opacity ] ] );
                }
            }));
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
            // const colorVariableName = this.controlPanel.value.colorVariable.toLowerCase();
            if (typeof controlStates[ controlName ] === 'boolean') {
                const name = snakeCase( controlName );
                const state = controlStates[ controlName ] === true ? 'on' : 'off';
                this.session.call( 'pv.enlil.visibility', [ name, state ] );
            }
        });
    }

    updateColorRange( event: ChangeContext ) {
        const newColorRange: [ number, number ] = [ event.value, event.highValue ];
        this.colorRange = newColorRange;
        this.session.call('pv.enlil.set_range', [ this.controlPanel.value.colorVariable.toLowerCase(), this.colorRange ] );
    }

    updateThresholdRange( event: ChangeContext ) {
        const newThresholdRange: [ number, number ] = [ event.value, event.highValue ];
        this.thresholdRange = newThresholdRange;
        this.session.call('pv.enlil.set_threshold', [ this.controlPanel.value.thresholdVariable.toLowerCase(), this.thresholdRange ] );
    }
}
