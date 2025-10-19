import { Test, TestingModule } from '@nestjs/testing';
import { ModuleMetadata } from '@nestjs/common';

/**
 * Builder for creating test modules with consistent setup
 */
export class TestModuleBuilder {
  private providers: any[] = [];
  private imports: any[] = [];
  private controllers: any[] = [];

  withProvider(provider: any): this {
    this.providers.push(provider);
    return this;
  }

  withMockProvider(token: string, mockValue: any): this {
    this.providers.push({
      provide: token,
      useValue: mockValue,
    });
    return this;
  }

  withImport(module: any): this {
    this.imports.push(module);
    return this;
  }

  withController(controller: any): this {
    this.controllers.push(controller);
    return this;
  }

  async build(): Promise<TestingModule> {
    const moduleMetadata: ModuleMetadata = {
      providers: this.providers,
      imports: this.imports,
      controllers: this.controllers,
    };

    return Test.createTestingModule(moduleMetadata).compile();
  }
}

/**
 * Creates a test module builder with common setup
 */
export function createTestModuleBuilder(): TestModuleBuilder {
  return new TestModuleBuilder();
}
