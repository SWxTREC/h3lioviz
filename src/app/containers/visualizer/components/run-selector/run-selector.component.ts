import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { MatSelectChange } from '@angular/material/select';
import { IModelMetadata } from 'src/app/models';

@Component({
    selector: 'swt-run-selector',
    templateUrl: './run-selector.component.html',
    styleUrls: [ './run-selector.component.scss' ]
})
export class RunSelectorComponent implements OnChanges {
    @Input() catalog: IModelMetadata[];
    @Input() runId: string;
    @Output() updateRunId: EventEmitter<string> = new EventEmitter(undefined);
    resolutionArray: string[];

    ngOnChanges() {
        const findResolution: string[] = this.catalog.map( (catalogEntry: IModelMetadata) => {
            // since resolution is not an official part of the metadata, this uses a string in the 'code'
            // property to determine resolution, if available. This is not robust, but works for most runs,
            // until the metadata is standardized
            const resolution = catalogEntry.code.includes('low') ?
                'low' :
                catalogEntry.code.includes('med') ?
                'med' :
                undefined;
            return resolution;
        } );
        this.resolutionArray = findResolution;
    }

    updateSelection( event: MatSelectChange ) {
        this.updateRunId.emit( event.value );
    }
}
