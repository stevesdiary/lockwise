import { ElectricityProvider } from '../types/electricity.types';
import { VTPassProvider } from './vtpass.provider';
import { BuyPowerProvider } from './buypower.provider';
import { BaxiProvider } from './baxi.provider';

class ProviderRegistry {
  private providers: ElectricityProvider[] = [];

  constructor() {
    this.providers = [
      new VTPassProvider(),
      new BuyPowerProvider(),
      new BaxiProvider(),
    ].sort((a, b) => a.priority - b.priority);
  }

  /** Returns providers sorted by priority, optionally filtering to only available ones */
  async getAvailable(): Promise<ElectricityProvider[]> {
    const checks = await Promise.allSettled(
      this.providers.map(async (p) => ({ provider: p, available: await p.isAvailable() }))
    );

    return checks
      .filter((r): r is PromiseFulfilledResult<{ provider: ElectricityProvider; available: boolean }> =>
        r.status === 'fulfilled' && r.value.available
      )
      .map((r) => r.value.provider);
  }

  /** Returns all registered providers in priority order (skip availability check) */
  getAll(): ElectricityProvider[] {
    return this.providers;
  }

  getByName(name: string): ElectricityProvider | undefined {
    return this.providers.find((p) => p.name === name);
  }
}

export const providerRegistry = new ProviderRegistry();
