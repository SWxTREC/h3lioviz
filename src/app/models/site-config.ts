import { IPlotParams } from 'scicharts';

import {
    COLOR_FORM_DEFAULT_VALUES,
    CONTOUR_FORM_DEFAULT_VALUES,
    DEFAULT_COLOR_RANGES,
    DEFAULT_COLORMAPS,
    DEFAULT_CONTOUR_RANGES,
    DEFAULT_CONTROL_PANEL_EXPANSIONS,
    DEFAULT_OPACITIES,
    IColormapInfo,
    IColorSettings,
    IContourSettings,
    IControlPanel,
    ILayers,
    LAYER_FORM_DEFAULT_VALUES
} from './control-panel';
import { DEFAULT_PLOT_CONFIG } from './plots';

// this object holds all the application state
export interface ISiteConfig {
    colormaps: { [parameter: string]: IColormapInfo };
    colorRanges: { [parameter: string]: [ number, number ] };
    colorSettings: IColorSettings;
    contourRanges:  { [parameter: string]: [ number, number ] };
    contourSettings: IContourSettings;
    cPanelExpansions: IControlPanel;
    layers: ILayers;
    legendCards?: boolean;
    opacities:  { [parameter: string]: [ number, number ] };
    plots: IPlotParams[];
    runId: string;
    timeIndexMap: { [parameter: string]: number };
    // visualization dimensions
    vDimensions: [ number, number ];
    vPanelSettings: [ boolean, boolean ];
    // window dimensions
    wDimensions: [ number, number ];
    zoomState: 'on' | 'off';
}

export enum ConfigLabels {
    colormaps = 'colormaps',
    colorRanges = 'colorRanges',
    colorSettings = 'colorSettings',
    contourRanges = 'contourRanges',
    contourSettings = 'contourSettings',
    cPanelExpansions = 'cPanelExpansions',
    layers = 'layers',
    legendCards = 'legendCards',
    opacities = 'opacities',
    plots = 'plots',
    runId = 'runId',
    timeIndexMap = 'timeIndexMap',
    vDimensions = 'vDimensions',
    vPanelSettings = 'vPanelSettings',
    wDimensions = 'wDimensions',
    zoomState = 'zoomState'
}

export const DEFAULT_SITE_CONFIG: ISiteConfig = {
    colormaps: DEFAULT_COLORMAPS,
    colorRanges: DEFAULT_COLOR_RANGES,
    colorSettings: COLOR_FORM_DEFAULT_VALUES,
    contourRanges: DEFAULT_CONTOUR_RANGES,
    contourSettings: CONTOUR_FORM_DEFAULT_VALUES,
    cPanelExpansions: DEFAULT_CONTROL_PANEL_EXPANSIONS,
    layers: LAYER_FORM_DEFAULT_VALUES,
    legendCards: false,
    opacities: DEFAULT_OPACITIES,
    plots: DEFAULT_PLOT_CONFIG,
    runId: undefined,
    timeIndexMap: {},
    vDimensions: [ undefined, undefined ],
    vPanelSettings: [ false, true ],
    wDimensions: [ undefined, undefined ],
    zoomState: 'on'
};
