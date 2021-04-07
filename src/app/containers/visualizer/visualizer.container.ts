import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import vtkConeSource from 'vtk.js/Sources/Filters/Sources/ConeSource';
import vtkActor from 'vtk.js/Sources/Rendering/Core/Actor';
import vtkMapper from 'vtk.js/Sources/Rendering/Core/Mapper';
import vtkFullScreenRenderWindow from 'vtk.js/Sources/Rendering/Misc/FullScreenRenderWindow';

@Component({
    selector: 'swt-visualizer',
    templateUrl: './visualizer.container.html',
    styleUrls: [ './visualizer.container.scss' ]
})
export class VisualizerComponent implements AfterViewInit  {
    @ViewChild('content', { read: ElementRef }) content: ElementRef;

    fullscreenRenderWindow = null;


    constructor(
    ) {}

    ngAfterViewInit(): void {
        this.fullscreenRenderWindow = vtkFullScreenRenderWindow.newInstance();
        const cone = vtkConeSource.newInstance();
        const actor = vtkActor.newInstance();
        const mapper = vtkMapper.newInstance();

        actor.setMapper(mapper);
        mapper.setInputConnection(cone.getOutputPort());

        const renderer = this.fullscreenRenderWindow.getRenderer();
        renderer.addActor(actor);
        renderer.resetCamera();

        const renderWindow = this.fullscreenRenderWindow.getRenderWindow();
        renderWindow.render();
    }
}
