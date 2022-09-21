import { Routes } from '@angular/router';
import { FooterMode } from 'lasp-footer';

export const routes: Routes = [
    {
        path: '',
        loadChildren: () => import( './containers/home/home.module').then( m => m.HomeModule )
    }, {
        path: 'docs',
        loadChildren: () => import( './containers/docs/docs.module').then( m => m.DocsModule )
    }, {
        // canActivate: [ AuthGuard ],
        data: { footer: FooterMode.MINIMAL },
        loadChildren: () => import( './containers/visualizer/visualizer.module').then( m => m.VisualizerModule ),
        path: 'visualizer'
    }, {
        path: '**',
        redirectTo: ''
    }
];
