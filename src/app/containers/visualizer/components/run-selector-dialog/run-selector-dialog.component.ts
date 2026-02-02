import { Component, inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { IModelMetadata } from 'src/app/models';
import { CatalogService } from 'src/app/services';

@Component({
    selector: 'swt-run-selector-dialog',
    templateUrl: './run-selector-dialog.component.html',
    styleUrls: [ './run-selector-dialog.component.scss' ],
    standalone: false
})
export class RunSelectorDialogComponent implements OnInit {
    dialogRef = inject<MatDialogRef<RunSelectorDialogComponent>>(MatDialogRef);
    data = inject<{
        selectedRun: IModelMetadata;
        catalog: IModelMetadata[];
        screenDimensions: [
            number,
            number
        ];
    }>(MAT_DIALOG_DATA);
    private _catalogService = inject(CatalogService);

    previousSelection: IModelMetadata;

    ngOnInit(): void {
        this.previousSelection = this.data.selectedRun;
    }

    updateRunSelection( runInfo: IModelMetadata ) {
        this.data.selectedRun = runInfo;
    }
}

