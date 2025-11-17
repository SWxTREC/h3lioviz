import { animate, state, style, transition, trigger } from '@angular/animations';
import { SelectionModel } from '@angular/cdk/collections';
import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { IModelMetadata } from 'src/app/models';

@Component({selector: 'swt-run-selector',
    templateUrl: './run-selector.component.html',
    styleUrls: [ './run-selector.component.scss' ],
    animations: [
        trigger('detailExpand', [
            state('collapsed, void', style({height: '0px', minHeight: '0'})),
            state('expanded', style({height: '*'})),
            transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
            transition('expanded <=> void', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)'))
        ])
    ] })
export class RunSelectorComponent implements AfterViewInit, OnInit {
    @ViewChild(MatSort) sort: MatSort;

    @Input() catalog: IModelMetadata[];
    @Input() selectedRun: IModelMetadata;
    @Output() updateRunSelection: EventEmitter<IModelMetadata> = new EventEmitter(undefined);
    expandedRun: IModelMetadata;
    displayedColumns: string[];
    headers: { [ parameter: string ]: string };
    allMetadata: string[];
    selection = new SelectionModel<IModelMetadata>(false, []);
    tableData: any;

    ngOnInit() {
        if ( this.selectedRun ) {
            const selectedRun = this.catalog.find( run => run['run_id'] === this.selectedRun.run_id);
            this.selection.select( selectedRun );
        }

        this.tableData =  new MatTableDataSource<IModelMetadata>(this.catalog);
        this.allMetadata = Object.keys(this.catalog[0]).sort();
        this.headers = {
            program: 'Model',
            institute: 'Institute',
            rundate_cal: 'Time of run',
            cme_cone_half_angle: 'Cone half angle',
            cme_latitude: 'Latitude',
            cme_longitude: 'Longitude',
            cme_radial_velocity: '  Radial velocity',
            cme_time: 'Time at Sun (21.5Rs)',
            creation: 'Date of run creation',
            resolution: 'Resolution',
            cordata: 'Coronal data',
            corona: 'WSA version',
            observatory: 'Observatory data',
            boundary: 'Boundary',
            parameters: 'Parameters',
            project: 'Project',
            run: 'Run',
            version: 'Model version',
            run_id: 'Run id',
            more: 'More info'
        };
        this.displayedColumns = [
            'rundate_cal',
            'run_id',
            'cme_time',
            'cme_cone_half_angle',
            'cme_latitude',
            'cme_longitude',
            'cme_radial_velocity',
            'more'
        ];
    }

    ngAfterViewInit() {
        this.tableData.sort = this.sort;
    }

    newSelection( run: IModelMetadata ) {
        this.selection.toggle(run);
        if ( this.selection.isSelected( run ) ) {
            this.updateRunSelection.emit( run );
        } else {
            this.updateRunSelection.emit( null );
        }
    }
}
