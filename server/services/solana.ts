import {
  Connection,
  PublicKey,
  Keypair,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import {
  getAssociatedTokenAddress,
  createTransferInstruction,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import bs58 from "bs58";

const RPC_ENDPOINT = "https://api.devnet.solana.com";
const USDC_MINT_DEVNET = "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"; // USDC devnet mint
const TRANSFER_AMOUNT = 1000; // 0.001 USDC (6 decimals)

const connection = new Connection(RPC_ENDPOINT, "confirmed");

let senderKeypair: Keypair | null = null;

function getSenderKeypair(): Keypair {
  if (senderKeypair) return senderKeypair;

  const privateKey = process.env.SOLANA_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error("SOLANA_PRIVATE_KEY is not set");
  }

  try {
    const decoded = bs58.decode(privateKey);
    senderKeypair = Keypair.fromSecretKey(decoded);
    return senderKeypair;
  } catch (error) {
    throw new Error("Invalid SOLANA_PRIVATE_KEY format. Must be base58 encoded.");
  }
}

export async function validateWalletAddress(address: string): Promise<{ valid: boolean; error?: string }> {
  try {
    if (!address || address.length < 32 || address.length > 44) {
      return { valid: false, error: "Invalid wallet address length" };
    }

    const publicKey = new PublicKey(address);
    
    const accountInfo = await connection.getAccountInfo(publicKey);
    
    return { valid: true };
  } catch (error: any) {
    return { valid: false, error: "Invalid Solana wallet address format" };
  }
}

export async function transferUSDC(recipientAddress: string): Promise<{
  signature: string;
  status: "success" | "failed";
  error?: string;
}> {
  try {
    const senderKeypair = getSenderKeypair();
    const recipientPublicKey = new PublicKey(recipientAddress);
    const usdcMint = new PublicKey(USDC_MINT_DEVNET);

    const senderTokenAccount = await getAssociatedTokenAddress(
      usdcMint,
      senderKeypair.publicKey
    );

    const recipientTokenAccount = await getAssociatedTokenAddress(
      usdcMint,
      recipientPublicKey
    );

    const recipientAccountInfo = await connection.getAccountInfo(recipientTokenAccount);
    
    if (!recipientAccountInfo) {
      return {
        signature: "",
        status: "failed",
        error: "Recipient does not have a USDC token account. They need to create one first.",
      };
    }

    const transaction = new Transaction().add(
      createTransferInstruction(
        senderTokenAccount,
        recipientTokenAccount,
        senderKeypair.publicKey,
        TRANSFER_AMOUNT,
        [],
        TOKEN_PROGRAM_ID
      )
    );

    const signature = await sendAndConfirmTransaction(
      connection,
      transaction,
      [senderKeypair],
      {
        commitment: "confirmed",
      }
    );

    return {
      signature,
      status: "success",
    };
  } catch (error: any) {
    console.error("Solana transfer error:", error);
    
    let errorMessage = "Failed to transfer USDC";
    if (error.message?.includes("insufficient")) {
      errorMessage = "Insufficient USDC balance in sender wallet";
    } else if (error.message?.includes("AccountNotFound")) {
      errorMessage = "Token account not found";
    }

    return {
      signature: "",
      status: "failed",
      error: errorMessage,
    };
  }
}

export async function getSenderBalance(): Promise<number> {
  try {
    const senderKeypair = getSenderKeypair();
    const usdcMint = new PublicKey(USDC_MINT_DEVNET);
    
    const senderTokenAccount = await getAssociatedTokenAddress(
      usdcMint,
      senderKeypair.publicKey
    );

    const balance = await connection.getTokenAccountBalance(senderTokenAccount);
    return parseFloat(balance.value.uiAmount?.toString() || "0");
  } catch (error) {
    console.error("Failed to get sender balance:", error);
    return 0;
  }
}
