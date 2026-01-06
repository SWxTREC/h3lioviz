import { animate, state, style, transition, trigger } from '@angular/animations';
import { SelectionModel } from '@angular/cdk/collections';
import { AfterViewInit, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
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
export class RunSelectorComponent implements AfterViewInit, OnInit, OnChanges {
    @ViewChild(MatSort) sort: MatSort;
    @ViewChild(MatPaginator) paginator: MatPaginator;

    @Input() catalog: IModelMetadata[];
    @Input() selectedRun: IModelMetadata;
    @Output() updateRunSelection: EventEmitter<IModelMetadata> = new EventEmitter(undefined);
    expandedRun: IModelMetadata;
    displayedColumns: string[];
    headers: { [ parameter: string ]: string };
    allMetadata: string[];
    selection = new SelectionModel<IModelMetadata>(false, []);
    tableData: MatTableDataSource<IModelMetadata>;

    ngOnChanges(changes: SimpleChanges) {
        if ( changes['catalog'] && this.catalog?.length ) {
            this.initDataSource();
        }
    }

    ngOnInit() {
        this.initDataSource();
        this.headers = {
            program: 'Model',
            institute: 'Institute',
            rundate_cal: 'Approx. event date',
            cme_cone_half_angle: 'Cone half angle',
            cme_latitude: 'Latitude',
            cme_longitude: 'Longitude',
            cme_radial_velocity: '  Radial velocity',
            cme_time: 'Time at 21.5Rs',
            creation: 'Time of run',
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
            'creation',
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
        this.tableData.paginator = this.paginator;
    }

    initDataSource() {
        if ( this.selectedRun ) {
            const selectedRun = this.catalog.find( run => run['run_id'] === this.selectedRun.run_id);
            if ( selectedRun ) {
                this.selection.select( selectedRun );
            }
        }

        this.tableData =  new MatTableDataSource<IModelMetadata>(this.catalog);
        if ( this.sort ) {
            this.tableData.sort = this.sort;
        }
        if ( this.paginator ) {
            this.tableData.paginator = this.paginator;
        }

        this.allMetadata = Object.keys(this.catalog[0]).sort();
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
