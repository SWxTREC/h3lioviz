import { Routes } from '@angular/router';

import { AuthGuard } from './guards/auth-guard.service';


export const routes: Routes = [
    {
        path: '',
        loadChildren: () => import( './containers/home/home.module').then( m => m.HomeModule )
    }, {
        path: 'docs',
        loadChildren: () => import( './containers/docs/docs.module').then( m => m.DocsModule )
    }, {
        path: 'visualizer',
        loadChildren: () => import( './containers/visualizer/visualizer.module').then( m => m.VisualizerModule ),
        canActivate: [ AuthGuard ]
    }, {
        path: '**',
        redirectTo: ''
    }
];
