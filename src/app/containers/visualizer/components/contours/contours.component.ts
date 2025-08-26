import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ChangeContext, Options } from '@angular-slider/ngx-slider';
import { clone, snakeCase } from 'lodash';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import {
    ADDITIONAL_VARIABLES,
    ConfigLabels,
    CONTOUR_FORM_DEFAULT_VALUES,
    FOCUS_VARIABLES,
    INITIAL_TICK_STEP,
    ISiteConfig,
    IVariableInfo,
    VARIABLE_CONFIG
} from 'src/app/models';
import { SiteConfigService } from 'src/app/services';

@Component({
    selector: 'swt-contours',
    templateUrl: './contours.component.html',
    styleUrls: [ '../form.scss', './contours.component.scss' ]
})
export class ContoursComponent implements OnInit, OnChanges {
    @Input() pvView: any;
    defaultContourVariable: IVariableInfo = CONTOUR_FORM_DEFAULT_VALUES.contourVariable;

    additionalVariables = ADDITIONAL_VARIABLES;
    additionalVariableSelected: boolean;
    // contourArray keeps track of the array of contour values sent to the server
    // the numbers are calculated from the contour range and the number of contours
    contourArray: number[] = [];
    contours: FormGroup = new FormGroup({});
    // contourRange keeps track of the user settings on the contour range slider
    contourRange: [number, number] = ( this.defaultContourVariable.defaultSubsetRange );
    contourOptions: Options = {
        floor: this.defaultContourVariable.entireRange[0],
        ceil: this.defaultContourVariable.entireRange[1],
        combineLabels: (min, max) => min + ' to ' + max,
        step: this.defaultContourVariable.step,
        animate: false,
        showTicksValues: false,
        tickStep: INITIAL_TICK_STEP,
        ticksArray: [ this.defaultContourVariable.defaultSubsetRange[0] + INITIAL_TICK_STEP ]
    };
    focusVariables = FOCUS_VARIABLES;
    renderDebouncer = new Subject<void>();
    session: { call: (arg0: string, arg1: any[]) => Promise<any>; subscribe: any };
    showAll = false;
    siteConfig: ISiteConfig;
    subscriptions: Subscription[] = [];
    userContourRanges: { [parameter: string]: [ number, number ] } = {};
    variableConfigurations = VARIABLE_CONFIG;
    contourVariableRangeFromServer: any;

    constructor(
        private _siteConfigService: SiteConfigService
    ) {
        this.subscriptions.push(
            this._siteConfigService.config$.subscribe( () => {
                // setting this.siteConfig this way applies default values
                this.siteConfig = this._siteConfigService.getSiteConfig();
                const thresholdVisibility = this.siteConfig[ ConfigLabels.contourSettings ].threshold ||
                    this.siteConfig[ ConfigLabels.contourSettings ].cmeContours || CONTOUR_FORM_DEFAULT_VALUES.threshold;
                this.siteConfig[ ConfigLabels.contourSettings ].threshold = thresholdVisibility;
                // when cme isosurface is selected: disable contours
                if ( this.siteConfig[ ConfigLabels.layers ].cme === true ) {
                    this.contours.disable({ emitEvent: false });
                } else {
                    this.contours.enable({ emitEvent: false });
                }
            })
        );
        // initialize FormGroup with default contour menu names and values
        Object.keys(CONTOUR_FORM_DEFAULT_VALUES).forEach( controlName => {
            this.contours.addControl(controlName, new FormControl(
                this.siteConfig[ ConfigLabels.contourSettings ][ controlName ]
            ));
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
            this.contourRange = this.userContourRanges[ initialContourVariable ];
            this.contours.setValue( this.siteConfig[ ConfigLabels.contourSettings ] );
        }
    }

    ngOnInit(): void {
    }

    // This mat-select compareWith function is used to verify the proper label for the selection in the dropdown
    compareObjectNames(o1: any, o2: any): boolean {
        return o1.displayName === o2.displayName;
    }

    contourRangeChange( event: ChangeContext ) {
        this.updateContourRange( [ event.value, event.highValue ] );
    }

    getContourArray( contourRange: [number, number], numberOfContours: number ): number[] {
        const interval = this.getTickInterval();
        const indexArray = [ ...Array(numberOfContours).keys() ]; // [0, 1, 2, …]
        const contourArray =
            indexArray.map( indexValue => +(this.contourRange[0] + (indexValue * interval)).toFixed(3) );
        return contourArray;
    }

    getTickInterval(): number {
        const numberOfContours = this.contours.value.numberOfContours;
        const interval = ( this.contourRange[1] - this.contourRange[0] ) / ( numberOfContours  - 1 );
        return interval;
    }

    saveUserSettings(): void {
        this._siteConfigService.updateSiteConfig( {
            [ ConfigLabels.contourSettings ]: this.contours.value,
            [ ConfigLabels.contourRanges ]: this.userContourRanges
        });
    }

    setFormSubscriptions() {
        // to get the variable range from the server, subscribe to viewport render
        this.subscriptions.push(this.session.subscribe('viewport.image.push.subscription', ( newPvImage: { stale: any }[] ) => {
            const notStale = !newPvImage[0].stale;
            if ( notStale ) {
                this.pvView.get().session.call(
                    'pv.h3lioviz.get_variable_range', [ this.contours.controls.contourVariable.value.serverName ]
                ).then( (range: [number, number]) => {
                    this.contourVariableRangeFromServer = range;
                });
            }
        }));

        // subscribe to any form change
        this.subscriptions.push( this.contours.valueChanges
            .pipe( debounceTime( 300 ) )
            .subscribe( newFormValues => {
                // reset contour variable range from server
                this.contourVariableRangeFromServer = undefined;
                // this will render every time any named control in the form is updated
                // the contour range is tracked outside of the form and is updated and rendered in contourRangeChange()
                this.updateVisibilityControls( newFormValues );
            })
        );
        // subscribe to CONTOUR NUMBER changes and call update contour function if more than 1 contour
        this.subscriptions.push( this.contours.controls.numberOfContours.valueChanges
            .pipe( debounceTime(300) ).subscribe( ( value: number ) => {
                // TODO: better validation and include possibility of 0 and 1
                if ( value > 1 ) {
                    this.updateContourRange( this.contourRange );
                }
            })
        );
        // subscribe to CONTOUR VARIABLE changes and call update contour function with new contour variable values
        this.subscriptions.push( this.contours.controls.contourVariable.valueChanges
            .pipe( debounceTime( 300 ) ).subscribe( newContourVariable => {
                const contourVariableServerName = newContourVariable.serverName;
                const newContourRange = clone(this.userContourRanges[ contourVariableServerName ]);
                this.additionalVariableSelected =
                    !!this.additionalVariables.find(
                        variable => variable.serverName === this.contours.controls.contourVariable.value.serverName
                    );
                this.showAll = this.additionalVariableSelected;
                this.updateContourRange( newContourRange );
            })
        );
    }

    scaleContourRange() {
        this.updateContourRange( this.contourVariableRangeFromServer);
    }

    updateContourRange( newRange: [number, number] ) {
        const contourVariable: IVariableInfo = this.contours.value.contourVariable;
        const numberOfContours = this.contours.value.numberOfContours;
        this.userContourRanges[ contourVariable.serverName ] = clone( newRange );

        this.contourRange = clone( newRange );
        const tickInterval = numberOfContours > 2 ? this.getTickInterval() : null;
        this.contourArray = numberOfContours > 2 ? this.getContourArray( newRange, numberOfContours ) : clone(newRange);
        const trimmedArray: number[] = this.contourArray.slice(1, -1);

        const newOptions: Options = {
            floor: contourVariable.entireRange[0],
            ceil: contourVariable.entireRange[1],
            combineLabels: (min, max) => min + ' to ' + max,
            step: contourVariable.step,
            animate: false,
            showTicksValues: false,
            tickStep: tickInterval,
            ticksArray: trimmedArray.length ? trimmedArray : null
        };
        this.contourOptions = newOptions;
        // determine which area to render in contours
        this.updateVisibilityByContourArea();
    }

    updateVisibilityByContourArea() {
        const contourVariableName: IVariableInfo = this.contours.value.contourVariable.serverName;
        if ( !this.contours.value.threshold ) {
            this.session.call( 'pv.h3lioviz.visibility', [ 'cme_contours', 'off' ] );
            if ( this.contours.controls.threshold.disabled ) {
                // allow cme isosurface to turn on
                this.session.call( 'pv.h3lioviz.visibility', [ 'threshold', 'on' ] );
            } else {
                // turn contours off
                this.session.call( 'pv.h3lioviz.visibility', [ 'threshold', 'off' ] );
            }
        } else {
            this.session.call( 'pv.h3lioviz.visibility', [ 'cme_contours', 'off' ] );
            this.session.call( 'pv.h3lioviz.visibility', [ 'threshold', 'on' ] );
            this.session.call('pv.h3lioviz.set_threshold', [ contourVariableName, this.contourArray ] );
        }
        this.renderDebouncer.next();
    }

    updateVisibilityControls(controlStates: { [parameter: string]: any }) {
        Object.keys( controlStates ).forEach( controlName => {
            if (typeof controlStates[ controlName ] === 'boolean') {
                const name = snakeCase( controlName );
                const state = controlStates[ controlName ] === true ? 'on' : 'off';
                if ( controlName === 'threshold' ) {
                    this.updateVisibilityByContourArea();
                } else {
                    this.session.call( 'pv.h3lioviz.visibility', [ name, state ] );
                }
            }
        });
    }

}
