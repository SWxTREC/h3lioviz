import { Routes } from '@angular/router';
import { FooterMode } from 'lasp-footer';

export const routes: Routes = [
    {
        path: '',
        title: 'H3lioViz: Interactive 3D Heliosphere Visualizer',
        loadChildren: () => import( './containers/home/home.module').then( m => m.HomeModule )
    }, {
        path: 'docs',
        title: 'Documentation | H3lioViz',
        loadChildren: () => import( './containers/docs/docs.module').then( m => m.DocsModule )
    }, {
        // canActivate: [ AuthGuard ],
        data: { footer: FooterMode.MINIMAL },
        title: 'Visualizer | H3lioViz',
        loadChildren: () => import( './containers/visualizer/visualizer.module').then( m => m.VisualizerModule ),
        path: 'visualizer'
    }, {
        path: '**',
        redirectTo: ''
    }
];
