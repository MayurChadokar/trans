/**
 * One-time script: drops the stale unique index on billNumber
 * from GarageBill and TransportBill collections.
 *
 * Run once with: node scripts/drop-bill-indexes.js
 */

const mongoose = require("mongoose");
const dotenv   = require("dotenv");
dotenv.config({ path: require("path").resolve(__dirname, "../.env") });

async function main() {
  console.log("Connecting to MongoDB…");
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected.\n");

  const db = mongoose.connection.db;

  for (const colName of ["garagebills", "transportbills"]) {
    try {
      const col = db.collection(colName);
      const indexes = await col.indexes();
      const billNumIdx = indexes.find(
        (i) => i.key && i.key.billNumber !== undefined
      );

      if (!billNumIdx) {
        console.log(`[${colName}] No billNumber index found – skipping.`);
        continue;
      }

      if (billNumIdx.unique) {
        console.log(
          `[${colName}] Found UNIQUE billNumber index "${billNumIdx.name}" – dropping…`
        );
        await col.dropIndex(billNumIdx.name);
        console.log(`[${colName}] ✓ Dropped "${billNumIdx.name}"`);
      } else {
        console.log(
          `[${colName}] billNumber index "${billNumIdx.name}" is NOT unique – no action needed.`
        );
      }
    } catch (err) {
      if (err.codeName === "NamespaceNotFound" || err.code === 26) {
        console.log(`[${colName}] Collection does not exist yet – skipping.`);
      } else {
        console.error(`[${colName}] Error:`, err.message);
      }
    }
  }

  console.log("\nDone. You can now restart the backend server.");
  await mongoose.disconnect();
  process.exit(0);
}

main().catch((e) => {
  console.error("Fatal:", e.message);
  process.exit(1);
});
