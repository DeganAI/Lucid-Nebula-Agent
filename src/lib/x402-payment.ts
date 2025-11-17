import { createPublicClient, http, isAddress, verifyTypedData, type Address } from 'viem';
import { base } from 'viem/chains';
import { CONFIG } from './config.js';

export interface PaymentData {
  scheme: string;
  signature: string;
  from: string;
  to: string;
  value: string;
  validAfter: string;
  validBefore: string;
  nonce: string;
}

export interface VerifiedPayment {
  verified: boolean;
  amount: number;
  payer: string;
  transactionHash?: string;
  error?: string;
}

// EIP-3009 domain and types for USDC transfers
const EIP3009_DOMAIN = {
  name: 'USD Coin',
  version: '2',
  chainId: CONFIG.network.chainId,
  verifyingContract: CONFIG.x402.usdcAddress as Address,
};

const EIP3009_TYPES = {
  TransferWithAuthorization: [
    { name: 'from', type: 'address' },
    { name: 'to', type: 'address' },
    { name: 'value', type: 'uint256' },
    { name: 'validAfter', type: 'uint256' },
    { name: 'validBefore', type: 'uint256' },
    { name: 'nonce', type: 'bytes32' },
  ],
};

export class X402PaymentVerifier {
  private client;
  
  constructor() {
    this.client = createPublicClient({
      chain: base,
      transport: http(CONFIG.network.rpcUrl),
    });
  }
  
  /**
   * Verify EIP-3009 payment signature
   */
  async verifyPayment(paymentData: PaymentData): Promise<VerifiedPayment> {
    try {
      // Validate addresses
      if (!isAddress(paymentData.from)) {
        return {
          verified: false,
          amount: 0,
          payer: paymentData.from,
          error: 'Invalid from address',
        };
      }
      
      if (!isAddress(paymentData.to)) {
        return {
          verified: false,
          amount: 0,
          payer: paymentData.from,
          error: 'Invalid to address',
        };
      }
      
      // Verify recipient is our wallet
      if (paymentData.to.toLowerCase() !== CONFIG.wallets.base.address.toLowerCase()) {
        return {
          verified: false,
          amount: 0,
          payer: paymentData.from,
          error: 'Payment not directed to agent wallet',
        };
      }
      
      // Verify signature using EIP-3009 typed data
      const message = {
        from: paymentData.from as Address,
        to: paymentData.to as Address,
        value: BigInt(paymentData.value),
        validAfter: BigInt(paymentData.validAfter),
        validBefore: BigInt(paymentData.validBefore),
        nonce: paymentData.nonce as `0x${string}`,
      };
      
      const isValid = await verifyTypedData({
        address: paymentData.from as Address,
        domain: EIP3009_DOMAIN,
        types: EIP3009_TYPES,
        primaryType: 'TransferWithAuthorization',
        message,
        signature: paymentData.signature as `0x${string}`,
      });
      
      if (!isValid) {
        return {
          verified: false,
          amount: 0,
          payer: paymentData.from,
          error: 'Invalid signature',
        };
      }
      
      // Verify timing
      const now = Math.floor(Date.now() / 1000);
      const validAfter = parseInt(paymentData.validAfter);
      const validBefore = parseInt(paymentData.validBefore);
      
      if (now < validAfter) {
        return {
          verified: false,
          amount: 0,
          payer: paymentData.from,
          error: 'Payment not yet valid',
        };
      }
      
      if (now > validBefore) {
        return {
          verified: false,
          amount: 0,
          payer: paymentData.from,
          error: 'Payment expired',
        };
      }
      
      // Convert USDC amount (6 decimals) to dollars
      const amountUSDC = parseFloat(paymentData.value);
      const amountDollars = amountUSDC / 1_000_000;
      
      console.log(`✅ Payment verified: ${amountDollars} USDC from ${paymentData.from}`);
      
      return {
        verified: true,
        amount: amountDollars,
        payer: paymentData.from,
        transactionHash: `pending-${paymentData.nonce}`,
      };
      
    } catch (error: any) {
      console.error('Payment verification error:', error);
      return {
        verified: false,
        amount: 0,
        payer: paymentData.from || 'unknown',
        error: error.message || 'Verification failed',
      };
    }
  }
  
  /**
   * Validate payment amount against required amount
   */
  validateAmount(paidAmount: number, requiredAmount: number): boolean {
    // Allow 1% tolerance for rounding
    const tolerance = requiredAmount * 0.01;
    return paidAmount >= (requiredAmount - tolerance);
  }
}

export const paymentVerifier = new X402PaymentVerifier();
