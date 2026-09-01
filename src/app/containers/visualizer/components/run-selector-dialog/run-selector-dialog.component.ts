import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { BehaviorSubject } from 'rxjs';
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
    private _destroyRef = inject( DestroyRef );
    data = inject<{
        catalog: IModelMetadata[];
        catalogLoading$: BehaviorSubject<boolean>;
        screenDimensions: [
            number,
            number
        ];
        selectedRun: IModelMetadata;
    }>(MAT_DIALOG_DATA);
    private _catalogService = inject(CatalogService);

    previousSelection: IModelMetadata;

    ngOnInit(): void {
        this.previousSelection = this.data.selectedRun;
        this._catalogService.catalog$.pipe(
            takeUntilDestroyed(this._destroyRef)
        ).subscribe( catalog => {
            if ( catalog ) {
                this.data.catalog = catalog;
            }
        });
    }

    updateRunSelection( runInfo: IModelMetadata ) {
        this.data.selectedRun = runInfo;
    }
}

