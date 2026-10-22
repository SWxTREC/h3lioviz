import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
    selector: 'swt-run-error-dialog',
    templateUrl: './run-error-dialog.component.html',
    styleUrls: [ './run-error-dialog.component.scss' ],
    standalone: false
})
export class RunErrorDialogComponent {
    data = inject<{ message: string }>(MAT_DIALOG_DATA);
}
