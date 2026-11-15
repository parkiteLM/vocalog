const mockConfigure = jest.fn().mockResolvedValue(undefined);
const mockGetCustomerInfo = jest.fn();
const mockGetOfferings = jest.fn();
const mockPurchasePackage = jest.fn();
const mockRestorePurchases = jest.fn();

jest.mock('react-native-purchases', () => ({
  __esModule: true,
  default: {
    configure: (...args: any[]) => mockConfigure(...args),
    getCustomerInfo: () => mockGetCustomerInfo(),
    getOfferings: () => mockGetOfferings(),
    purchasePackage: (...args: any[]) => mockPurchasePackage(...args),
    restorePurchases: () => mockRestorePurchases(),
  },
}));

import {
  SubscriptionService,
  PRO_ENTITLEMENT,
  PRO_MONTHLY_PRICE,
  PRO_ANNUAL_PRICE,
} from '../src/data/services/SubscriptionService';

describe('SubscriptionService', () => {
  let service: SubscriptionService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new SubscriptionService();
  });

  describe('constants', () => {
    it('defines correct entitlement ID, monthly, and annual pricing', () => {
      expect(PRO_ENTITLEMENT).toBe('pro');
      expect(PRO_MONTHLY_PRICE).toBe('$3.49 / month');
      expect(PRO_ANNUAL_PRICE).toBe('$35.00 / year');
    });
  });

  describe('init', () => {
    it('skips configuration when placeholder API key is used', async () => {
      await service.init('appl_mock_api_key_placeholder');
      expect(mockConfigure).not.toHaveBeenCalled();
    });

    it('configures Purchases SDK when valid production API key is provided', async () => {
      await service.init('appl_prod_123456789');
      expect(mockConfigure).toHaveBeenCalledWith({ apiKey: 'appl_prod_123456789' });
    });
  });

  describe('isProSubscriber', () => {
    it('returns false by default when unconfigured and mock is off', async () => {
      const isPro = await service.isProSubscriber();
      expect(isPro).toBe(false);
    });

    it('returns true when mock Pro mode is enabled', async () => {
      service.setMockPro(true);
      const isPro = await service.isProSubscriber();
      expect(isPro).toBe(true);

      service.setMockPro(false);
      const isProAfter = await service.isProSubscriber();
      expect(isProAfter).toBe(false);
    });

    it('returns true when RevenueCat has active pro entitlement', async () => {
      await service.init('appl_live_key');
      mockGetCustomerInfo.mockResolvedValueOnce({
        entitlements: {
          active: {
            pro: { identifier: 'pro', isActive: true },
          },
        },
      });

      const isPro = await service.isProSubscriber();
      expect(isPro).toBe(true);
    });

    it('returns false when RevenueCat does not have active pro entitlement', async () => {
      await service.init('appl_live_key');
      mockGetCustomerInfo.mockResolvedValueOnce({
        entitlements: {
          active: {},
        },
      });

      const isPro = await service.isProSubscriber();
      expect(isPro).toBe(false);
    });
  });

  describe('getMonthlyPackage and getAnnualPackage', () => {
    it('returns null if not configured', async () => {
      expect(await service.getMonthlyPackage()).toBeNull();
      expect(await service.getAnnualPackage()).toBeNull();
    });

    it('returns packages from current offering when configured', async () => {
      await service.init('appl_live_key');
      const mockMonthly = { identifier: '$rc_monthly', packageType: 'MONTHLY' };
      const mockAnnual = { identifier: '$rc_annual', packageType: 'ANNUAL' };
      mockGetOfferings.mockResolvedValueOnce({
        current: {
          monthly: mockMonthly,
          annual: mockAnnual,
        },
      });

      expect(await service.getMonthlyPackage()).toEqual(mockMonthly);

      mockGetOfferings.mockResolvedValueOnce({
        current: {
          monthly: mockMonthly,
          annual: mockAnnual,
        },
      });
      expect(await service.getAnnualPackage()).toEqual(mockAnnual);
    });
  });

  describe('purchasePro', () => {
    it('simulates purchase successfully in unconfigured local mock mode for annual and monthly', async () => {
      const successAnnual = await service.purchasePro('annual');
      expect(successAnnual).toBe(true);

      const isPro = await service.isProSubscriber();
      expect(isPro).toBe(true);

      const successMonthly = await service.purchasePro('monthly');
      expect(successMonthly).toBe(true);
    });

    it('executes RevenueCat purchase package when configured for annual plan', async () => {
      await service.init('appl_live_key');
      const mockAnnualPackage = { identifier: '$rc_annual' };
      mockGetOfferings.mockResolvedValueOnce({
        current: {
          annual: mockAnnualPackage,
        },
      });
      mockPurchasePackage.mockResolvedValueOnce({
        customerInfo: {
          entitlements: {
            active: {
              pro: { identifier: 'pro' },
            },
          },
        },
      });

      const success = await service.purchasePro('annual');
      expect(success).toBe(true);
      expect(mockPurchasePackage).toHaveBeenCalledWith(mockAnnualPackage);
    });

    it('executes RevenueCat purchase package when configured for monthly plan', async () => {
      await service.init('appl_live_key');
      const mockMonthlyPackage = { identifier: '$rc_monthly' };
      mockGetOfferings.mockResolvedValueOnce({
        current: {
          monthly: mockMonthlyPackage,
        },
      });
      mockPurchasePackage.mockResolvedValueOnce({
        customerInfo: {
          entitlements: {
            active: {
              pro: { identifier: 'pro' },
            },
          },
        },
      });

      const success = await service.purchasePro('monthly');
      expect(success).toBe(true);
      expect(mockPurchasePackage).toHaveBeenCalledWith(mockMonthlyPackage);
    });
  });

  describe('restorePurchases', () => {
    it('returns mock status in unconfigured mode', async () => {
      service.setMockPro(false);
      expect(await service.restorePurchases()).toBe(false);

      service.setMockPro(true);
      expect(await service.restorePurchases()).toBe(true);
    });

    it('checks active entitlements from Purchases.restorePurchases when configured', async () => {
      await service.init('appl_live_key');
      mockRestorePurchases.mockResolvedValueOnce({
        entitlements: {
          active: {
            pro: { identifier: 'pro' },
          },
        },
      });

      const success = await service.restorePurchases();
      expect(success).toBe(true);
      expect(mockRestorePurchases).toHaveBeenCalledTimes(1);
    });
  });
});
