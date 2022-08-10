import { ChangeContext, Options } from '@angular-slider/ngx-slider';
import { Component, Input, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { clone, snakeCase } from 'lodash';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { INITIAL_TICK_STEP, IVariableInfo, LAYER_MENU_DEFAULT_VALUES, VARIABLE_CONFIG } from 'src/app/models';

@Component({
    selector: 'swt-layer-menu',
    templateUrl: './layer-menu.component.html',
    styleUrls: [ './layer-menu.component.scss' ]
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
        showTicksValues: true,
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
        // create user objects from session storage if it exists, or from defaults
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
            this.session.call('pv.h3lioviz.rotate_plane', [ 'lon', Number( this.lonSliceAngle ) ] );
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

    getTickStep(): number {
        const numberOfContours = this.layerMenu.value.numberOfContours;
        const step = ( this.contourRange[1] - this.contourRange[0] ) / ( numberOfContours  - 1 );
        return step;
    }

    saveUserSettings(): void {
        sessionStorage.setItem('layerMenu', JSON.stringify( this.layerMenu.value ));
        sessionStorage.setItem('contourRanges', JSON.stringify( this.userContourRanges ));
        sessionStorage.setItem('lonSliceAngle', JSON.stringify( this.lonSliceAngle ));
    }

    setFormSubscriptions() {
        // subscribe to any form change
        this.subscriptions.push( this.layerMenu.valueChanges
            .pipe( debounceTime( 300 ) )
            .subscribe( newFormValues => {
                this.updateVisibilityControls( newFormValues );
                // this will render every time any named control in the form is updated
                // the contour range is tracked outside of the form and is updated and rendered manually
                this.renderDebouncer.next();
            })
        );
        // subscribe to CONTOUR NUMBER changes and call update contour function if more than 1 contour
        this.subscriptions.push( this.layerMenu.controls.numberOfContours.valueChanges
            .pipe( debounceTime(300) ).subscribe( ( value: number ) => {
                // TODO: better validation and include possibility of 0 and 1
                if ( value > 1 ) {
                    this.updateContourRange( { value: this.contourRange[0], highValue: this.contourRange[1], pointerType: undefined });
                }
            })
        );
        // subscribe to CONTOUR VARIABLE changes and call update contour function with new contour variable values
        this.subscriptions.push( this.layerMenu.controls.contourVariable.valueChanges
            .pipe( debounceTime( 300 ) ).subscribe( newContourVariable => {
                const contourVariableServerName = newContourVariable.serverName;
                const newContourRange = this.userContourRanges[ contourVariableServerName ];
                this.updateContourRange( { value: newContourRange[0], highValue: newContourRange[1], pointerType: undefined });
            })
        );
    }
    
    updateContourRange( event: ChangeContext ) {
        const contourVariable: IVariableInfo = this.layerMenu.value.contourVariable;
        const newRange: [ number, number ] = [ event.value, event.highValue ];
        const numberOfContours = this.layerMenu.value.numberOfContours;
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

        this.session.call('pv.h3lioviz.set_contours', [ contourVariable.serverName, this.contourArray ]);
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
        this.session.call('pv.h3lioviz.rotate_plane', [ 'lon', Number( this.lonSliceAngle ) ] );
        this.renderDebouncer.next();
    }

    updateVisibilityControls(controlStates: { [parameter: string]: any }) {
        Object.keys( controlStates ).forEach( controlName => {
            if ( controlName === 'satellites' ) {
                const state = controlStates[ controlName ] === true ? 'on' : 'off';
                this.session.call( 'pv.h3lioviz.toggle_satellites', [ state ] );
            } else if (typeof controlStates[ controlName ] === 'boolean') {
                const name = snakeCase( controlName );
                const state = controlStates[ controlName ] === true ? 'on' : 'off';
                this.session.call( 'pv.h3lioviz.visibility', [ name, state ] );
            }
        });
    }
}
