import { Component, Input, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { clone, snakeCase } from 'lodash';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { LAYER_FORM_DEFAULT_VALUES, VARIABLE_CONFIG } from 'src/app/models';

@Component({
    selector: 'swt-layers',
    templateUrl: './layers.component.html',
    styleUrls: [  '../form.scss', './layers.component.scss' ]
})
export class LayersComponent implements OnChanges, OnDestroy, OnInit {
    @Input() pvView: any;
    lonSliceAngle: string;
    lonSliceOptions = {
        validRange: [ -10, 10 ],
        stepSize: 0.5
    };
    layers: FormGroup = new FormGroup({});
    renderDebouncer: Subject<string> = new Subject<string>();
    session: { call: (arg0: string, arg1: any[]) => Promise<any> };
    showAngleAdjust = false;
    subscriptions: Subscription[] = [];
    variableConfigurations = VARIABLE_CONFIG;

    constructor() {
        // initialize FormGroup with default layer names and values
        Object.keys(LAYER_FORM_DEFAULT_VALUES).forEach( controlName => {
            this.layers.addControl(controlName, new FormControl( LAYER_FORM_DEFAULT_VALUES[controlName]));
        });
        // debounce render
        this.subscriptions.push(
            this.renderDebouncer.pipe(
                debounceTime( 300 )
            ).subscribe(() => {
                this.pvView.render();
                sessionStorage.setItem('layers', JSON.stringify( this.layers.value ));
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
            const initialFormValues = clone(JSON.parse(sessionStorage.getItem('layers'))) || clone(LAYER_FORM_DEFAULT_VALUES);
            this.layers.setValue( initialFormValues );
        }
    }

    ngOnInit(): void { }

    ngOnDestroy(): void {
        this.subscriptions.forEach( subscription => subscription.unsubscribe() );
    }

    setFormSubscriptions() {
        // subscribe to any form change
        this.subscriptions.push( this.layers.valueChanges
            .pipe( debounceTime( 300 ) )
            .subscribe( newFormValues => {
                this.updateVisibilityControls( newFormValues );
                // this will render every time any named control in the form is updated
                this.renderDebouncer.next();
            })
        );
        // subscribe to LON SLICE TYPE changes and render appropriately
        this.subscriptions.push( this.layers.controls.lonSliceType.valueChanges
            .pipe( debounceTime( 300 ) ).subscribe( newLonSliceType => {
                if ( newLonSliceType === 'solar-equator' ) {
                    this.session.call('pv.h3lioviz.snap_solar_plane', [ 'equator' ]);
                } else {
                    this.session.call('pv.h3lioviz.snap_solar_plane', [ 'ecliptic' ]);
                }
            })
        );
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
