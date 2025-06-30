// encryption.js
const CryptoJS = require("crypto-js");

// Encryption Configuration
const ENCRYPTION_CONFIG = {
  tripleDesKey: "SECURE_KEY_123_TRIPLE_DES",
  aesKey: "SECURE_AES_256_KEY_12345",
  aesIV: CryptoJS.enc.Hex.parse("INITIAL_VECTOR_123")
};

// TripleDES Encryption
function encryptTripleDES(text) {
  try {
    return CryptoJS.TripleDES.encrypt(
      text,
      ENCRYPTION_CONFIG.tripleDesKey
    ).toString();
  } catch (e) {
    console.error('TripleDES encryption error:', e);
    return null;
  }
}

// TripleDES Decryption
function decryptTripleDES(encryptedText) {
  try {
    const bytes = CryptoJS.TripleDES.decrypt(
      encryptedText,
      ENCRYPTION_CONFIG.tripleDesKey
    );
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (e) {
    console.error('TripleDES decryption error:', e);
    return 'Lỗi giải mã';
  }
}

// AES Encryption
function encryptAES(text) {
  try {
    return CryptoJS.AES.encrypt(
      text,
      ENCRYPTION_CONFIG.aesKey,
      { 
        iv: ENCRYPTION_CONFIG.aesIV,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      }
    ).toString();
  } catch (e) {
    console.error('AES encryption error:', e);
    return null;
  }
}

// AES Decryption
function decryptAES(encryptedText) {
  try {
    const bytes = CryptoJS.AES.decrypt(
      encryptedText,
      ENCRYPTION_CONFIG.aesKey,
      { 
        iv: ENCRYPTION_CONFIG.aesIV,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      }
    );
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (e) {
    console.error('AES decryption error:', e);
    return 'Lỗi giải mã';
  }
}

// Hash Password (PBKDF2)
function hashPassword(password, salt) {
  return CryptoJS.PBKDF2(password, salt, {
    keySize: 256/32,
    iterations: 1000
  }).toString();
}

// Verify Password
function verifyPassword(inputPassword, storedHash, salt) {
  const hashedInput = hashPassword(inputPassword, salt);
  return hashedInput === storedHash;
}

export {
  ENCRYPTION_CONFIG,
  encryptTripleDES,
  decryptTripleDES,
  encryptAES,
  decryptAES,
  hashPassword,
  verifyPassword
};