import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatSelectChange } from '@angular/material/select';
import { IModelMetadata } from 'src/app/models';

@Component({
    selector: 'swt-run-selector',
    templateUrl: './run-selector.component.html',
    styleUrls: [ './run-selector.component.scss' ]
})
export class RunSelectorComponent {
    @Input() catalog: IModelMetadata[];
    @Input() runId: string;
    @Output() updateRunId: EventEmitter<string> = new EventEmitter(undefined);

    updateSelection( event: MatSelectChange ) {
        this.updateRunId.emit( event.value );
    }
}
