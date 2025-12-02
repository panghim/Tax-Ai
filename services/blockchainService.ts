import { Block, ChainProvider } from "../types";

// Simple SHA-256 implementation using Web Crypto API
export const calculateHash = async (
  index: number,
  previousHash: string,
  timestamp: string,
  data: any,
  nonce: number
): Promise<string> => {
  const message = index + previousHash + timestamp + JSON.stringify(data) + nonce;
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
};

export const createGenesisBlock = async (): Promise<Block> => {
  const timestamp = new Date().toISOString();
  const data = { message: "Tax AI Ledger Genesis Block" };
  const hash = await calculateHash(0, "0", timestamp, data, 0);
  
  return {
    index: 0,
    timestamp,
    data,
    previousHash: "0",
    hash,
    nonce: 0,
    type: 'SYSTEM',
    provider: 'ANTCHAIN',
    txId: '0x00000000000000000000000000000000'
  };
};

export const createBlock = async (
  lastBlock: Block,
  data: any,
  type: 'INVOICE' | 'DECLARATION' | 'SYSTEM' | 'TRAM_REPORT' | 'AMENDMENT' = 'INVOICE',
  provider: ChainProvider = 'ANTCHAIN',
  relatedTxId?: string,
  amendmentReason?: string
): Promise<Block> => {
  const index = lastBlock.index + 1;
  const timestamp = new Date().toISOString();
  let nonce = 0;
  let hash = await calculateHash(index, lastBlock.hash, timestamp, data, nonce);

  // Simple Proof of Work simulation (make hash start with '0')
  // Kept very simple for UI responsiveness
  while (hash.substring(0, 1) !== "0") {
    nonce++;
    hash = await calculateHash(index, lastBlock.hash, timestamp, data, nonce);
  }

  // Generate a mock Transaction ID based on provider format
  let txIdPrefix = '0x';
  if (provider === 'ANTCHAIN') txIdPrefix = 'ant_';
  if (provider === 'HUAWEI') txIdPrefix = 'bcs_';
  if (provider === 'TENCENT') txIdPrefix = 'tbaas_';
  
  const txId = `${txIdPrefix}${Math.random().toString(36).substring(2, 15)}${Date.now()}`;

  return {
    index,
    timestamp,
    data,
    previousHash: lastBlock.hash,
    hash,
    nonce,
    type,
    provider,
    txId,
    relatedTxId,
    amendmentReason
  };
};

export const verifyChain = async (chain: Block[]): Promise<{ isValid: boolean; errorIndex: number }> => {
  for (let i = 1; i < chain.length; i++) {
    const currentBlock = chain[i];
    const previousBlock = chain[i - 1];

    // Check 1: Link validity
    if (currentBlock.previousHash !== previousBlock.hash) {
      return { isValid: false, errorIndex: i };
    }

    // Check 2: Data integrity (Re-hash)
    const recalculatedHash = await calculateHash(
      currentBlock.index,
      currentBlock.previousHash,
      currentBlock.timestamp,
      currentBlock.data,
      currentBlock.nonce
    );

    if (currentBlock.hash !== recalculatedHash) {
      return { isValid: false, errorIndex: i };
    }
  }
  return { isValid: true, errorIndex: -1 };
};