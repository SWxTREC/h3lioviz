import { SelectionModel } from '@angular/cdk/collections';
import { AfterViewInit, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { IModelMetadata } from 'src/app/models';

@Component({
    selector: 'swt-run-selector',
    templateUrl: './run-selector.component.html',
    styleUrls: [ './run-selector.component.scss' ],
    standalone: false
})
export class RunSelectorComponent implements AfterViewInit, OnInit, OnChanges {
    @ViewChild(MatSort) sort: MatSort;
    @ViewChild(MatPaginator) paginator: MatPaginator;

    @Input() catalog: IModelMetadata[];
    @Input() screenDimensions: [number, number];
    @Input() selectedRun: IModelMetadata;
    @Output() updateRunSelection: EventEmitter<IModelMetadata> = new EventEmitter(undefined);
    expandedRun: IModelMetadata = null;
    displayedColumns: string[];
    pageSize: number;
    pageSizeOptions = [ 5, 10, 25 ];
    headers: { [ parameter: string ]: string };
    allMetadata: string[];
    selectedRunIndex: number;
    selection = new SelectionModel<IModelMetadata>(false, []);
    tableData: MatTableDataSource<IModelMetadata>;

    ngOnChanges(changes: SimpleChanges) {
        if ( changes.catalog && this.catalog?.length ) {
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
        this.paginator.pageIndex = this.selectedRunIndex >= 0 ? Math.floor( this.selectedRunIndex / this.paginator.pageSize ) : 0;
        this.tableData.paginator = this.paginator;
    }

    initDataSource() {
        const storedPageSize = sessionStorage.getItem('runSelectorPageSize');
        this.pageSize = storedPageSize ? +storedPageSize : this.pageSizeOptions[1];
        if ( this.selectedRun ) {
            const selectedRun = this.catalog.find( run => run['run_id'] === this.selectedRun.run_id);
            this.selectedRunIndex = this.catalog.indexOf( selectedRun );
            if ( selectedRun ) {
                this.selection.select( selectedRun );
            }
        }

        this.tableData =  new MatTableDataSource<IModelMetadata>(this.catalog);
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

    paginationChange( event: PageEvent ) {
        sessionStorage.setItem('runSelectorPageSize', event.pageSize.toString());
        this.expandedRun = null;
    }

    toggleExpandedRun( run: IModelMetadata ) {
        this.expandedRun = this.expandedRun?.run_id === run.run_id ? null : run;
    }
}
