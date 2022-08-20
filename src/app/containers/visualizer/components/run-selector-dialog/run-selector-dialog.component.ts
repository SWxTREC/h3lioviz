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
    previousSelection: string;

    constructor(
        public dialogRef: MatDialogRef<RunSelectorDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { runId: string; catalog: IModelMetadata[] },
        private _catalogService: CatalogService
    ) {}
    
    ngOnInit(): void {
        this.previousSelection = this.data.runId;
    }

    onCancel(): void {
        this.dialogRef.close();
    }

    updateRunId( value: string ) {
        this.data.runId = value;
        this.previousSelection = undefined;
    }
}

