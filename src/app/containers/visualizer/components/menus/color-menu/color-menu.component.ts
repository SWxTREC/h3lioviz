import { ChangeContext, Options } from '@angular-slider/ngx-slider';
import { Component, Input, OnChanges, OnDestroy } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { clone } from 'lodash';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

import {
    COLOR_MENU_DEFAULT_VALUES,
    COLORMAPS,
    CONTROL_PANEL_DEFAULT_VALUES,
    IVariableInfo,
    VARIABLE_CONFIG
} from 'src/app/models';

@Component({
    selector: 'swt-color-menu',
    templateUrl: './color-menu.component.html',
    styleUrls: [ '../menu.scss', './color-menu.component.scss' ]
})
export class ColorMenuComponent implements OnChanges, OnDestroy {
    @Input() pvView: any;

    defaultColorVariable: IVariableInfo = CONTROL_PANEL_DEFAULT_VALUES.colorVariable;
    colorbarLeftOffset = '0';
    colorbarRightOffset = '0';
    colorForm: FormGroup = new FormGroup({});
    colorOptions: Options = {
        floor: this.defaultColorVariable.entireRange[0],
        ceil: this.defaultColorVariable.entireRange[1],
        combineLabels: (min, max) => min + ' to ' + max,
        step: this.defaultColorVariable.step,
        animate: false
    };
    colormaps = COLORMAPS;
    colorRange: [ number, number ] = ( this.defaultColorVariable.defaultColorRange );
    colorVariableServerName: string = this.defaultColorVariable.serverName;
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
    subscriptions: Subscription[] = [];
    userColormaps: { [parameter: string]: { displayName: string; serverName: string } } = {};
    userColorRanges: { [parameter: string]: [ number, number ] } = {};
    userOpacities: { [parameter: string]: [ number, number ] } = {};
    variableConfigurations = VARIABLE_CONFIG;

    constructor() {
        // initialize FormGroup with default color menu names and values
        Object.keys(COLOR_MENU_DEFAULT_VALUES).forEach( controlName => {
            this.colorForm.addControl(controlName, new FormControl( COLOR_MENU_DEFAULT_VALUES[controlName]));
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
        // opacities
        if ( sessionStorage.getItem('opacities')) {
            this.userOpacities = JSON.parse(sessionStorage.getItem('opacities'));
        } else {
            Object.keys(VARIABLE_CONFIG).forEach( (variable) => {
                this.userOpacities[variable] = CONTROL_PANEL_DEFAULT_VALUES.opacity;
            });
        }
      
        this.subscriptions.push(
            this.renderDebouncer.pipe(
                debounceTime( 300 )
            ).subscribe(() => {
                this.saveUserSettings();
                this.pvView.render();
            })
        );
    }

    ngOnChanges() {
        // get session once, when pvView is defined
        if ( this.pvView && !this.session ) {
            this.session = this.pvView.get().session;
            // once we have a session, set form subscriptions
            this.setFormSubscriptions();
            // once form is interacting with session via subscriptions, initialize the form from sessionStorage or defaults
            const initialFormValues = clone(JSON.parse(sessionStorage.getItem('controlPanel'))) || clone(COLOR_MENU_DEFAULT_VALUES);
            this.colorForm.setValue( initialFormValues );
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

    saveUserSettings(): void {
        sessionStorage.setItem('colorForm', JSON.stringify( this.colorForm.value ));
        sessionStorage.setItem('opacities', JSON.stringify( this.userOpacities ));
        sessionStorage.setItem('colormaps', JSON.stringify( this.userColormaps ));
        sessionStorage.setItem('colorRanges', JSON.stringify( this.userColorRanges ));
    }

    setFormSubscriptions() {
        // subscribe to any form change
        this.subscriptions.push( this.colorForm.valueChanges
            .pipe( debounceTime( 300 ) ).subscribe( newFormValues => {
                // this.updateVisibilityControls( newFormValues );
                // this will render every time any named control in the form is updated
                // the threshold range, color range, and contour range are tracked outside of the form and are updated and rendered manually
                this.renderDebouncer.next();
            }));
        // subscribe to COLOR VARIABLE changes, color variable is tied to colormap (form subscription via setValue for server),
        // opacity (form subscription via setValue for server), and color range (update via updateColorRange())
        this.subscriptions.push( this.colorForm.controls.colorVariable.valueChanges
            .pipe( debounceTime( 300 ) ).subscribe( newColorVariable => {
                this.colorVariableServerName = newColorVariable.serverName;
                this.session.call('pv.h3lioviz.colorby', [ this.colorVariableServerName ]);
                this.colorForm.controls.colormap.setValue( this.userColormaps[ this.colorVariableServerName ] );
                this.colorForm.controls.opacity.setValue( this.userOpacities[ this.colorVariableServerName ] );
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
        this.subscriptions.push( this.colorForm.controls.colormap.valueChanges
            .pipe( debounceTime( 300 ) ).subscribe( newColormapObject => {
                this.userColormaps[ this.colorVariableServerName ] = clone(newColormapObject);
                this.session.call('pv.h3lioviz.set_colormap', [ this.colorVariableServerName, newColormapObject.serverName ]);
            }));
        // subscribe to OPACITY slider set user opacity per color variable and 'set_opacity'
        this.subscriptions.push( this.colorForm.controls.opacity.valueChanges
            .pipe( debounceTime( 300 ) ).subscribe( () => {
                const newOpacityRange: [ number, number ] = this.colorForm.value.opacity;
                this.userOpacities[this.colorVariableServerName] = clone(newOpacityRange);
                const opacityLow: number = newOpacityRange[0] / 100;
                const opacityHigh: number = newOpacityRange[1] / 100;
                if ( this.colorVariableServerName[ 0 ] === 'b' ) {
                    this.session.call('pv.h3lioviz.set_opacity', [ this.colorVariableServerName,
                        [ opacityHigh, opacityLow, opacityHigh ] ]);
                } else {
                    this.session.call( 'pv.h3lioviz.set_opacity', [ this.colorVariableServerName, [ opacityLow, opacityHigh ] ] );
                }
            }));
    }

    scaleColorRange() {
        this.pvView.get().session.call( 'pv.h3lioviz.get_variable_range', [ this.colorVariableServerName ]).then( range => {
            this.updateColorRange( { value: range[0], highValue: range[1], pointerType: undefined });
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
        this.pvView.get().session.call('pv.h3lioviz.set_range', [ this.colorVariableServerName, this.colorRange ] );
        this.renderDebouncer.next();
    }

}
