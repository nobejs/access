// tracing.js
"use strict";

if (process.env.ENVFILE) {
  var dotenv = require("dotenv");
  dotenv.config({ path: process.env.ENVFILE });
}

const { HoneycombSDK } = require("@honeycombio/opentelemetry-node");
const {
  getNodeAutoInstrumentations,
} = require("@opentelemetry/auto-instrumentations-node");

// uses HONEYCOMB_API_KEY and OTEL_SERVICE_NAME environment variables
const sdk = new HoneycombSDK({
  debug: false,
  localVisualizations: false,
  instrumentations: [
    // new HttpInstrumentation(),
    getNodeAutoInstrumentations({
      "@opentelemetry/instrumentation-pg": {
        enhancedDatabaseReporting: true,
      },
    }),
  ],
  apiKey: process.env.HONEYCOMB_API_KEY,
  serviceName: process.env.OTEL_SERVICE_NAME,
});

if (
  process.env.ENABLE_HONEYCOMB_TRACING &&
  process.env.ENABLE_HONEYCOMB_TRACING === "true"
) {
  sdk
    .start()
    .then(() => console.log("Tracing initialized"))
    .catch((error) => console.log("Error initializing tracing", error));
}
