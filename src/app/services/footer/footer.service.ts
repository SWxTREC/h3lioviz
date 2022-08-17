import { Injectable } from '@angular/core';

/**
 * The visualization page uses a different footer that the rest of the site, in order to maximize the vertical space available for the
 * page content and make it easier to restrict the page to 100vh.
 * This service stores common footer data, and allows for the data page to control the visibility of the default footer.
 */
@Injectable({
    providedIn: 'root'
})
export class FooterService {
    copyright = '';
    showGlobalFooter = true;
}
