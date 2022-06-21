import { ChangeContext, Options } from '@angular-slider/ngx-slider';
import { Component, Input, OnChanges, OnDestroy } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { clone, snakeCase } from 'lodash';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import {
    COLORMAPS,
    CONTROL_PANEL_DEFAULT_VALUES,
    INITIAL_TICK_STEP,
    IVariableInfo,
    KEYBOARD_SHORTCUTS,
    VARIABLE_CONFIG
} from 'src/app/models';

@Component({
    selector: 'swt-control-panel',
    templateUrl: './control-panel.component.html',
    styleUrls: [ './control-panel.component.scss' ]
})
export class ControlPanelComponent implements OnChanges, OnDestroy {
    @Input() pvView: any;
    keyboardShortcuts = KEYBOARD_SHORTCUTS;

    defaultColorVariable: IVariableInfo = CONTROL_PANEL_DEFAULT_VALUES.colorVariable;
    defaultThresholdVariable: IVariableInfo = CONTROL_PANEL_DEFAULT_VALUES.thresholdVariable;
    defaultContourVariable: IVariableInfo = CONTROL_PANEL_DEFAULT_VALUES.contourVariable;
    colorOptions: Options = {
        floor: this.defaultColorVariable.entireRange[0],
        ceil: this.defaultColorVariable.entireRange[1],
        combineLabels: (min, max) => min + ' to ' + max,
        step: this.defaultColorVariable.step,
        animate: false
    };
    colormaps = COLORMAPS;
    colorRange: [ number, number ] = ( this.defaultColorVariable.defaultColorRange );
    controlPanel: FormGroup = new FormGroup({});
    colorbarLeftOffset = '0';
    colorbarRightOffset = '0';
    colorVariableServerName: string = this.defaultColorVariable.serverName;
    // contourArray keeps track of the array of contour values sent to the server
    // the numbers are calculated from the contour range and the number of contours
    contourArray: number[] = [];
    // contourRange keeps track of the user settings on the contour range slider
    contourRange: [number, number] = ( this.defaultContourVariable.defaultSubsetRange );
    contourOptions: Options = {
        floor: this.defaultContourVariable.entireRange[0],
        ceil: this.defaultContourVariable.entireRange[1],
        combineLabels: (min, max) => min + ' to ' + max,
        step: this.defaultContourVariable.step,
        animate: false,
        showTicksValues: true,
        tickStep: INITIAL_TICK_STEP,
        ticksArray: [ this.defaultContourVariable.defaultSubsetRange[0] + INITIAL_TICK_STEP ]
    };
    lonSliceAngle: string;
    lonSliceOptions = {
        validRange: [ -10, 10 ],
        stepSize: 0.5
    };
    opacityOptions: Options = {
        floor: 0,
        ceil: 100,
        combineLabels: (min, max) => min + ' to ' + max,
        step: 10,
        animate: false,
        hideLimitLabels: true,
        translate: (value: number): string => {
            return value + '%';
        }
    };
    renderDebouncer: Subject<string> = new Subject<string>();
    session: { call: (arg0: string, arg1: any[]) => Promise<any> };
    showAngleAdjust = false;
    subscriptions: Subscription[] = [];
    thresholdOptions: Options = {
        floor: this.defaultThresholdVariable.entireRange[0],
        ceil: this.defaultThresholdVariable.entireRange[1],
        combineLabels: (min, max) => min + ' to ' + max,
        step: this.defaultThresholdVariable.step,
        animate: false
    };
    thresholdRange: [number, number] = ( this.defaultThresholdVariable.defaultSubsetRange );
    userColormaps: { [parameter: string]: { displayName: string; serverName: string } } = {};
    userColorRanges: { [parameter: string]: [ number, number ] } = {};
    userContourRanges: { [parameter: string]: [ number, number ] } = {};
    userOpacities: { [parameter: string]: [ number, number ] } = {};
    userThresholdRanges: { [parameter: string]: [ number, number ] } = {};
    variableConfigurations = VARIABLE_CONFIG;
    zoomState: 'on' | 'off' = 'on';

    constructor() {
        // initialize FormGroup with default control panel names and values
        Object.keys(CONTROL_PANEL_DEFAULT_VALUES).forEach( controlName => {
            this.controlPanel.addControl(controlName, new FormControl( CONTROL_PANEL_DEFAULT_VALUES[controlName]));
        });
        // create user objects from session storage if it exists, or from defaults
        // colormaps
        if ( sessionStorage.getItem('colormaps') ) {
            this.userColormaps = JSON.parse(sessionStorage.getItem('colormaps'));
        } else {
            Object.keys(VARIABLE_CONFIG).forEach( (variable) => {
                this.userColormaps[variable] = VARIABLE_CONFIG[variable].defaultColormap;
            });
        }
        // colorRanges
        if ( sessionStorage.getItem('colorRanges')) {
            this.userColorRanges = JSON.parse(sessionStorage.getItem('colorRanges'));
        } else {
            Object.keys(VARIABLE_CONFIG).forEach( (variable) => {
                this.userColorRanges[variable] = VARIABLE_CONFIG[variable].defaultColorRange;
            });
        }
        // contours
        if ( sessionStorage.getItem('contourRanges')) {
            this.userContourRanges = JSON.parse(sessionStorage.getItem('contourRanges'));
        } else {
            Object.keys(VARIABLE_CONFIG).forEach( (variable) => {
                this.userContourRanges[variable] = VARIABLE_CONFIG[variable].defaultSubsetRange;
            });
        }
        // lonSliceAngle
        if ( sessionStorage.getItem('lonSliceAngle')) {
            this.lonSliceAngle = JSON.parse(sessionStorage.getItem('lonSliceAngle'));
        } else {
            this.lonSliceAngle = parseFloat('0').toFixed(1);
        }
        // opacities
        if ( sessionStorage.getItem('opacities')) {
            this.userOpacities = JSON.parse(sessionStorage.getItem('opacities'));
        } else {
            Object.keys(VARIABLE_CONFIG).forEach( (variable) => {
                this.userOpacities[variable] = CONTROL_PANEL_DEFAULT_VALUES.opacity;
            });
        }
        // thresholdRanges
        if ( sessionStorage.getItem('thresholdRanges')) {
            this.userThresholdRanges = JSON.parse(sessionStorage.getItem('thresholdRanges'));
        } else {
            Object.keys(VARIABLE_CONFIG).forEach( (variable) => {
                this.userThresholdRanges[variable] = VARIABLE_CONFIG[variable].defaultSubsetRange;
            });
        }

        // debounce render
        this.subscriptions.push(
            this.renderDebouncer.pipe(
                debounceTime( 300 )
            ).subscribe(() => {
                this.pvView.render();
                this.saveUserSettings();
            }
            ));
    }

    ngOnChanges(): void {
        // get session once, when pvView is defined
        if ( this.pvView && !this.session ) {
            this.session = this.pvView.get().session;
            // once we have a session, set form subscriptions
            this.setFormSubscriptions();
            // once form is interacting with session via subscriptions, initialize the form from sessionStorage or defaults
            const initialFormValues = clone(JSON.parse(sessionStorage.getItem('controlPanel'))) || clone(CONTROL_PANEL_DEFAULT_VALUES);
            this.controlPanel.setValue( initialFormValues );
            this.session.call('pv.enlil.rotate_plane', [ 'lon', Number( this.lonSliceAngle ) ] );
        }
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach( subscription => subscription.unsubscribe() );
    }

    // This mat-select compareWith function is used to verify the proper label for the selection in the dropdown
    compareObjectNames(o1: any, o2: any): boolean {
        return o1.displayName === o2.displayName;
    }

    getPercentageOfFullColorRange( offset: number ): string {
        const fullRange = this.colorOptions.ceil - this.colorOptions.floor;
        return offset / fullRange * 100 + '%';
    }

    getTickStep(): number {
        const numberOfContours = this.controlPanel.value.numberOfContours;
        const step = ( this.contourRange[1] - this.contourRange[0] ) / ( numberOfContours  - 1 );
        return step;
    }

    resetZoom() {
        this.pvView.get().viewStream.resetCamera();
    }

    saveUserSettings(): void {
        sessionStorage.setItem('controlPanel', JSON.stringify( this.controlPanel.value ));
        sessionStorage.setItem('opacities', JSON.stringify( this.userOpacities ));
        sessionStorage.setItem('colormaps', JSON.stringify( this.userColormaps ));
        sessionStorage.setItem('colorRanges', JSON.stringify( this.userColorRanges ));
        sessionStorage.setItem('contourRanges', JSON.stringify( this.userContourRanges ));
        sessionStorage.setItem('thresholdRanges', JSON.stringify( this.userThresholdRanges ));
        sessionStorage.setItem('lonSliceAngle', JSON.stringify( this.lonSliceAngle ));
    }

    setFormSubscriptions() {
        // subscribe to any form change
        this.subscriptions.push( this.controlPanel.valueChanges
            .pipe( debounceTime( 300 ) ).subscribe( newFormValues => {
                this.updateVisibilityControls( newFormValues );
                // this will render every time any named control in the form is updated
                // the threshold range, color range, and contour range are tracked outside of the form and are updated and rendered manually
                this.renderDebouncer.next();
            }));
        // subscribe to COLOR VARIABLE changes, color variable is tied to colormap (form subscription via setValue for server),
        // opacity (form subscription via setValue for server), and color range (update via updateColorRange())
        this.subscriptions.push( this.controlPanel.controls.colorVariable.valueChanges
            .pipe( debounceTime( 300 ) ).subscribe( newColorVariable => {
                this.colorVariableServerName = newColorVariable.serverName;
                this.session.call('pv.enlil.colorby', [ this.colorVariableServerName ]);
                this.controlPanel.controls.colormap.setValue( this.userColormaps[ this.colorVariableServerName ] );
                this.controlPanel.controls.opacity.setValue( this.userOpacities[ this.colorVariableServerName ] );
                const variableColorRange = this.userColorRanges[ this.colorVariableServerName ];
                this.colorOptions = {
                    floor: newColorVariable.entireRange[0],
                    ceil: newColorVariable.entireRange[1],
                    combineLabels: (min, max) => min + ' to ' + max,
                    step: newColorVariable.step,
                    animate: false
                };
                this.updateColorRange( { value: variableColorRange[0], highValue: variableColorRange[1], pointerType: undefined });
            }));
        // subscribe to COLORMAP changes, set userColormap, and reset PV colormap
        this.subscriptions.push( this.controlPanel.controls.colormap.valueChanges
            .pipe( debounceTime( 300 ) ).subscribe( newColormapObject => {
                this.userColormaps[ this.colorVariableServerName ] = clone(newColormapObject);
                this.session.call('pv.enlil.set_colormap', [ this.colorVariableServerName, newColormapObject.serverName ]);
            }));
        // subscribe to CONTOUR NUMBER changes and call update contour function if more than 1 contour
        this.subscriptions.push( this.controlPanel.controls.numberOfContours.valueChanges
            .pipe( debounceTime(300) ).subscribe( ( value: number ) => {
                // TODO: better validation and include possibility of 0 and 1
                if ( value > 1 ) {
                    this.updateContourRange( { value: this.contourRange[0], highValue: this.contourRange[1], pointerType: undefined });
                }
            }));
        // subscribe to CONTOUR VARIABLE changes and call update contour function with new contour variable values
        this.subscriptions.push( this.controlPanel.controls.contourVariable.valueChanges
            .pipe( debounceTime( 300 ) ).subscribe( newContourVariable => {
                const contourVariableServerName = newContourVariable.serverName;
                const newContourRange = this.userContourRanges[ contourVariableServerName ];
                this.updateContourRange( { value: newContourRange[0], highValue: newContourRange[1], pointerType: undefined });
            }));
        // subscribe to OPACITY slider set user opacity per color variable and 'set_opacity'
        this.subscriptions.push( this.controlPanel.controls.opacity.valueChanges
            .pipe( debounceTime( 300 ) ).subscribe( () => {
                const newOpacityRange: [ number, number ] = this.controlPanel.value.opacity;
                this.userOpacities[this.colorVariableServerName] = clone(newOpacityRange);
                const opacityLow: number = newOpacityRange[0] / 100;
                const opacityHigh: number = newOpacityRange[1] / 100;
                if ( this.colorVariableServerName[ 0 ] === 'b' ) {
                    this.session.call( 'pv.enlil.set_opacity', [ this.colorVariableServerName, [ opacityHigh, opacityLow, opacityHigh ] ] );
                } else {
                    this.session.call( 'pv.enlil.set_opacity', [ this.colorVariableServerName, [ opacityLow, opacityHigh ] ] );
                }
            }));
        // subscribe to THRESHOLD VARIABLE changes and reset threshold slider options, threshold range, and 'set_threshold'
        this.subscriptions.push( this.controlPanel.controls.thresholdVariable.valueChanges
            .pipe( debounceTime( 300 ) ).subscribe( newThresholdVariable => {
                const thresholdVariableServerName = newThresholdVariable.serverName;
                this.thresholdOptions = {
                    floor: newThresholdVariable.entireRange[0],
                    ceil: newThresholdVariable.entireRange[1],
                    combineLabels: (min, max) => min + ' to ' + max,
                    step: newThresholdVariable.step,
                    animate: false
                };
                const newThresholdRange = this.userThresholdRanges[ thresholdVariableServerName ];
                this.updateThresholdRange( { value: newThresholdRange[0], highValue: newThresholdRange[1], pointerType: undefined });
            }));
    }

    snapTo( view: string ) {
        this.session.call( 'pv.enlil.snap_to_view', [ view ] );
        this.renderDebouncer.next();
    }

    scaleColorRange() {
        this.session.call( 'pv.enlil.get_variable_range', [ this.colorVariableServerName ]).then( range => {
            this.updateColorRange( { value: range[0], highValue: range[1], pointerType: undefined });
        });
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

    updateColorRange( event: ChangeContext ) {
        // add padding to offset the sides of the colorbar the selected amount
        const leftOffset = event.value - this.colorOptions.floor;
        const rightOffset = this.colorOptions.ceil - event.highValue;
        this.colorbarLeftOffset = this.getPercentageOfFullColorRange( leftOffset );
        this.colorbarRightOffset = this.getPercentageOfFullColorRange( rightOffset );
        this.colorRange = [ event.value, event.highValue ];
        this.userColorRanges[ this.colorVariableServerName ] = clone(this.colorRange);
        this.session.call('pv.enlil.set_range', [ this.colorVariableServerName, this.colorRange ] );
        this.renderDebouncer.next();
    }

    updateContourRange( event: ChangeContext ) {
        const contourVariable: IVariableInfo = this.controlPanel.value.contourVariable;
        const newRange: [ number, number ] = [ event.value, event.highValue ];
        const numberOfContours = this.controlPanel.value.numberOfContours;
        this.userContourRanges[ contourVariable.serverName ] = clone( newRange );
        this.contourRange = clone( newRange );
        const indexArray = [ ...Array(numberOfContours).keys() ];
        const step = numberOfContours > 2 ? this.getTickStep() : undefined;
        this.contourArray = numberOfContours > 2 ?
            indexArray.map( indexValue => Math.round(this.contourRange[0] + (indexValue * step)) ) :
            clone(newRange);
        const trimmedArray: number[] = this.contourArray.slice(1, -1);

        const newOptions: Options = {
            floor: contourVariable.entireRange[0],
            ceil: contourVariable.entireRange[1],
            combineLabels: (min, max) => min + ' to ' + max,
            step: contourVariable.step,
            animate: false,
            showTicksValues: !!step,
            tickStep: step ?? null,
            ticksArray: step ? trimmedArray : null
        };
        this.contourOptions = newOptions;

        this.session.call('pv.enlil.set_contours', [ contourVariable.serverName, this.contourArray ]);
        this.renderDebouncer.next();
    }

    updateLonSliceAngle( event: any ) {
        const value = event.target.value;
        // get the valid range for the angle
        const validRange: number[] = this.lonSliceOptions.validRange;
        // limit to valid range
        const validInputValue: number = value < 0 ? Math.max( validRange[0], value) : Math.min( validRange[1], value);
        // format value
        const formattedValidValue: string = parseFloat( validInputValue.toString() ).toFixed(1);
        this.lonSliceAngle = formattedValidValue;
        this.session.call('pv.enlil.rotate_plane', [ 'lon', Number( this.lonSliceAngle ) ] );
        this.renderDebouncer.next();
    }

    updateThresholdRange( event: ChangeContext ) {
        const thresholdVariableServerName: string = this.controlPanel.value.thresholdVariable.serverName;
        const newRange: [ number, number ] = [ event.value, event.highValue ];
        this.thresholdRange = clone(newRange);
        this.userThresholdRanges[ thresholdVariableServerName ] = clone(newRange);
        this.session.call('pv.enlil.set_threshold', [ thresholdVariableServerName, this.thresholdRange ] );
        this.renderDebouncer.next();
    }

    updateVisibilityControls(controlStates: { [parameter: string]: any }) {
        Object.keys( controlStates ).forEach( controlName => {
            if ( controlName === 'satellites' ) {
                const state = controlStates[ controlName ] === true ? 'on' : 'off';
                this.session.call( 'pv.enlil.toggle_satellites', [ state ] );
            } else if (typeof controlStates[ controlName ] === 'boolean') {
                const name = snakeCase( controlName );
                const state = controlStates[ controlName ] === true ? 'on' : 'off';
                this.session.call( 'pv.enlil.visibility', [ name, state ] );
            }
        });
    }
}
