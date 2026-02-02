import { Component, Input, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { assign, snakeCase } from 'lodash';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { ConfigLabels, ILayers, LAYER_FORM_DEFAULT_VALUES, SLICES, VARIABLE_CONFIG } from 'src/app/models';
import { SiteConfigService } from 'src/app/services';

@Component({
    selector: 'swt-slices',
    templateUrl: './slices.component.html',
    styleUrls: [ '../form.scss', './slices.component.scss' ],
    standalone: false
})
export class SlicesComponent implements OnChanges, OnDestroy, OnInit {
    @Input() pvView: any;
    lonSliceAngle: string;
    lonSliceOptions = {
        validRange: [ -10, 10 ],
        stepSize: 0.5
    };
    slices: FormGroup = new FormGroup({});
    renderDebouncer = new Subject<void>();
    session: { call: (arg0: string, arg1: any[]) => Promise<any> };
    showAngleAdjust = false;
    subscriptions: Subscription[] = [];
    variableConfigurations = VARIABLE_CONFIG;

    constructor(
        private _siteConfigService: SiteConfigService
    ) {
        // initialize FormGroup from layers with default slice names and values
        Object.keys(LAYER_FORM_DEFAULT_VALUES).forEach( controlName => {
            if ( SLICES.includes( controlName ) ) {
                this.slices.addControl(controlName, new FormControl( LAYER_FORM_DEFAULT_VALUES[controlName]));
            }
        });
        // debounce render
        this.subscriptions.push(
            this.renderDebouncer.pipe(
                debounceTime( 300 )
            ).subscribe(() => {
                this.pvView.render();
                const layersConfig: ILayers = this._siteConfigService.getSiteConfig()[ ConfigLabels.layers ];
                const newLayersConfig = assign({}, layersConfig, this.slices.value);
                this._siteConfigService.updateSiteConfig( {
                    [ConfigLabels.layers]: newLayersConfig
                });
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
            const initialFormValues = Object.keys(this.slices.controls).reduce((aggregator, slice) => {
                aggregator[slice] = layers[slice];
                return aggregator;
            }, {});
            this.slices.setValue( initialFormValues );
        }
    }

    ngOnInit(): void { }

    ngOnDestroy(): void {
        this.subscriptions.forEach( subscription => subscription.unsubscribe() );
    }

    setFormSubscriptions() {
        // subscribe to any form change
        this.subscriptions.push( this.slices.valueChanges
            .pipe( debounceTime( 300 ) )
            .subscribe( newFormValues => {
                this.updateVisibilityControls( newFormValues );
                // this will render every time any named control in the form is updated
                this.renderDebouncer.next();
            })
        );
        // subscribe to LON SLICE TYPE changes and render appropriately
        this.subscriptions.push( this.slices.controls.lonSliceType.valueChanges
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
            // never turn the 'cme' visibility on, use single 'dp' threshold instead
            this.session.call( 'pv.h3lioviz.visibility', [ 'cme', 'off' ] );
            if (controlName !== 'cme' && typeof controlStates[ controlName ] === 'boolean') {
                const name = snakeCase( controlName );
                const state = controlStates[ controlName ] === true ? 'on' : 'off';
                this.session.call( 'pv.h3lioviz.visibility', [ name, state ] );
            }
            if ( controlName === 'cme' ) {
                if ( controlStates.cme === true) {
                    // turn on single dp threshold
                    this.session.call( 'pv.h3lioviz.visibility', [ 'cme_contours', 'off' ] );
                    this.session.call( 'pv.h3lioviz.visibility', [ 'threshold', 'on' ] );
                    this.session.call('pv.h3lioviz.set_threshold', [ 'dp', [ 0, 0.001 ] ] );
                } else {
                    this.session.call( 'pv.h3lioviz.visibility', [ 'threshold', 'off' ] );
                }
            }
        });
    }
}
