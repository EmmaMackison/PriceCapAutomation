import { request } from '@playwright/test';

export class CocktailApi {
  static async getRandomCocktail() {
    const context = await request.newContext();
    const response = await context.get(
      'https://www.thecocktaildb.com/api/json/v1/1/random.php'
    );
    return response;
  }
}
