import Purchases, { CustomerInfo, PurchasesPackage } from 'react-native-purchases';

export const PRO_ENTITLEMENT = 'pro';
export const PRO_MONTHLY_PRICE = '$4.99 / month';

export class SubscriptionService {
  private isConfigured = false;
  // Automatically unlock all Pro features when EXPO_PUBLIC_UNLOCK_ALL_FEATURES is true
  private isDevMockPro =
    process.env.EXPO_PUBLIC_UNLOCK_ALL_FEATURES === 'true' ||
    process.env.EXPO_PUBLIC_TEST_MODE === 'true';

  /**
   * Initializes RevenueCat Purchases SDK.
   */
  async init(apiKey: string = 'appl_mock_api_key_placeholder'): Promise<void> {
    if (this.isConfigured) return;

    try {
      if (apiKey && !apiKey.includes('placeholder')) {
        await Purchases.configure({ apiKey });
        this.isConfigured = true;
      }
    } catch (error) {
      console.warn('Purchases configure skipped or running in test environment:', error);
    }
  }

  /**
   * Checks whether the current user holds an active Pro subscription entitlement.
   */
  async isProSubscriber(): Promise<boolean> {
    if (this.isDevMockPro) return true;

    try {
      if (!this.isConfigured) return false;
      const customerInfo: CustomerInfo = await Purchases.getCustomerInfo();
      return customerInfo.entitlements.active[PRO_ENTITLEMENT] !== undefined;
    } catch {
      return this.isDevMockPro;
    }
  }

  /**
   * Retrieves the $4.99/mo monthly subscription package.
   */
  async getMonthlyPackage(): Promise<PurchasesPackage | null> {
    try {
      if (!this.isConfigured) return null;
      const offerings = await Purchases.getOfferings();
      return offerings.current?.monthly ?? null;
    } catch {
      return null;
    }
  }

  /**
   * Executes the in-app purchase flow for the Pro subscription.
   */
  async purchasePro(): Promise<boolean> {
    try {
      if (!this.isConfigured) {
        // In local mock mode, simulate successful purchase
        this.isDevMockPro = true;
        return true;
      }

      const monthlyPkg = await this.getMonthlyPackage();
      if (!monthlyPkg) {
        throw new Error('No active subscription offering found.');
      }

      const { customerInfo } = await Purchases.purchasePackage(monthlyPkg);
      return customerInfo.entitlements.active[PRO_ENTITLEMENT] !== undefined;
    } catch (error) {
      console.warn('Purchase error:', error);
      throw error;
    }
  }

  /**
   * Restores existing purchases for the user.
   */
  async restorePurchases(): Promise<boolean> {
    try {
      if (!this.isConfigured) {
        return this.isDevMockPro;
      }

      const customerInfo = await Purchases.restorePurchases();
      return customerInfo.entitlements.active[PRO_ENTITLEMENT] !== undefined;
    } catch (error) {
      console.warn('Restore error:', error);
      throw error;
    }
  }

  /**
   * Development helper to simulate Pro subscription status.
   */
  setMockPro(isPro: boolean): void {
    this.isDevMockPro = isPro;
  }
}

export const subscriptionService = new SubscriptionService();
