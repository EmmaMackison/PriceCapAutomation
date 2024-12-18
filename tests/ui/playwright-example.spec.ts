import { test } from "../../src/fixtures/playwright-site-fixtures"
import { annotate } from '../../src/utils/shared/annotate';

test("The Playwright site", async({ playwrightSiteActions, page }) => {
    annotate('Given I visit the Playwright website')
    await page.goto('https://playwright.dev/')

    annotate('Then I select the community page and verify the correct header displays')
    await playwrightSiteActions.visitCommunityPage()
})