import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { IModelMetadata } from 'src/app/models';
import { CatalogService } from 'src/app/services';

@Component({
    selector: 'swt-run-selector-dialog',
    templateUrl: './run-selector-dialog.component.html',
    styleUrls: ['./run-selector-dialog.component.scss'],
    standalone: false
})
export class RunSelectorDialogComponent implements OnInit {
    previousSelection: IModelMetadata;

    constructor(
        public dialogRef: MatDialogRef<RunSelectorDialogComponent>,
        @Inject(MAT_DIALOG_DATA)
        public data: { selectedRun: IModelMetadata; catalog: IModelMetadata[]; screenDimensions: [number, number] },
        private _catalogService: CatalogService
    ) {}

    ngOnInit(): void {
        this.previousSelection = this.data.selectedRun;
    }

    updateRunSelection( runInfo: IModelMetadata ) {
        this.data.selectedRun = runInfo;
    }
}

