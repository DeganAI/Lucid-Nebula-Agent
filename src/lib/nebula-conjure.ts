import OpenAI from 'openai';
import { nanoid } from 'nanoid';
import { createHash } from 'crypto';
import { CONFIG, STYLE_PROMPTS } from './config.js';

const openai = new OpenAI({
  apiKey: CONFIG.ai.openaiKey,
});

export interface ConjureRequest {
  prompt: string;
  style: string;
  tier: 'ethereal' | 'astral' | 'quantum';
}

export interface ConjureResult {
  success: boolean;
  artifact: string;
  proof: ZKProof;
  publicSignals: string[];
  conjureTime: number;
  artifactId: string;
  tier: string;
}

export interface ZKProof {
  a: string[];
  b: string[][];
  c: string[];
}

class NebulaConjurer {
  /**
   * Main conjure method - generates AI art with ZK proof
   */
  async conjure(request: ConjureRequest): Promise<ConjureResult> {
    const startTime = Date.now();
    const artifactId = `nebula-${nanoid(10)}`;
    
    try {
      console.log(`🎨 Conjuring artifact ${artifactId}...`);
      
      // Build enhanced prompt with style
      const enhancedPrompt = this.buildEnhancedPrompt(request.prompt, request.style);
      
      // Determine image size based on tier
      const size = this.getSizeForTier(request.tier);
      
      // Generate image using DALL-E 3
      const imageUrl = await this.generateImage(enhancedPrompt, size);
      
      // Generate ZK proof for the artifact
      const proof = await this.generateProof(request, artifactId, imageUrl);
      
      // Calculate public signals (hashes that can be verified)
      const publicSignals = this.calculatePublicSignals(request, artifactId);
      
      const conjureTime = Date.now() - startTime;
      
      console.log(`✨ Artifact ${artifactId} conjured in ${conjureTime}ms`);
      
      return {
        success: true,
        artifact: imageUrl,
        proof,
        publicSignals,
        conjureTime,
        artifactId,
        tier: request.tier,
      };
      
    } catch (error: any) {
      console.error(`❌ Conjure failed for ${artifactId}:`, error);
      throw new Error(`Conjure failed: ${error.message}`);
    }
  }
  
  /**
   * Build enhanced prompt with style modifiers
   */
  private buildEnhancedPrompt(basePrompt: string, style: string): string {
    const styleModifier = STYLE_PROMPTS[style] || '';
    return `${basePrompt} ${styleModifier}`;
  }
  
  /**
   * Get image size based on tier
   */
  private getSizeForTier(tier: string): '1024x1024' | '1792x1024' | '1024x1792' {
    // DALL-E 3 supports these sizes, we'll use square for all tiers
    // In a real implementation, you could vary this
    return '1024x1024';
  }
  
  /**
   * Generate image using OpenAI DALL-E 3
   */
  private async generateImage(prompt: string, size: '1024x1024' | '1792x1024' | '1024x1792'): Promise<string> {
    try {
      const response = await openai.images.generate({
        model: 'dall-e-3',
        prompt: prompt,
        n: 1,
        size: size,
        quality: 'standard',
        response_format: 'url',
      });
      
      if (!response.data[0]?.url) {
        throw new Error('No image URL returned from OpenAI');
      }
      
      return response.data[0].url;
      
    } catch (error: any) {
      console.error('OpenAI image generation error:', error);
      throw new Error(`Image generation failed: ${error.message}`);
    }
  }
  
  /**
   * Generate ZK proof for the artifact
   * In a real implementation, this would use snarkjs with compiled circuits
   * For now, we generate a mock proof structure
   */
  private async generateProof(
    request: ConjureRequest,
    artifactId: string,
    imageUrl: string
  ): Promise<ZKProof> {
    // In production, this would:
    // 1. Load the appropriate circuit based on tier
    // 2. Generate witness from inputs
    // 3. Generate proof using snarkjs
    // 4. Return the actual proof
    
    // Mock proof structure that matches snarkjs output
    const mockProof: ZKProof = {
      a: [
        this.hashString(request.prompt),
        this.hashString(request.style),
      ],
      b: [
        [this.hashString(artifactId), this.hashString(request.tier)],
        [this.hashString(imageUrl), this.hashString(Date.now().toString())],
      ],
      c: [
        this.hashString(`${request.prompt}${request.style}${artifactId}`),
        this.hashString(`proof-${artifactId}`),
      ],
    };
    
    return mockProof;
  }
  
  /**
   * Calculate public signals (verifiable hashes)
   */
  private calculatePublicSignals(request: ConjureRequest, artifactId: string): string[] {
    return [
      this.hashString(request.prompt),           // Prompt hash
      this.hashString(request.style),            // Style hash
      this.hashString(artifactId),               // Artifact ID hash
      this.hashString(request.tier),             // Tier hash
      this.hashString(Date.now().toString()),    // Timestamp hash
    ];
  }
  
  /**
   * Create a hash from a string
   */
  private hashString(input: string): string {
    return '0x' + createHash('sha256').update(input).digest('hex').substring(0, 16);
  }
  
  /**
   * Verify an artifact's proof
   * In production, this would use snarkjs to verify the actual proof
   */
  async verifyArtifact(
    artifactId: string,
    proof: ZKProof,
    publicSignals: string[]
  ): Promise<boolean> {
    try {
      // Basic validation
      if (!proof || !proof.a || !proof.b || !proof.c) {
        return false;
      }
      
      if (!publicSignals || publicSignals.length === 0) {
        return false;
      }
      
      // In production, use snarkjs.groth16.verify()
      // For now, we validate structure
      const hasValidStructure = 
        Array.isArray(proof.a) && proof.a.length === 2 &&
        Array.isArray(proof.b) && proof.b.length === 2 &&
        Array.isArray(proof.c) && proof.c.length === 2;
      
      console.log(`🔍 Artifact ${artifactId} verification: ${hasValidStructure}`);
      
      return hasValidStructure;
      
    } catch (error: any) {
      console.error('Verification error:', error);
      return false;
    }
  }
}

export const nebulaConjurer = new NebulaConjurer();
