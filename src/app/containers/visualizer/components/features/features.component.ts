import { Component, Input, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { assign, snakeCase } from 'lodash';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { ConfigLabels, FEATURES, ILayers, LAYER_FORM_DEFAULT_VALUES, VARIABLE_CONFIG } from 'src/app/models';
import { SiteConfigService } from 'src/app/services';

@Component({
    selector: 'swt-features',
    templateUrl: './features.component.html',
    styleUrls: [  '../form.scss', './features.component.scss' ]
})
export class FeaturesComponent implements OnChanges, OnDestroy, OnInit {
    @Input() pvView: any;
    features: FormGroup = new FormGroup({});
    renderDebouncer = new Subject<void>();
    session: { call: (arg0: string, arg1: any[]) => Promise<any> };
    showAngleAdjust = false;
    subscriptions: Subscription[] = [];
    variableConfigurations = VARIABLE_CONFIG;

    constructor(
        private _siteConfigService: SiteConfigService
    ) {
        // initialize FormGroup from layers with default feature names and values
        Object.keys(LAYER_FORM_DEFAULT_VALUES).forEach( controlName => {
            if ( FEATURES.includes( controlName ) ) {
                this.features.addControl(controlName, new FormControl( LAYER_FORM_DEFAULT_VALUES[controlName]));
            }
        });
        // debounce render
        this.subscriptions.push(
            this.renderDebouncer.pipe(
                debounceTime( 300 )
            ).subscribe(() => {
                this.pvView.render();
                const layersConfig: ILayers = this._siteConfigService.getSiteConfig()[ ConfigLabels.layers ];
                // combine new feature values with existing layers config
                const newLayersConfig = assign({}, layersConfig, this.features.value);
                this._siteConfigService.updateSiteConfig( { [ConfigLabels.layers]: newLayersConfig });
            })
        );
    }

    ngOnChanges(): void {
        // get session once, when pvView is defined
        if ( this.pvView && !this.session ) {
            this.session = this.pvView.get().session;
            // once we have a session, set form subscriptions
            this.setFormSubscriptions();
            // once form is interacting with session via subscriptions, initialize the form
            const layers: ILayers = this._siteConfigService.getSiteConfig()[ ConfigLabels.layers ];
            const initialFormValues = Object.keys(this.features.controls).reduce((aggregator, feature) => {
                aggregator[feature] = layers[feature];
                return aggregator;
            }, {});
            this.features.setValue( initialFormValues );
        }
    }

    ngOnInit(): void { }

    ngOnDestroy(): void {
        this.subscriptions.forEach( subscription => subscription.unsubscribe() );
    }

    setFormSubscriptions() {
        // subscribe to any form change
        this.subscriptions.push( this.features.valueChanges
            .pipe( debounceTime( 300 ) )
            .subscribe( newFormValues => {
                this.updateVisibilityControls( newFormValues );
                // this will render every time any named control in the form is updated
                this.renderDebouncer.next();
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
