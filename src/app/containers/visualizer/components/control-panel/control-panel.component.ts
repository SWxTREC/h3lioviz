import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'swt-control-panel',
    templateUrl: './control-panel.component.html',
    styleUrls: [ './control-panel.component.scss' ]
})
export class ControlPanelComponent implements OnInit {
    @Input() pvView: any;

    constructor() { }

    ngOnInit(): void {
    }

}
