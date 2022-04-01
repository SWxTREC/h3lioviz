import { ChangeContext, Options } from '@angular-slider/ngx-slider';
import { Component, Input, OnChanges, OnDestroy } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { clone, snakeCase } from 'lodash';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { IVariableInfo, KEYBOARD_SHORTCUTS } from 'src/app/models';

@Component({
    selector: 'swt-control-panel',
    templateUrl: './control-panel.component.html',
    styleUrls: [ './control-panel.component.scss' ]
})
export class ControlPanelComponent implements OnChanges, OnDestroy {
    @Input() pvView: any;
    keyboardShortcuts = KEYBOARD_SHORTCUTS;

    // serverName must match an option on the server
    COLORMAPS = {
        coolToWarm: {
            displayName: 'Cool to warm',
            imgSrc: 'assets/images/cool_to_warm.png',
            serverName: 'Cool to Warm'
        },
        inferno: {
            displayName: 'Inferno',
            imgSrc: 'assets/images/inferno.png',
            serverName: 'Inferno (matplotlib)'
        },
        plasma: {
            displayName: 'Plasma',
            imgSrc: 'assets/images/plasma.png',
            serverName: 'Plasma (matplotlib)'
        },
        viridis: {
            displayName: 'Viridis',
            imgSrc: 'assets/images/viridis.png',
            serverName: 'Viridis (matplotlib)'
        },
        divergent: {
            displayName: 'Divergent',
            imgSrc: 'assets/images/blue_orange.png',
            serverName: 'Blue Orange (divergent)'
        },
        rainbow: {
            displayName: 'Rainbow',
            imgSrc: 'assets/images/nic_cubicl.png',
            serverName: 'nic_CubicL'
        }
    };

    // TODO: set these in the server on load
    VARIABLE_CONFIG: { [param: string]: IVariableInfo } = {
        velocity: {
            serverName: 'velocity',
            displayName: 'Velocity',
            units: 'km/s',
            colorRange: [ 300, 900 ],
            defaultColormap: this.COLORMAPS.plasma,
            thresholdRange: [ 600, 900 ],
            step: 50
        },
        density: {
            serverName: 'density',
            displayName: 'Density',
            units: 'r<sup>2</sup>N/cm<sup>3</sup>',
            colorRange: [ 0, 30 ],
            defaultColormap: this.COLORMAPS.viridis,
            thresholdRange: [ 15, 30 ],
            step: 1
        },
        pressure: {
            serverName: 'pressure',
            displayName: 'Ram pressure',
            units: 'r<sup>2</sup>N/cm<sup>3</sup> * km<sup>2</sup>/s<sup>2</sup>',
            colorRange: [ 100000, 10000000 ],
            defaultColormap: this.COLORMAPS.viridis,
            thresholdRange: [ 500000, 10000000 ],
            step: 10000
        },
        temperature: {
            serverName: 'temperature',
            displayName: 'Temperature',
            units: 'K',
            colorRange: [ 10000, 1000000 ],
            defaultColormap: this.COLORMAPS.inferno,
            thresholdRange: [ 500000, 1000000 ],
            step: 10000
        },
        b: {
            serverName: 'b',
            displayName: 'B',
            units: 'nT',
            colorRange: [ -100, 100 ],
            defaultColormap: this.COLORMAPS.coolToWarm,
            thresholdRange: [ -50, 0 ],
            step: 5
        },
        bx: {
            serverName: 'bx',
            displayName: 'Bx',
            units: 'nT',
            colorRange: [ -100, 100 ],
            defaultColormap: this.COLORMAPS.coolToWarm,
            thresholdRange: [ -50, 0 ],
            step: 5
        },
        by: {
            serverName: 'by',
            displayName: 'By',
            units: 'nT',
            colorRange: [ -100, 100 ],
            defaultColormap: this.COLORMAPS.coolToWarm,
            thresholdRange: [ -50, 0 ],
            step: 5
        },
        bz: {
            serverName: 'bz',
            displayName: 'Bz',
            units: 'nT',
            colorRange: [ -100, 100 ],
            defaultColormap: this.COLORMAPS.coolToWarm,
            thresholdRange: [ -50, 0 ],
            step: 5
        }
    };
    defaultColorVariable: IVariableInfo = this.VARIABLE_CONFIG.velocity;
    defaultThresholdVariable: IVariableInfo = this.VARIABLE_CONFIG.density;
    CONTROL_PANEL_DEFAULT_VALUES = {
        colorVariable: this.defaultColorVariable,
        colormap: this.defaultColorVariable.defaultColormap,
        cme: true,
        latSlice: true,
        lonArrows: false,
        lonSlice: true,
        lonStreamlines: false,
        opacity: [ 70, 100 ] as [number, number],
        threshold: false,
        thresholdVariable: this.defaultThresholdVariable
    };
    colorOptions: Options = {
        floor: this.defaultColorVariable.colorRange[0],
        ceil: this.defaultColorVariable.colorRange[1],
        step: this.defaultColorVariable.step,
        animate: false
    };
    colorRange: [ number, number ] = ( this.defaultColorVariable.colorRange );
    controlPanel: FormGroup = new FormGroup({});
    colorbarLeftOffset = '0';
    colorbarRightOffset = '0';
    colorVariableServerName: string = this.defaultColorVariable.serverName;
    opacityOptions: Options = {
        floor: 0,
        ceil: 100,
        step: 10,
        animate: false
    };
    renderDebouncer: Subject<string> = new Subject<string>();
    session: { call: (arg0: string, arg1: any[]) => Promise<any>; };
    subscriptions: Subscription[] = [];
    thresholdOptions: Options = {
        floor: this.defaultThresholdVariable.colorRange[0],
        ceil: this.defaultThresholdVariable.colorRange[1],
        step: this.defaultThresholdVariable.step,
        animate: false
    };
    thresholdRange: [number, number] = ( this.defaultThresholdVariable.colorRange );
    userColormaps: { [parameter: string]: { displayName: string, serverName: string } } = {};
    userColorRanges: { [parameter: string]: [ number, number ] } = {};
    userOpacities: { [parameter: string]: [ number, number ] } = {};
    userThresholdRanges: { [parameter: string]: [ number, number ] } = {};
    zoomState: 'on' | 'off' = 'on';

    constructor() {
        // initialize FormGroup with default control panel names and values
        Object.keys(this.CONTROL_PANEL_DEFAULT_VALUES).forEach( controlName => {
            this.controlPanel.addControl(controlName, new FormControl( this.CONTROL_PANEL_DEFAULT_VALUES[controlName]));
        });
        // create user objects from session storage if it exists, or from defaults
        // colormaps
        if ( sessionStorage.getItem('colormaps') ) {
            this.userColormaps = JSON.parse(sessionStorage.getItem('colormaps'));
        } else {
            Object.keys(this.VARIABLE_CONFIG).forEach( (variable) => {
                this.userColormaps[variable] = this.VARIABLE_CONFIG[variable].defaultColormap;
            });
        }
        // colorRanges
        if ( sessionStorage.getItem('colorRanges')) {
            this.userColorRanges = JSON.parse(sessionStorage.getItem('colorRanges'));
        } else {
            Object.keys(this.VARIABLE_CONFIG).forEach( (variable) => {
                this.userColorRanges[variable] = this.VARIABLE_CONFIG[variable].colorRange;
            });
        }
        // opacities
        if ( sessionStorage.getItem('opacities')) {
            this.userOpacities = JSON.parse(sessionStorage.getItem('opacities'));
        } else {
            Object.keys(this.VARIABLE_CONFIG).forEach( (variable) => {
                this.userOpacities[variable] = this.CONTROL_PANEL_DEFAULT_VALUES.opacity;
            });
        }
        // thresholdRanges
        if ( sessionStorage.getItem('thresholdRanges')) {
            this.userThresholdRanges = JSON.parse(sessionStorage.getItem('thresholdRanges'));
        } else {
            Object.keys(this.VARIABLE_CONFIG).forEach( (variable) => {
                this.userThresholdRanges[variable] = this.VARIABLE_CONFIG[variable].thresholdRange;
            });
        }

        // debounce render
        this.subscriptions.push(
            this.renderDebouncer.pipe(
                debounceTime( 300 )
            ).subscribe(() => {
                this.pvView.render();
            }
        ));
    }

    ngOnChanges(): void {
        // get session once, when pvView is defined
        if ( this.pvView && !this.session ) {
            this.session = this.pvView.get().session;
            // once we have a session, set form subscriptions
            this.setFormSubscriptions();
            // once form is interacting with session via subscriptions, initialize the form from sessionStorage or defaults
            const initialFormValues = clone(JSON.parse(sessionStorage.getItem('controlPanel'))) || clone(this.CONTROL_PANEL_DEFAULT_VALUES);
            this.controlPanel.setValue( initialFormValues );
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

    resetZoom() {
        this.pvView.get().viewStream.resetCamera();
    }

    saveUserSettings(): void {
        sessionStorage.setItem('controlPanel', JSON.stringify( this.controlPanel.value ));
        sessionStorage.setItem('opacities', JSON.stringify( this.userOpacities ));
        sessionStorage.setItem('colormaps', JSON.stringify( this.userColormaps ));
        sessionStorage.setItem('colorRanges', JSON.stringify( this.userColorRanges ));
        sessionStorage.setItem('thresholdRanges', JSON.stringify( this.userThresholdRanges ));
    }

    setFormSubscriptions() {
        // subscribe to any form change
        this.subscriptions.push( this.controlPanel.valueChanges
            .pipe( debounceTime( 300 ) ).subscribe( newFormValues => {
                this.updateVisibilityControls( newFormValues );
                // this will render every time any named control in the form is updated
                // the threshold range and color range are tracked outside of the form and are updated and rendered manually
                this.renderDebouncer.next();
                this.saveUserSettings();
            }));
        // subscribe to color variable changes, color variable is tied to colormap (form subscription via setValue for server),
        // opacity (form subscription via setValue for server), and color range (update via updateColorRange())
        this.subscriptions.push( this.controlPanel.controls.colorVariable.valueChanges
            .pipe( debounceTime( 300 ) ).subscribe( newColorVariable => {
                this.colorVariableServerName = newColorVariable.serverName;
                this.session.call('pv.enlil.colorby', [ this.colorVariableServerName ]);
                this.controlPanel.controls.colormap.setValue( this.userColormaps[ this.colorVariableServerName ] );
                this.controlPanel.controls.opacity.setValue( this.userOpacities[ this.colorVariableServerName ] );
                const variableColorRange = this.userColorRanges[ this.colorVariableServerName ];
                this.colorOptions = {
                    floor: newColorVariable.colorRange[0],
                    ceil: newColorVariable.colorRange[1],
                    step: newColorVariable.step,
                    animate: false
                };
                this.updateColorRange( { value: variableColorRange[0], highValue: variableColorRange[1], pointerType: undefined })
            }));
        // subscribe to color map changes, set userColormap, and reset PV colormap
        this.subscriptions.push( this.controlPanel.controls.colormap.valueChanges
            .pipe( debounceTime( 300 ) ).subscribe( newColormapObject => {
                this.userColormaps[ this.colorVariableServerName ] = clone(newColormapObject);
                this.session.call('pv.enlil.set_colormap', [ this.colorVariableServerName, newColormapObject.serverName ]);
            }));
        // subscribe to threshold variable changes and reset threshold slider options, threshold range, and 'set_threshold'
        this.subscriptions.push( this.controlPanel.controls.thresholdVariable.valueChanges
            .pipe( debounceTime( 300 ) ).subscribe( newThresholdVariable => {
                const thresholdVariableServerName = newThresholdVariable.serverName;
                this.thresholdOptions = {
                    floor: newThresholdVariable.colorRange[0],
                    ceil: newThresholdVariable.colorRange[1],
                    step: newThresholdVariable.step,
                    animate: false
                };
                const newThresholdRange = this.userThresholdRanges[ thresholdVariableServerName ];
                this.updateThresholdRange( { value: newThresholdRange[0], highValue: newThresholdRange[1], pointerType: undefined })
            }));
        // subscribe to opacity slider set user opacity per color variable and 'set_opacity'
        this.subscriptions.push( this.controlPanel.controls.opacity.valueChanges
            .pipe( debounceTime( 300 ) ).subscribe( () => {
                const newOpacityRange: [ number, number ] = this.controlPanel.value.opacity;
                this.userOpacities[this.colorVariableServerName] = clone(newOpacityRange);
                const opacityLow: number = newOpacityRange[0] / 100;
                const opacityHigh: number = newOpacityRange[1] / 100;
                if ( this.colorVariableServerName[ 0 ] === 'b' ) {
                    this.session.call( 'pv.enlil.set_opacity', [ this.colorVariableServerName, [ opacityHigh, opacityLow, opacityHigh ] ] );
                } else {
                    this.session.call( 'pv.enlil.set_opacity', [ this.colorVariableServerName, [ opacityLow, opacityHigh ] ] );
                }
            }));
    }

    snapTo( view: string ) {
        this.session.call( 'pv.enlil.snap_to_view', [ view ] );
        this.renderDebouncer.next();
    }

    toggleZoom() {
        const getZoom = this.pvView.get().rpcWheelEvent;
        // if zoom is on, turn it off and vice versa
        if (getZoom) {
            this.zoomState = 'off';
            this.pvView.setRpcWheelEvent( undefined );
        } else {
            this.zoomState = 'on';
            this.pvView.setRpcWheelEvent( 'viewport.mouse.zoom.wheel' );
        }
    }

    updateVisibilityControls(controlStates: { [parameter: string]: any; }) {
        Object.keys( controlStates ).forEach( controlName => {
            if (typeof controlStates[ controlName ] === 'boolean') {
                const name = snakeCase( controlName );
                const state = controlStates[ controlName ] === true ? 'on' : 'off';
                this.session.call( 'pv.enlil.visibility', [ name, state ] );
            }
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
        this.session.call('pv.enlil.set_range', [ this.colorVariableServerName , this.colorRange ] );
        this.renderDebouncer.next();
    }

    updateThresholdRange( event: ChangeContext ) {
        const thresholdVariableServerName: string = this.controlPanel.value.thresholdVariable.serverName;
        const newRange: [ number, number ] = [ event.value, event.highValue ];
        this.thresholdRange = clone(newRange);
        this.userThresholdRanges[ thresholdVariableServerName ] = clone(newRange);
        this.session.call('pv.enlil.set_threshold', [ thresholdVariableServerName, this.thresholdRange ] );
        this.renderDebouncer.next();
    }
}
