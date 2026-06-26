#!/usr/bin/env node
// Generate a scrypt password hash for AUTH_PASSWORD_HASH / ADMIN_PASSWORD_HASH.
// Usage:  node scripts/hash-password.mjs '@sampeer29'
import { scryptSync, randomBytes } from "node:crypto";

const password = process.argv[2];
if (!password) {
  console.error("Usage: node scripts/hash-password.mjs '<password>'");
  process.exit(1);
}

const salt = randomBytes(16);
const hash = scryptSync(password, salt, 32);
console.log(`scrypt$${salt.toString("hex")}$${hash.toString("hex")}`);
