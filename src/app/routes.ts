import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        loadChildren: () => import( './containers/visualizer/visualizer.module').then( m => m.VisualizerModule )
    }, {
        path: 'docs',
        loadChildren: () => import( './containers/docs/docs.module').then( m => m.DocsModule )
    }, {
        path: '**',
        redirectTo: ''
    }
];
