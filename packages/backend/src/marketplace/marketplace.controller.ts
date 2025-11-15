import { Controller, Post, Body, Req } from '@nestjs/common';
import { MarketplaceService } from './marketplace.service';

@Controller('marketplace')
export class MarketplaceController {
  constructor(private readonly service: MarketplaceService) {}

  @Post('checkout')
  async checkout(@Body() body: { productId: string; buyerId: string; price: number }) {
    return this.service.createCheckoutSession(body.productId, body.buyerId, body.price);
  }

  @Post('webhook')
  async webhook(@Req() req) {
    // Stripe webhook event
    return this.service.handleWebhook(req.body);
  }
}import { Controller, Post, Body, Req } from '@nestjs/common';
import { MarketplaceService } from './marketplace.service';

@Controller('marketplace')
export class MarketplaceController {
  constructor(private readonly service: MarketplaceService) {}

  @Post('checkout')
  async checkout(@Body() body: { productId: string; buyerId: string; price: number }) {
    return this.service.createCheckoutSession(body.productId, body.buyerId, body.price);
  }

  @Post('webhook')
  async webhook(@Req() req) {
    // Stripe webhook event
    return this.service.handleWebhook(req.body);
  }
}
