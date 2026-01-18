import dotenv from "dotenv";
dotenv.config();

console.log("\n🔍 ENVIRONMENT VARIABLE CHECK\n");

// Helper
function check(key, options = {}) {
  const value = process.env[key];

  if (!value) {
    console.error(`❌ ${key} → MISSING`);
    return;
  }

  if (options.mustNotContain && value.includes(options.mustNotContain)) {
    console.error(`❌ ${key} → INVALID (contains "${options.mustNotContain}")`);
    return;
  }

  if (options.mustStartWith && !value.startsWith(options.mustStartWith)) {
    console.error(`❌ ${key} → INVALID (must start with ${options.mustStartWith})`);
    return;
  }

  console.log(`✅ ${key} → OK`);
}

/* ===== CORE ===== */
check("NODE_ENV");
check("PORT");

/* ===== DATABASE ===== */
check("MONGODB_URI", { mustStartWith: "mongodb" });
check("TEST_MONGODB_URI", { mustStartWith: "mongodb" });

/* ===== AUTH ===== */
check("JWT_SECRET", { mustNotContain: ">" });
check("JWT_EXPIRES_IN");
check("SESSION_SECRET", { mustNotContain: ">" });

/* ===== AI SERVICE ===== */
check("AI_SERVICE_URL", { mustStartWith: "http" });
check("AI_API_KEY");

/* ===== EMAIL (OPTIONAL) ===== */
check("EMAIL_HOST");
check("EMAIL_PORT");
check("EMAIL_USER");
check("EMAIL_PASS");

/* ===== PAYMENTS (OPTIONAL) ===== */
check("STRIPE_SECRET_KEY");
check("STRIPE_WEBHOOK_SECRET");

/* ===== STORAGE (OPTIONAL) ===== */
check("CLOUDINARY_CLOUD_NAME");
check("CLOUDINARY_API_KEY");
check("CLOUDINARY_API_SECRET");

/* ===== OAUTH (SKIPPED BY REQUEST) ===== */
// Google + GitHub intentionally not tested

console.log("\n✅ ENV CHECK COMPLETE\n");
