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
    institutionMap = {
        '3a543571': 'CCMC',
        '7d7b81aa': 'CCMC',
        '8c8bc354': 'SWx TREC',
        aa53eb15: 'CCMC',
        adf481bd: 'CCMC',
        c753358e: 'CCMC',
        ced4d677: 'CCMC',
        d9bcc5cc: 'CCMC'
    };

    updateSelection( event: MatSelectChange ) {
        this.updateRunId.emit( event.value );
    }
}
