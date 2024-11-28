import { Test, TestingModule } from '@nestjs/testing';
import { AppResolver } from './appResolver';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppResolver;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppResolver],
      providers: [AppService],
    }).compile();

    appController = app.get<AppResolver>(AppResolver);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });
});
