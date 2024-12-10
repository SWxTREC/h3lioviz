import { animate, state, style, transition, trigger } from '@angular/animations';
import { SelectionModel } from '@angular/cdk/collections';
import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
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
    @Input() runId: string;
    @Output() updateRunId: EventEmitter<string> = new EventEmitter(undefined);
    expandedRun: IModelMetadata;
    displayedColumns: string[];
    headers: { [ parameter: string ]: string };
    allMetadata: string[];
    selection = new SelectionModel<IModelMetadata>(false, []);
    tableData: any;

    ngOnInit() {
        if ( this.runId ) {
            const selectedRun = this.catalog.find( run => run['run_id'] === this.runId);
            this.selection.select( selectedRun );
        }
        // add inferred resolution to the metadata
        const formattedCatalog = this.catalog.map( (catalogEntry: IModelMetadata) => {
            catalogEntry.resolution = this.getResolution( catalogEntry.code );
            return catalogEntry;
        });
        this.tableData =  new MatTableDataSource<IModelMetadata>(formattedCatalog);
        this.allMetadata = Object.keys(formattedCatalog[0]);
        this.headers = {
            program: 'Model',
            institute: 'Institute',
            rundate_cal: 'Date of event',
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
            'program',
            'version',
            'institute',
            'rundate_cal',
            'creation',
            'resolution',
            'cordata',
            'observatory',
            'corona',
            'more'
        ];

    }

    ngAfterViewInit() {
        this.tableData.sort = this.sort;
    }

    getResolution( codeString: string ) {
        const resolution = codeString.includes('low') ?
            'low' :
            codeString.includes('med') ?
            'med' :
            undefined;
        return resolution;
    }

    newSelection( run: IModelMetadata ) {
        this.selection.toggle(run);
        const runId = this.selection.selected[0]?.run_id;
        this.updateRunId.emit( runId );
    }
}
