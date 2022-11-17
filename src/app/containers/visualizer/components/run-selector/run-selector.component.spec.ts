import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { IModelMetadata } from 'src/app/models';
import { MaterialModule } from 'src/app/modules';

import { RunSelectorComponent } from './run-selector.component';

const catalog: IModelMetadata[] = [
    {
        type: 'TIM',
        title: 'Values at the given time level',
        program: 'enlil',
        version: '2.10',
        project: '/data',
        code: '/data',
        model: 'mhd ethe splitted upwind minmod llf noflxdif novsdif difb nodivb',
        geometry: 'spherical',
        grid: 'X1=0.1-2.1/uniform X2=30-150/uniform X3=0-360/uniform',
        rotation: 'synodic',
        case: 'reg2med1.dvb-a8b1-d4t1x1.20111127T00',
        cordata: '',
        cmedata: 'null',
        observatory: 'gongb',
        fitted_by: 'null',
        corona: 'WSA_V2.2',
        crnum: 'null',
        crlon: 'null',
        shift_deg: 8.0,
        nshift: 1,
        initial: '',
        boundary: 'LVV=-24.,-8./62.,61./389.,395./0. RRtilt=18.,15./0./0. NTxcld=4/1/1 NTrcav=1./4.',
        run: 'reg2med1.dvb-a8b1-d4t1x1.16-mcp1va2d-1.g53h10d02.20111127T00',
        parameters: 'g=1.6666667 q=100000./2 xa=0.05 rot=synodic cfl=0.4 difb=0.2/1./1.',
        resrun: '',
        grid_old: '',
        initial_old: '',
        boundary_old: 'B=500./350./5./400./1 D=300./2. T=0.5/0 V=700./450./25./75./200. S=8./1 A=0.05',
        parameters_old: '',
        obsdate_mjd: 59515.83333333349,
        obsdate_cal: '2021-10-28T20',
        rundate_mjd: 59515.83333333349,
        rundate_cal: '2021-10-28T20',
        rbnd: 14964000000.0,
        gamma: '1.6666667',
        xalpha: 0.05,
        mevo: 3108,
        mfld: 0,
        mslc1: 0,
        mslc2: 0,
        mtim: 1,
        creation: '2021-11-30T22:42:05',
        run_id: '8c8bc354',
        institute: 'SWx TREC'
    }
];

describe('RunSelectorComponent', () => {
    let component: RunSelectorComponent;
    let fixture: ComponentFixture<RunSelectorComponent>;

    beforeEach(async() => {
        await TestBed.configureTestingModule({
            declarations: [
                RunSelectorComponent
            ],
            imports: [
                BrowserAnimationsModule,
                MaterialModule
            ]
        })
    .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(RunSelectorComponent);
        component = fixture.componentInstance;
        component.catalog = catalog;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
