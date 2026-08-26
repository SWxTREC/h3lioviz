import { SelectionModel } from '@angular/cdk/collections';
import {
    AfterViewInit,
    Component,
    DestroyRef,
    ElementRef,
    EventEmitter,
    inject,
    Input,
    OnChanges,
    OnInit,
    Output,
    SimpleChanges,
    ViewChild

} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatDatepicker } from '@angular/material/datepicker';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { cloneDeep } from 'lodash';
import moment from 'moment';
import { BehaviorSubject } from 'rxjs';
import { IModelMetadata } from 'src/app/models';

@Component({
    selector: 'swt-run-selector',
    templateUrl: './run-selector.component.html',
    styleUrls: [ './run-selector.component.scss' ],
    standalone: false
})
export class RunSelectorComponent implements AfterViewInit, OnInit, OnChanges {
    destroyRef = inject( DestroyRef );

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild('runDateInput') runDateInput: ElementRef<HTMLInputElement>;
    @ViewChild('runDatepicker') runDatepicker: MatDatepicker<moment.Moment>;

    @Input() catalog: IModelMetadata[];
    @Input() catalogLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
    @Input() screenDimensions: [number, number];
    @Input() selectedRun: IModelMetadata;
    @Output() updateRunSelection: EventEmitter<IModelMetadata> = new EventEmitter(undefined);
    catalogLoading = true;
    expandedRun: IModelMetadata = null;
    displayedColumns: string[];
    pageSize: number;
    pageSizeOptions = [ 5, 10, 25 ];
    pendingDateNavigation: moment.Moment = null;
    headers: { [ parameter: string ]: string };
    allMetadata: string[];
    selectedRunIndex: number;
    selection = new SelectionModel<IModelMetadata>(false, []);
    tableData: MatTableDataSource<IModelMetadata>;
    earliestRunDate: moment.Moment = null;
    maxRunDate: moment.Moment = moment.utc().add(1, 'day');

    ngOnChanges(changes: SimpleChanges) {
        if ( changes.catalogLoading$ && this.catalogLoading$ ) {
            this.catalogLoading$.pipe(
                takeUntilDestroyed( this.destroyRef )
            ).subscribe( loading => {
                this.catalogLoading = loading;
                if ( !loading && this.catalog?.length ) {
                    // wait a beat for last page to load before calculating earliest run date
                    setTimeout(() => {
                        this.earliestRunDate = this.getEarliestRunDate(this.catalog[this.catalog.length - 1]);
                        this.runPendingDateNavigation();
                    }, 0);
                }
            });
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
        this.paginator.pageIndex = this.selectedRunIndex >= 0 ? Math.floor( this.selectedRunIndex / this.paginator.pageSize ) : 0;
        this.tableData.paginator = this.paginator;
    }

    goToPageWithDate(dateValue: moment.Moment) {
        this.expandedRun = null;
        if ( !dateValue ) {
            return;
        }

        if ( this.catalogLoading || !this.paginator || !this.tableData ) {
            this.pendingDateNavigation = dateValue.clone();
            return;
        }

        this.pendingDateNavigation = null;

        const selectedTimestamp = dateValue.valueOf();
        if ( selectedTimestamp === null ) {
            return;
        }

        const sortedData = cloneDeep( this.tableData.data );

        const closestEntry = sortedData.reduce(
            (aggregator, run, index) => {
                const runTimestamp = moment.utc(run.creation ?? run.rundate_cal).valueOf();
                if (runTimestamp == null) {
                    return aggregator;
                }

                const newDistance = Math.abs(runTimestamp - selectedTimestamp);

                if (newDistance < aggregator.distance) {
                    return { index, distance: newDistance };
                }

                return aggregator;
            },
            { index: -1, distance: Number.POSITIVE_INFINITY }
        );
        const closestIndex = closestEntry.index;
        if ( closestIndex < 0 || this.paginator.pageSize <= 0 ) {
            return;
        }

        const maxPageIndex = Math.max( Math.ceil( sortedData.length / this.paginator.pageSize ), 0 );
        // navigate to the page that contains the closest run to the selected date
        this.paginator.pageIndex = Math.min( Math.floor( closestIndex / this.paginator.pageSize ), maxPageIndex );
        // this forces the paginator to update the view after changing the pageIndex
        this.paginator._changePageSize( this.paginator.pageSize );
        document.querySelector('.mdc-data-table__table')?.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }

    getEarliestRunDate(run: IModelMetadata): moment.Moment {
        const runDate = run?.creation ?? run?.rundate_cal;
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
            document.querySelector('.mdc-data-table__table')?.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }

    resetDatepicker(): void {
        this.runDatepicker.select(null);
        this.runDateInput.nativeElement.value = '';
    }

    runPendingDateNavigation(): void {
        if ( this.catalogLoading || !this.pendingDateNavigation || !this.paginator || !this.tableData ) {
            return;
        }

        const pendingDate = this.pendingDateNavigation.clone();
        this.pendingDateNavigation = null;
        this.goToPageWithDate(pendingDate);
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
