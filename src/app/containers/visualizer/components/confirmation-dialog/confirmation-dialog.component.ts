import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'swt-confirmation-dialog',
    templateUrl: './confirmation-dialog.component.html',
    styleUrls: [ './confirmation-dialog.component.scss' ],
    standalone: false
})
export class ConfirmationDialogComponent {
    dialogRef = inject<MatDialogRef<ConfirmationDialogComponent>>(MatDialogRef);
    data = inject<{
        title: string;
        confirmButtonText: string;
    }>(MAT_DIALOG_DATA);
}

