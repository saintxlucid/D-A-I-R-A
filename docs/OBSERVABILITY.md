# Observability — Logs, Metrics, Traces

This project ships with basic tracing via OpenTelemetry and encourages consistent logs and metrics.

## Traces
- `packages/backend/src/tracing.ts` contains the NodeSDK bootstrap and auto-instrumentations
- Local development: console exporter
- Production: configure an OTLP endpoint, or vendor exporter like Azure Monitor, Splunk, NewRelic, etc.

## Logs
- Use NestJS logging in services and controllers via `Logger` or structured JSON logs if desired.
- Correlate logs with traces by adding `traceId` from active span context into logs when necessary (manually or via instrumentation).

## Metrics
- Consider adding `@opentelemetry/sdk-metrics` or vendor-specific metric exporters for counters, histograms, and gauges.

## Verification & Debugging
- For local verification, switch to ConsoleSpanExporter and check application stdout for spans.
- For collector-based verification, use Jaeger/OTLP/Collector to capture traces and visualize them.

## Recommendations
- Do not log PII. Use sanitized attributes for traces and logs.
- Use sample rate and sampling policy to reduce export cost.
- Use `Baggage` carefully for context propagation — limiting width of trace attributes helps keep costs and sizes down.

This file is a living document; keep it updated as you adopt a new exporter or metrics collector.