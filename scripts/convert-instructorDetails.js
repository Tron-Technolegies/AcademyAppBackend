import "dotenv/config";
import mongoose from "mongoose";
import User from "../models/UserModel.js";

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/academy";

async function main() {
  console.log("Connecting to", MONGODB_URI);
  await mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const dryRun =
    process.argv.includes("--dry-run") || process.argv.includes("-d");

  // Find users where instructorDetails is an array
  const query = { instructorDetails: { $type: "array" } };
  const cursor = User.find(query).cursor();

  let processed = 0;
  for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) {
    const arr = doc.instructorDetails;
    let newObj = {};
    if (Array.isArray(arr) && arr.length > 0) {
      newObj = arr[0];
    }

    if (dryRun) {
      console.log(`[dry-run] would convert user ${doc._id} ->`, newObj);
    } else {
      try {
        doc.instructorDetails = newObj;
        await doc.save();
        console.log(`Updated user ${doc._id}`);
      } catch (err) {
        console.error(`Failed to update user ${doc._id}:`, err.message);
      }
    }

    processed++;
  }

  console.log(`Done. Processed ${processed} user(s).`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
