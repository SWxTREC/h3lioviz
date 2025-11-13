import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { IModelMetadata } from 'src/app/models';
import { CatalogService } from 'src/app/services';

@Component({
    selector: 'swt-run-selector-dialog',
    templateUrl: './run-selector-dialog.component.html',
    styleUrls: [ './run-selector-dialog.component.scss' ]
})
export class RunSelectorDialogComponent implements OnInit {
    previousSelection: IModelMetadata;

    constructor(
        public dialogRef: MatDialogRef<RunSelectorDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { selectedRun: IModelMetadata; catalog: IModelMetadata[] },
        private _catalogService: CatalogService
    ) {}

    ngOnInit(): void {
        this.previousSelection = this.data.selectedRun;
    }

    updateRunSelection( value: IModelMetadata ) {
        this.data.selectedRun = value;
    }
}

