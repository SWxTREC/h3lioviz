import { IPlotParamsAll } from 'scicharts';

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

// this object holds all the application state
export interface ISiteConfig {
    colormaps: { [parameter: string]: IColormapInfo };
    colorRanges: { [parameter: string]: [ number, number ] };
    colorSettings: IColorSettings;
    contourRanges:  { [parameter: string]: [ number, number ] };
    contourSettings: IContourSettings;
    cPanelExpansions: IControlPanel;
    layers: ILayers;
    opacities:  { [parameter: string]: [ number, number ] };
    vPanelSettings: [ boolean, boolean ];
    plots?: IPlotParamsAll;
    runId: string;
    timeTicks: number[];
    timeIndexMap: { [parameter: string]: number };
    vizDimensions: [ number, number ];
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
    opacities = 'opacities',
    vPanelSettings = 'vPanelSettings',
    plots = 'plots',
    runId = 'runId',
    timeTicks = 'timeTicks',
    timeIndexMap = 'timeIndexMap',
    vizDimensions = 'vizDimensions',
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
    opacities: DEFAULT_OPACITIES,
    vPanelSettings: [ false, true ],
    runId: undefined,
    timeTicks: [],
    timeIndexMap: {},
    vizDimensions: [ undefined, undefined ],
    zoomState: 'on'
};
