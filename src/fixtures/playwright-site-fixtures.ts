import { test as base } from "@playwright/test";
import { PlaywrightSiteActions } from "../actions/ui/playwright-site-actions";


export const test = base.extend({
    playwrightSiteActions: async({page}, use) => {
        await use(new PlaywrightSiteActions(page))
    }
});

export { expect } from "@playwright/test";
