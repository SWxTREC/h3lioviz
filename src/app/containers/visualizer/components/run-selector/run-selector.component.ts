import { SelectionModel } from '@angular/cdk/collections';
import {
    AfterViewInit,
    Component,
    ElementRef,
    EventEmitter,
    Input,
    OnChanges,
    OnInit,
    Output,
    SimpleChanges,
    ViewChild

} from '@angular/core';
import { MatDatepicker } from '@angular/material/datepicker';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { cloneDeep } from 'lodash';
import moment from 'moment';
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
    @ViewChild('runDateInput') runDateInput: ElementRef<HTMLInputElement>;
    @ViewChild('runDatepicker') runDatepicker: MatDatepicker<moment.Moment>;

    @Input() catalog: IModelMetadata[];
    @Input() catalogLoading = true;
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
    earliestRunDate: moment.Moment;
    maxRunDate: moment.Moment = moment.utc().add(1, 'day');

    ngOnChanges(changes: SimpleChanges) {
        if ( !this.catalogLoading ) {
            this.earliestRunDate = this.getEarliestRunDate(this.catalog[this.catalog.length - 1]);
        }
        if ( changes.catalog && this.catalog?.length ) {
            if ( !this.tableData ) {
                this.initDataSource();
            } else {
                this.tableData.data = cloneDeep(this.catalog);
                this.allMetadata = Object.keys(this.catalog[0]).sort();
                this.syncPaginator();
            }
        }
    }

    ngOnInit() {
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

    centerResultsAroundDate(dateValue: moment.Moment) {
        if ( !this.paginator || !this.tableData || !dateValue ) {
            return;
        }

        const selectedTimestamp = dateValue.valueOf();
        if ( selectedTimestamp === null ) {
            return;
        }

        const sortedData = cloneDeep( this.tableData.data );
        let closestIndex = -1;
        let smallestDelta = Number.POSITIVE_INFINITY;

        sortedData.forEach((run, index) => {
            const runTimestamp = moment.utc(run.creation).valueOf() ?? moment.utc(run.rundate_cal).valueOf();
            if ( runTimestamp === null ) {
                return;
            }

            const delta = Math.abs( runTimestamp - selectedTimestamp );
            if ( delta < smallestDelta ) {
                smallestDelta = delta;
                closestIndex = index;
            }
        });

        if ( closestIndex < 0 || this.paginator.pageSize <= 0 ) {
            return;
        }

        const centeredStartIndex = Math.max( closestIndex - Math.floor( this.paginator.pageSize / 2 ), 0 );
        const maxPageIndex = Math.max( Math.ceil( sortedData.length / this.paginator.pageSize ) - 1, 0 );
        // navigate to the page that contains the closest run to the selected date, centering it in the page if possible
        this.paginator.pageIndex = Math.min( Math.floor( centeredStartIndex / this.paginator.pageSize ), maxPageIndex );
        // this forces the paginator to update the view after changing the pageIndex
        this.paginator._changePageSize( this.paginator.pageSize );
        this.expandedRun = null;
    }

    getEarliestRunDate(run: IModelMetadata): moment.Moment {
        const runDate = run?.rundate_cal ?? run?.creation;
        if ( !runDate ) {
            return null;
        }
        return moment.utc(runDate);
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
        // Arrow clicks (next/prev/first/last) change pageIndex
        if (event.previousPageIndex !== undefined && event.pageIndex !== event.previousPageIndex) {
            this.resetDatepicker();
        }
    }

    resetDatepicker(): void {
        this.runDatepicker.select(null);
        this.runDateInput.nativeElement.value = '';
    }

    syncPaginator() {
        if ( this.paginator ) {
            const maxPageIndex = Math.max( Math.ceil( this.catalog.length / this.paginator.pageSize ) - 1, 0 );
            this.paginator.pageIndex = Math.min( this.paginator.pageIndex, maxPageIndex );
            this.paginator._changePageSize( this.paginator.pageSize );
        }
    }

    toggleExpandedRun( run: IModelMetadata ) {
        this.expandedRun = this.expandedRun?.run_id === run.run_id ? null : run;
    }

    trackByRunId(index: number, run: IModelMetadata): string {
        return run.run_id;
    }
}
