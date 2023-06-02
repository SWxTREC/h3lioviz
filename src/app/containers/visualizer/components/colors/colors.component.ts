import { Component, Input, OnChanges, OnDestroy } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ChangeContext, Options } from '@angular-slider/ngx-slider';
import { cloneDeep } from 'lodash';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

import {
    COLOR_FORM_DEFAULT_VALUES,
    COLORMAPS,
    ConfigLabels,
    ISiteConfig,
    IVariableInfo,
    VARIABLE_CONFIG
} from 'src/app/models';
import { SiteConfigService } from 'src/app/services';

@Component({
    selector: 'swt-colors',
    templateUrl: './colors.component.html',
    styleUrls: [  '../form.scss', './colors.component.scss' ]
})
export class ColorsComponent implements OnChanges, OnDestroy {
    @Input() pvView: any;

    defaultColorVariable: IVariableInfo = COLOR_FORM_DEFAULT_VALUES.colorVariable;
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
    siteConfig: ISiteConfig;
    subscriptions: Subscription[] = [];
    userColormaps: { [parameter: string]: { displayName: string; serverName: string } } = {};
    userColorRanges: { [parameter: string]: [ number, number ] } = {};
    userOpacities: { [parameter: string]: [ number, number ] } = {};
    variableConfigurations = VARIABLE_CONFIG;

    constructor(
        private _siteCofigService: SiteConfigService
    ) {
        this._siteCofigService.config$.subscribe( () => this.siteConfig = this._siteCofigService.getSiteConfig() );
        // initialize FormGroup with default color menu names and values
        Object.keys(COLOR_FORM_DEFAULT_VALUES).forEach( controlName => {
            this.colorForm.addControl(controlName, new FormControl( COLOR_FORM_DEFAULT_VALUES[controlName]));
        });
        // create user objects from site config
        this.userColormaps = this.siteConfig[ ConfigLabels.colormaps ];
        this.userColorRanges = this.siteConfig[ ConfigLabels.colorRanges ];
        this.userOpacities = this.siteConfig[ ConfigLabels.opacities ];

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
            // once form is interacting with session via subscriptions, initialize the form from siteConfig
            this.colorForm.setValue( this.siteConfig[ ConfigLabels.colorSettings ] );
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
        // update all color settings in site config
        this._siteCofigService.updateSiteConfig( { [ ConfigLabels.colorSettings ]: this.colorForm.value } );
        this._siteCofigService.updateSiteConfig( { [ ConfigLabels.opacities ]: this.userOpacities } );
        this._siteCofigService.updateSiteConfig( { [ ConfigLabels.colormaps ]: this.userColormaps } );
        this._siteCofigService.updateSiteConfig( { [ ConfigLabels.colorRanges ]: this.userColorRanges } );
    }

    setFormSubscriptions() {
        // subscribe to any form change
        this.subscriptions.push( this.colorForm.valueChanges
            .pipe( debounceTime( 300 ) ).subscribe( newFormValues => {
                // this will render every time any named control in the form is updated
                // the color range is tracked outside of the form in updateColorRange
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
                this.userColormaps[ this.colorVariableServerName ] = cloneDeep(newColormapObject);
                this.session.call('pv.h3lioviz.set_colormap', [ this.colorVariableServerName, newColormapObject.serverName ]);
            }));
        // subscribe to OPACITY slider set user opacity per color variable and 'set_opacity'
        this.subscriptions.push( this.colorForm.controls.opacity.valueChanges
            .pipe( debounceTime( 300 ) ).subscribe( ( opacity ) => {
                const newOpacityRange: [ number, number ] = opacity;
                this.userOpacities[this.colorVariableServerName] = cloneDeep(newOpacityRange);
                const opacityLow: number = newOpacityRange[0] / 100;
                const opacityHigh: number = newOpacityRange[1] / 100;
                if ( this.colorVariableServerName[ 0 ] === 'b' ) {
                    this.session.call('pv.h3lioviz.set_opacity', [ this.colorVariableServerName,
                        [ opacityHigh, opacityLow, opacityHigh ] ]);
                } else {
                    this.session.call( 'pv.h3lioviz.set_opacity', [ this.colorVariableServerName, [ opacityLow, opacityHigh ] ] );
                }
            })
        );
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
        this.userColorRanges[ this.colorVariableServerName ] = cloneDeep(this.colorRange);
        this.pvView.get().session.call('pv.h3lioviz.set_range', [ this.colorVariableServerName, this.colorRange ] );
        this.renderDebouncer.next();
    }
}
