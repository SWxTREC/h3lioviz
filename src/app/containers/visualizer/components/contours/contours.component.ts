import { ChangeContext, Options } from '@angular-slider/ngx-slider';
import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { clone, isEmpty, snakeCase } from 'lodash';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import {
    CONTOUR_FORM_DEFAULT_VALUES,
    INITIAL_TICK_STEP,
    IVariableInfo,
    VARIABLE_CONFIG
} from 'src/app/models';

@Component({
    selector: 'swt-contours',
    templateUrl: './contours.component.html',
    styleUrls: [  '../form.scss', './contours.component.scss' ]
})
export class ContoursComponent implements OnInit, OnChanges {
    @Input() pvView: any;
    defaultContourVariable: IVariableInfo = CONTOUR_FORM_DEFAULT_VALUES.contourVariable;

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
    renderDebouncer: Subject<string> = new Subject<string>();
    session: { call: (arg0: string, arg1: any[]) => Promise<any> };
    subscriptions: Subscription[] = [];
    userContourRanges: { [parameter: string]: [ number, number ] } = {};
    variableConfigurations = VARIABLE_CONFIG;


    constructor() {
        // initialize FormGroup with default contour menu names and values
        Object.keys(CONTOUR_FORM_DEFAULT_VALUES).forEach( controlName => {
            this.contours.addControl(controlName, new FormControl( CONTOUR_FORM_DEFAULT_VALUES[controlName]));
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
            const initialFormValues = clone(JSON.parse(sessionStorage.getItem('contours'))) || clone(CONTOUR_FORM_DEFAULT_VALUES);
            this.contours.setValue( initialFormValues );
            const initialContourVariable = initialFormValues.contourVariable.serverName;
            this.contourRange = this.userContourRanges[ initialContourVariable ];
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
        this.renderDebouncer.next();
    }

    getContourArray( contourRange: [number, number], numberOfContours: number ): number[] {
        const interval = this.getTickInterval();
        const indexArray = [ ...Array(numberOfContours).keys() ]; // [0, 1, 2, …]
        const contourArray =
            indexArray.map( indexValue => Math.round(this.contourRange[0] + (indexValue * interval)) );
        return contourArray;
    }

    getTickInterval(): number {
        const numberOfContours = this.contours.value.numberOfContours;
        const interval = ( this.contourRange[1] - this.contourRange[0] ) / ( numberOfContours  - 1 );
        return interval;
    }

    saveUserSettings(): void {
        sessionStorage.setItem('contours', JSON.stringify( this.contours.value ));
        sessionStorage.setItem('contourRanges', JSON.stringify( this.userContourRanges ));
    }

    setFormSubscriptions() {
        // subscribe to any form change
        this.subscriptions.push( this.contours.valueChanges
            .pipe( debounceTime( 300 ) )
            .subscribe( newFormValues => {
                this.updateVisibilityControls( newFormValues );
                // this will render every time any named control in the form is updated
                // the contour range is tracked outside of the form and is updated and rendered in contourRangeChange()
                this.renderDebouncer.next();
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
                this.updateContourRange( newContourRange );
            })
        );
        // subscribe to CONTOUR AREA changes and call update contour function
        this.subscriptions.push( this.contours.controls.contourArea.valueChanges
            .pipe( debounceTime( 300 ) ).subscribe( newContourArea => {
                this.updateContourRange( this.contourRange );
            })
        );
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
        if ( !this.contours.value.cmeContours ) {
            this.session.call( 'pv.h3lioviz.visibility', [ 'cme_contours', 'off' ] );
            this.session.call( 'pv.h3lioviz.visibility', [ 'threshold', 'off' ] );
        } else {
            // TODO: do I need to clear one render from the backend? or can we consolidate on the backend as well?
            if ( this.contours.value.contourArea === 'cme' ) {
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
            if (typeof controlStates[ controlName ] === 'boolean') {
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
