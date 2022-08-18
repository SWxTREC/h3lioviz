import { Component, Inject, Input, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { IModelMetadata } from 'src/app/models';
import { CatalogService } from 'src/app/services';

@Component({
    selector: 'swt-run-selector',
    templateUrl: './run-selector.component.html',
    styleUrls: [ './run-selector.component.scss' ]
})
export class RunSelectorComponent implements OnInit {
    catalog: IModelMetadata[];
    previousSelection: string;

    constructor(
        public dialogRef: MatDialogRef<RunSelectorComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { runId: string; idSelected: boolean },
        private _catalogService: CatalogService
    ) {
        this._catalogService.catalog$.subscribe( catalog => {
            if ( catalog ) {
                this.catalog = catalog;
                this.data.runId = this.data.runId || catalog[0]['run_id'];
            }
        });
    }
    
    ngOnInit(): void {
        this.previousSelection = this.data.runId;
    }

    onCancel(): void {
        this.dialogRef.close();
    }
}

