# Tracing & Observability — OpenTelemetry

This project uses OpenTelemetry to collect traces from the backend (NestJS). By default the project initializes OpenTelemetry Node SDK with a `ConsoleSpanExporter` for local debugging.

Files to check:
- `packages/backend/src/tracing.ts`: SDK initialization and auto-instrumentations

How it works
- On `packages/backend/src/main.ts`, tracing bootstrap is imported first so OpenTelemetry intercepts incoming requests and created spans for HTTP, Express and Redis calls.
- The SDK is configured in `tracing.ts` with HTTP, Express, and Redis instrumentations.

Local Development & troubleshooting
1. Confirm tracing console output: With `NODE_ENV=development` the SDK will log traces and diags to the console.
2. You can set environment variables to use an OTLP or Azure Monitor exporter in production, such as `OTEL_EXPORTER_OTLP_ENDPOINT` or `APPLICATIONINSIGHTS_CONNECTION_STRING`.

OTLP/Collector setup example (ENV):

```powershell
$env:OTEL_EXPORTER_OTLP_ENDPOINT = "http://collector:4318/v1/traces"
```

Switching to an OTLP exporter example (code):
- Add/replace `traceExporter` in `tracing.ts` for `OTLPTraceExporter` (OTLP HTTP)
- Choose `BatchSpanProcessor` in production for aggregation

Sampling & Performance
- Configure a sampler to control the percentage of traces exported. For example ApplicationInsights' sampler or the Node SDK's `AlwaysOnSampler`/`ParentBasedSampler`.

Production Recommendations
- Route traces to an OTLP collector or vendor (e.g., Application Insights, Jaeger, New Relic) rather than Console exporter.
- Ensure sensitive PII is not recorded in spans or attributes in production.

Example for Azure Monitor exporter
- Use `@azure/monitor-opentelemetry` and `@azure/monitor-opentelemetry-exporter` with `APPLICATIONINSIGHTS_CONNECTION_STRING` as env var.

---

If you want, I can add a `TRACING.md` guide to demo a minimal example for verifying traces using Jaeger or OTLP Collector.