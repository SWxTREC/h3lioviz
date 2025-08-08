import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ChangelogComponent } from './components/changelog/changelog.component';
import { DocsComponent } from './docs.component';

const routes: Routes = [
    {
        path: '',
        component: DocsComponent
    },
    {
        path: 'changelog',
        component: ChangelogComponent
    }
];

@NgModule({
    imports: [ RouterModule.forChild(routes) ],
    exports: [ RouterModule ]
})
export class DocsRoutingModule { }
