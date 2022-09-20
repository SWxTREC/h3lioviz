import { ChangeContext, Options } from '@angular-slider/ngx-slider';
import { Component, Input, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { clone, isEmpty, snakeCase } from 'lodash';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { INITIAL_TICK_STEP, IVariableInfo, LAYER_MENU_DEFAULT_VALUES, VARIABLE_CONFIG } from 'src/app/models';

@Component({
    selector: 'swt-layer-menu',
    templateUrl: './layer-menu.component.html',
    styleUrls: [ '../menu.scss', './layer-menu.component.scss' ]
})
export class LayerMenuComponent implements OnChanges, OnDestroy, OnInit {
    @Input() pvView: any;
    defaultContourVariable: IVariableInfo = LAYER_MENU_DEFAULT_VALUES.contourVariable;
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
        showTicksValues: false,
        tickStep: INITIAL_TICK_STEP,
        ticksArray: [ this.defaultContourVariable.defaultSubsetRange[0] + INITIAL_TICK_STEP ]
    };
    lonSliceAngle: string;
    lonSliceOptions = {
        validRange: [ -10, 10 ],
        stepSize: 0.5
    };

    layerMenu: FormGroup = new FormGroup({});
    renderDebouncer: Subject<string> = new Subject<string>();
    session: { call: (arg0: string, arg1: any[]) => Promise<any> };
    showAngleAdjust = false;
    subscriptions: Subscription[] = [];
    userContourRanges: { [parameter: string]: [ number, number ] } = {};
    variableConfigurations = VARIABLE_CONFIG;

    constructor() {
        // initialize FormGroup with default layer menu names and values
        Object.keys(LAYER_MENU_DEFAULT_VALUES).forEach( controlName => {
            this.layerMenu.addControl(controlName, new FormControl( LAYER_MENU_DEFAULT_VALUES[controlName]));
        });
        // get user contourRanges from session storage if it exists, or from defaults
        if ( !isEmpty(sessionStorage.getItem('contourRanges'))) {
            this.userContourRanges = JSON.parse(sessionStorage.getItem('contourRanges'));
        } else {
            Object.keys(VARIABLE_CONFIG).forEach( (variable) => {
                this.userContourRanges[variable] = VARIABLE_CONFIG[variable].defaultSubsetRange;
            });
        }
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
            // once form is interacting with session via subscriptions, initialize the form from sessionStorage or defaults
            const initialFormValues = clone(JSON.parse(sessionStorage.getItem('layerMenu'))) || clone(LAYER_MENU_DEFAULT_VALUES);
            this.layerMenu.setValue( initialFormValues );
            const initialContourVariable = initialFormValues.contourVariable.serverName;
            this.contourRange = this.userContourRanges[ initialContourVariable ];
        }
    }

    ngOnInit(): void { }

    ngOnDestroy(): void {
        this.subscriptions.forEach( subscription => subscription.unsubscribe() );
    }

    // This mat-select compareWith function is used to verify the proper label for the selection in the dropdown
    compareObjectNames(o1: any, o2: any): boolean {
        return o1.displayName === o2.displayName;
    }

    getContourArray( contourRange: [number, number], numberOfContours: number ): number[] {
        const interval = this.getTickInterval();
        const indexArray = [ ...Array(numberOfContours).keys() ]; // [0, 1, 2, …]
        const contourArray =
            indexArray.map( indexValue => Math.round(this.contourRange[0] + (indexValue * interval)) );
        return contourArray;
    }

    getTickInterval(): number {
        const numberOfContours = this.layerMenu.value.numberOfContours;
        const interval = ( this.contourRange[1] - this.contourRange[0] ) / ( numberOfContours  - 1 );
        return interval;
    }

    contourRangeChange( event: ChangeContext ) {
        this.updateContourRange( [ event.value, event.highValue ] );
        this.renderDebouncer.next();
    }

    saveUserSettings(): void {
        sessionStorage.setItem('layerMenu', JSON.stringify( this.layerMenu.value ));
        sessionStorage.setItem('contourRanges', JSON.stringify( this.userContourRanges ));
    }

    setFormSubscriptions() {
        // subscribe to any form change
        this.subscriptions.push( this.layerMenu.valueChanges
            .pipe( debounceTime( 300 ) )
            .subscribe( newFormValues => {
                this.updateVisibilityControls( newFormValues );
                // this will render every time any named control in the form is updated
                // the contour range is tracked outside of the form and is updated and rendered in contourRangeChange()
                this.renderDebouncer.next();
            })
        );
        // subscribe to CONTOUR NUMBER changes and call update contour function if more than 1 contour
        this.subscriptions.push( this.layerMenu.controls.numberOfContours.valueChanges
            .pipe( debounceTime(300) ).subscribe( ( value: number ) => {
                // TODO: better validation and include possibility of 0 and 1
                if ( value > 1 ) {
                    this.updateContourRange( this.contourRange );
                }
            })
        );
        // subscribe to CONTOUR VARIABLE changes and call update contour function with new contour variable values
        this.subscriptions.push( this.layerMenu.controls.contourVariable.valueChanges
            .pipe( debounceTime( 300 ) ).subscribe( newContourVariable => {
                const contourVariableServerName = newContourVariable.serverName;
                const newContourRange = clone(this.userContourRanges[ contourVariableServerName ]);
                this.updateContourRange( newContourRange );
            })
        );
        // subscribe to CONTOUR AREA changes and call update contour function
        this.subscriptions.push( this.layerMenu.controls.contourArea.valueChanges
            .pipe( debounceTime( 300 ) ).subscribe( newContourArea => {
                this.updateContourRange( this.contourRange );
            })
        );
        // subscribe to LON SLICE TYPE changes and render appropriately
        this.subscriptions.push( this.layerMenu.controls.lonSliceType.valueChanges
            .pipe( debounceTime( 300 ) ).subscribe( newLonSliceType => {
                if ( newLonSliceType === 'solar-equator' ) {
                    this.session.call('pv.h3lioviz.snap_solar_plane', [ 'equator' ]);
                } else {
                    this.session.call('pv.h3lioviz.snap_solar_plane', [ 'ecliptic' ]);
                }
            })
        );
    }

    updateContourRange( newRange: [number, number] ) {
        const contourVariable: IVariableInfo = this.layerMenu.value.contourVariable;
        const numberOfContours = this.layerMenu.value.numberOfContours;
        this.userContourRanges[ contourVariable.serverName ] = clone( newRange );

        this.contourRange = clone( newRange );
        const interval = numberOfContours > 2 ? this.getTickInterval() : null;
        this.contourArray = numberOfContours > 2 ? this.getContourArray( newRange, numberOfContours ) : clone(newRange);
        const trimmedArray: number[] = this.contourArray.slice(1, -1);

        const newOptions: Options = {
            floor: contourVariable.entireRange[0],
            ceil: contourVariable.entireRange[1],
            combineLabels: (min, max) => min + ' to ' + max,
            step: contourVariable.step,
            animate: false,
            showTicksValues: false,
            tickStep: interval,
            ticksArray: trimmedArray.length ? trimmedArray : null
        };
        this.contourOptions = newOptions;
        // determine which area to render in contours
        this.updateVisibilityByContourArea();
    }

    updateVisibilityByContourArea() {
        const contourVariableName: IVariableInfo = this.layerMenu.value.contourVariable.serverName;
        if ( !this.layerMenu.value.cmeContours ) {
            this.session.call( 'pv.h3lioviz.visibility', [ 'cme_contours', 'off' ] );
            this.session.call( 'pv.h3lioviz.visibility', [ 'threshold', 'off' ] );
        } else {
            // TODO: do I need to clear one render from the backend? or can we consolidate on the backend as well?
            if ( this.layerMenu.value.contourArea === 'cme' ) {
                // set the values for the cme
                this.session.call( 'pv.h3lioviz.visibility', [ 'cme_contours', 'on' ] );
                this.session.call( 'pv.h3lioviz.visibility', [ 'threshold', 'off' ] );
                this.session.call('pv.h3lioviz.set_contours', [ contourVariableName, this.contourArray ]);
            } else {
                // set the values for the entire area
                this.session.call( 'pv.h3lioviz.visibility', [ 'cme_contours', 'off' ] );
                this.session.call( 'pv.h3lioviz.visibility', [ 'threshold', 'on' ] );
                this.session.call('pv.h3lioviz.set_threshold', [ contourVariableName, this.contourArray ] );
            }
        }
    }

    updateVisibilityControls(controlStates: { [parameter: string]: any }) {
        Object.keys( controlStates ).forEach( controlName => {
            if ( controlName === 'satellites' ) {
                const state = controlStates[ controlName ] === true ? 'on' : 'off';
                this.session.call( 'pv.h3lioviz.toggle_satellites', [ state ] );
            } else if (typeof controlStates[ controlName ] === 'boolean') {
                const name = snakeCase( controlName );
                const state = controlStates[ controlName ] === true ? 'on' : 'off';
                if ( controlName === 'cmeContours' ) {
                    // tie the threshold state to the cmeContours state and area selected
                    if ( state === 'on' ) {
                        this.updateVisibilityByContourArea();
                    } else {
                        // turn both off
                        this.session.call( 'pv.h3lioviz.visibility', [ name, state ] );
                        this.session.call( 'pv.h3lioviz.visibility', [ 'threshold', state ] );
                    }
                } else {
                    this.session.call( 'pv.h3lioviz.visibility', [ name, state ] );
                }
            }
        });
    }
}
