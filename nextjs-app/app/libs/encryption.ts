import * as crypto from "crypto";
import * as dotenv from "dotenv";
dotenv.config();

const algorithm: string = "AES-256-CBC";
// Load the hex-encoded key from environment variable and convert it to a Buffer
const key: Buffer = Buffer.from(process.env.ENCRYPTION_KEY || "", "hex");

// Check if key length is exactly 32 bytes (256 bits), if not, throw an error
if (key.length !== 32) {
  throw new Error(
    "Key length is not 32 bytes (256 bits). Check your ENCRYPTION_KEY."
  );
}

const iv: Buffer = crypto.randomBytes(16); // Properly generate a 16-byte IV

export function encrypt(text: string): string {
  const cipher: crypto.Cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted: string =
    cipher.update(text, "utf8", "hex") + cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted; // Include the IV with the encrypted data
}

export function decrypt(text: string): string {
  const textParts: string[] = text.split(":");
  const iv: Buffer = Buffer.from(textParts.shift()!, "hex"); // Extract the IV from the text
  const encryptedText: Buffer = Buffer.from(textParts.join(":"), "hex");
  const decipher: crypto.Decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted: string =
    decipher.update(encryptedText, undefined, "utf8") + decipher.final("utf8");
  return decrypted;
}

export function generateKey() {
  const key = crypto.randomBytes(32);
  return key;
}
