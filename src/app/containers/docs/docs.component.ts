import { Component, OnInit } from '@angular/core';
import { IKeyboard, KEYBOARD_SHORTCUTS } from 'src/app/models';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'swt-docs',
    templateUrl: './docs.component.html',
    styleUrls: [ './docs.component.scss' ]
})
export class DocsComponent implements OnInit {
    keyboardShortcuts: IKeyboard[] = KEYBOARD_SHORTCUTS;
    isDev = environment.dev === true;
    moreInfoHref = `https://${this.isDev ? 'dev' : ''}.swx-trec.com`;

    constructor() { }

    ngOnInit() {
    }

}
