import { MarketplaceService } from '../src/marketplace/marketplace.service';
describe('MarketplaceService', () => {
  it('calculates publisher fee', () => {
    const service = new MarketplaceService();
    expect(service.getPublisherFee(100)).toBe(10);
  });
  it('creates checkout session (stub)', async () => {
    const service = new MarketplaceService();
    const session = await service.createCheckoutSession('prod1', 'buyer1', 20);
    expect(session.url).toContain('https://');
  });
});import { MarketplaceService } from '../src/marketplace/marketplace.service';
describe('MarketplaceService', () => {
  it('calculates publisher fee', () => {
    const service = new MarketplaceService();
    expect(service.getPublisherFee(100)).toBe(10);
  });
  it('creates checkout session (stub)', async () => {
    const service = new MarketplaceService();
    const session = await service.createCheckoutSession('prod1', 'buyer1', 20);
    expect(session.url).toContain('https://');
  });
});
