import { ChangeContext, Options } from '@angular-slider/ngx-slider';
import { Component, Input, OnChanges, OnDestroy } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatSliderChange } from '@angular/material/slider';
import { clone, snakeCase } from 'lodash';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import {
    COLORMAPS,
    CONTROL_PANEL_DEFAULT_VALUES,
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
    contourOptions = {
        validRange: [ this.defaultContourVariable.entireRange[0], this.defaultContourVariable.entireRange[1] ],
        stepSize: this.defaultContourVariable.step
    }
    contourSelections: number;
    lonSliceAngleCss: string;
    lonSliceOptions = {
        validRange: [ -10, 10 ],
        stepSize: 0.5
    }
    opacityOptions: Options = {
        floor: 0,
        ceil: 100,
        combineLabels: (min, max) => min + ' to ' + max,
        step: 10,
        animate: false
    };
    renderDebouncer: Subject<string> = new Subject<string>();
    session: { call: (arg0: string, arg1: any[]) => Promise<any> };
    showAngleAdjust = false;
    showContourSettings = false;
    subscriptions: Subscription[] = [];
    thresholdOptions: Options = {
        floor: this.defaultThresholdVariable.entireRange[0],
        ceil: this.defaultThresholdVariable.entireRange[1],
        combineLabels: (min, max) => min + ' to ' + max,
        step: this.defaultThresholdVariable.step,
        animate: false
    };
    thresholdRange: [number, number] = ( this.defaultThresholdVariable.defaultThresholdRange );
    userColormaps: { [parameter: string]: { displayName: string; serverName: string } } = {};
    userColorRanges: { [parameter: string]: [ number, number ] } = {};
    userContourSelections: { [parameter: string]: number } = {};
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
        if ( sessionStorage.getItem('countours')) {
            this.userContourSelections = JSON.parse(sessionStorage.getItem('contours'));
        } else {
            Object.keys(VARIABLE_CONFIG).forEach( (variable) => {
                this.userContourSelections[variable] = 0;
            });
        }
        // lonSliceAngle
        if ( sessionStorage.getItem('lonSliceAngle')) {
            this.lonSliceAngleCss = JSON.parse(sessionStorage.getItem('lonSliceAngle'));
        } else {
            this.lonSliceAngleCss = parseFloat('0').toFixed(1);
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
                this.userThresholdRanges[variable] = VARIABLE_CONFIG[variable].defaultThresholdRange;
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
            this.session.call('pv.enlil.rotate_plane', [ 'lon', Number( -this.lonSliceAngleCss ) ] );
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

    resetZoom() {
        this.pvView.get().viewStream.resetCamera();
    }

    saveUserSettings(): void {
        sessionStorage.setItem('controlPanel', JSON.stringify( this.controlPanel.value ));
        sessionStorage.setItem('opacities', JSON.stringify( this.userOpacities ));
        sessionStorage.setItem('colormaps', JSON.stringify( this.userColormaps ));
        sessionStorage.setItem('colorRanges', JSON.stringify( this.userColorRanges ));
        sessionStorage.setItem('thresholdRanges', JSON.stringify( this.userThresholdRanges ));
        sessionStorage.setItem('lonSliceAngle', JSON.stringify( this.lonSliceAngleCss ));
    }

    setFormSubscriptions() {
        // subscribe to any form change
        this.subscriptions.push( this.controlPanel.valueChanges
            .pipe( debounceTime( 300 ) ).subscribe( newFormValues => {
                this.updateVisibilityControls( newFormValues );
                // this will render every time any named control in the form is updated
                // the threshold range and color range are tracked outside of the form and are updated and rendered manually
                this.renderDebouncer.next();
            }));
        // subscribe to color variable changes, color variable is tied to colormap (form subscription via setValue for server),
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
        // subscribe to color map changes, set userColormap, and reset PV colormap
        this.subscriptions.push( this.controlPanel.controls.colormap.valueChanges
            .pipe( debounceTime( 300 ) ).subscribe( newColormapObject => {
                this.userColormaps[ this.colorVariableServerName ] = clone(newColormapObject);
                this.session.call('pv.enlil.set_colormap', [ this.colorVariableServerName, newColormapObject.serverName ]);
            }));
        // subscribe to threshold variable changes and reset threshold slider options, threshold range, and 'set_threshold'
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
        // subscribe to contour variable changes and reset contour slider options, contour selections, and 'set_contours'
        this.subscriptions.push( this.controlPanel.controls.contourVariable.valueChanges
            .pipe( debounceTime( 300 ) ).subscribe( newContourVariable => {
                const contourVariableServerName = newContourVariable.serverName;
                this.contourOptions = {
                    validRange: [ newContourVariable.entireRange[0], newContourVariable.entireRange[1] ],
                    stepSize: this.defaultContourVariable.step
                };
                const newContourSelections = this.userContourSelections[ contourVariableServerName ];
                this.updateContours( { source: undefined, value: newContourSelections });
            }));
        // subscribe to opacity slider set user opacity per color variable and 'set_opacity'
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

    updateVisibilityControls(controlStates: { [parameter: string]: any }) {
        Object.keys( controlStates ).forEach( controlName => {
            if (typeof controlStates[ controlName ] === 'boolean') {
                const name = snakeCase( controlName );
                const state = controlStates[ controlName ] === true ? 'on' : 'off';
                this.session.call( 'pv.enlil.visibility', [ name, state ] );
            }
        });
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

    updateContours( event: MatSliderChange ) {
        const contourVariableServerName = this.controlPanel.value.contourVariable.serverName;
        this.contourSelections = event.value;
        console.log( contourVariableServerName, this.contourSelections )
        this.session.call('pv.enlil.set_contours', [ contourVariableServerName, [ this.contourSelections ] ] );
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

    updateLonSliceAngle( event: any ) {
        const value = event.target.value;
        // get the valid range for the angle
        const validRange: number[] = this.lonSliceOptions.validRange;
        // limit to valid range
        const validInputValue: number = value < 0 ? Math.max( validRange[0], value) : Math.min( validRange[1], value);
        // format value
        const formattedValidValue: string = parseFloat( validInputValue.toString() ).toFixed(1);
        this.lonSliceAngleCss = formattedValidValue;
        // the angle from sun to earth for the paraview server is opposite the css angle
        this.session.call('pv.enlil.rotate_plane', [ 'lon', Number( -this.lonSliceAngleCss ) ] );
        this.renderDebouncer.next();
    }
}
