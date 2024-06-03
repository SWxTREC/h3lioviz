// This file is required by karma.conf.js and loads recursively all the .spec and framework files

/* tslint:disable */
import 'zone.js/dist/zone-testing';
import { getTestBed } from '@angular/core/testing';
import {
    BrowserDynamicTestingModule,
    platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing';

if ( !window.global ) {
    (window as any).global = {};
}

// First, initialize the Angular testing environment.
getTestBed().initTestEnvironment(
    BrowserDynamicTestingModule,
    platformBrowserDynamicTesting()
);
