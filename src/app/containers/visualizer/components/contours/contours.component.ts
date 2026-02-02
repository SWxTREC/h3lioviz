import { Component, Input, OnChanges } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ChangeContext, Options } from '@angular-slider/ngx-slider';
import { snakeCase } from 'lodash';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import {
    ADDITIONAL_VARIABLES,
    ConfigLabels,
    CONTOUR_FORM_DEFAULT_VALUES,
    FOCUS_VARIABLES,
    ISiteConfig,
    IVariableInfo,
    VARIABLE_CONFIG
} from 'src/app/models';
import { SiteConfigService } from 'src/app/services';

@Component({
    selector: 'swt-contours',
    templateUrl: './contours.component.html',
    styleUrls: [ '../form.scss', './contours.component.scss' ],
    standalone: false
})
export class ContoursComponent implements OnChanges {
    @Input() pvView: any;
    defaultContourVariable: IVariableInfo = CONTOUR_FORM_DEFAULT_VALUES.contourVariable;

    additionalVariables = ADDITIONAL_VARIABLES;
    additionalVariableSelected: boolean;
    contours: FormGroup = new FormGroup({});
    contourValue: number = this.defaultContourVariable.defaultContourValue;
    contourOptions: Options = {
        floor: this.defaultContourVariable.entireRange[0],
        ceil: this.defaultContourVariable.entireRange[1],
        combineLabels: (min, max) => min + ' to ' + max,
        hideLimitLabels: false,
        step: this.defaultContourVariable.step,
        animate: false
    };
    focusVariables = FOCUS_VARIABLES;
    renderDebouncer = new Subject<void>();
    session: { call: (arg0: string, arg1: any[]) => Promise<any>; subscribe: any };
    showAll = false;
    siteConfig: ISiteConfig;
    subscriptions: Subscription[] = [];
    userContourRanges: { [parameter: string]: [ number, number ] } = {};
    variableConfigurations = VARIABLE_CONFIG;

    constructor(
        private _siteConfigService: SiteConfigService
    ) {
        this.subscriptions.push(
            this._siteConfigService.config$.subscribe( () => {
                // setting this.siteConfig this way applies default values
                this.siteConfig = this._siteConfigService.getSiteConfig();
            })
        );
        // initialize FormGroup with default contour menu names and values
        Object.keys(CONTOUR_FORM_DEFAULT_VALUES).forEach( controlName => {
            this.contours.addControl(controlName, new FormControl());
        });
        // debounce render
        this.subscriptions.push(
            this.renderDebouncer.pipe(
                debounceTime( 300 )
            ).subscribe(() => {
                this.pvView.render();
                this.saveUserSettings();
            })
        );
    }

    ngOnChanges(): void {
        // get session once, when pvView is defined
        if ( this.pvView && !this.session ) {
            this.session = this.pvView.get().session;
            // once we have a session, set form subscriptions
            this.setFormSubscriptions();
            // once form is interacting with session via subscriptions, initialize the form from siteConfig
            this.userContourRanges = this.siteConfig[ ConfigLabels.contourRanges ];
            const initialContourVariable = this.siteConfig[ ConfigLabels.contourSettings ].contourVariable.serverName;
            this.contourValue = this.userContourRanges[ initialContourVariable ][0];
            this.contours.setValue( this.siteConfig[ ConfigLabels.contourSettings ] );
        }
    }

    // This mat-select compareWith function is used to verify the proper label for the selection in the dropdown
    compareObjectNames(o1: any, o2: any): boolean {
        return o1.displayName === o2.displayName;
    }

    contourValueChange( event: ChangeContext ) {
        this.updateContourValue( event.value );
    }

    saveUserSettings(): void {
        this._siteConfigService.updateSiteConfig( {
            [ ConfigLabels.contourSettings ]: this.contours.value,
            [ ConfigLabels.contourRanges ]: this.userContourRanges
        });
    }

    setFormSubscriptions() {
        // subscribe to any form change
        this.subscriptions.push( this.contours.valueChanges
            .pipe( debounceTime( 300 ) )
            .subscribe( newFormValues => {
                // this will render every time any named control in the form is updated
                // the contour range is tracked outside of the form and is updated and rendered in contourRangeChange()
                this.updateVisibilityControls( newFormValues );
            })
        );
        // subscribe to CONTOUR VARIABLE changes and call update contour function with new contour variable values
        this.subscriptions.push( this.contours.controls.contourVariable.valueChanges
            .pipe( debounceTime( 300 ) ).subscribe( newContourVariable => {
                const contourVariableServerName = newContourVariable.serverName;
                const newContourValue = this.userContourRanges[ contourVariableServerName ][0];
                this.additionalVariableSelected =
                    !!this.additionalVariables.find(
                        variable => variable.serverName === this.contours.controls.contourVariable.value.serverName
                    );
                this.showAll = this.additionalVariableSelected;
                this.updateContourValue( newContourValue );
            })
        );
    }

    updateContourValue( newValue: number ) {
        const contourVariable: IVariableInfo = this.contours.value.contourVariable;
        this.userContourRanges[ contourVariable.serverName ] = [ newValue, newValue ];
        this.contourValue = newValue;
        const newOptions = {
            floor: contourVariable.entireRange[0],
            ceil: contourVariable.entireRange[1],
            hideLimitLabels: false,
            step: contourVariable.step,
            animate: false
        };
        this.contourOptions = newOptions;
        this.session.call( 'pv.h3lioviz.visibility', [ 'cme_contours', 'off' ] );
        this.session.call( 'pv.h3lioviz.visibility', [ 'threshold', 'on' ] );
        this.session.call('pv.h3lioviz.set_threshold', [ contourVariable.serverName, this.contourValue ] );

        this.renderDebouncer.next();
    }

    updateVisibilityControls(controlStates: { [parameter: string]: any }) {
        Object.keys( controlStates ).forEach( controlName => {
            if (typeof controlStates[ controlName ] === 'boolean') {
                const name = snakeCase( controlName );
                const state = controlStates[ controlName ] === true ? 'on' : 'off';
                this.session.call( 'pv.h3lioviz.visibility', [ name, state ] );
                this.renderDebouncer.next();
            }
        });
    }

}
