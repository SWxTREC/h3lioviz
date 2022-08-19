import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatSelectChange } from '@angular/material/select';
import { IModelMetadata } from 'src/app/models';

@Component({
    selector: 'swt-run-selector',
    templateUrl: './run-selector.component.html',
    styleUrls: [ './run-selector.component.scss' ]
})
export class RunSelectorComponent implements OnInit {
    @Input() catalog: IModelMetadata[];
    @Input() runId: string;
    @Output() updateRunId: EventEmitter<string> = new EventEmitter(undefined);

    constructor() { }

    ngOnInit(): void {
    }

    updateSelection( event: MatSelectChange ) {
        this.updateRunId.emit( event.value );
    }

}
