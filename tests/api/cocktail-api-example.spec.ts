import { test, expect } from '@playwright/test';
import { CocktailApi } from '../../src/utils/api/cocktail-api';
import { annotate } from '../../src/utils/shared/annotate';

test('Get a random cocktail and assert 200 response', async ({}) => {
  annotate('Given I call the random cocktail endpoint');
  const randomCocktailResponse = await CocktailApi.getRandomCocktail();

  annotate('Then I expect a 200 response');
  expect(randomCocktailResponse.status()).toBe(200);

  annotate('And I expect a random cocktail to be in the response');
  const randomCocktailJson = await randomCocktailResponse.json();
  expect(randomCocktailJson.drinks[0].idDrink).toBeTruthy();
});
