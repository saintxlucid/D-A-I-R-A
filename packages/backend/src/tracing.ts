import { NodeSDK } from '@opentelemetry/sdk-node';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
import { RedisInstrumentation } from '@opentelemetry/instrumentation-redis-4';
import { ConsoleSpanExporter } from '@opentelemetry/sdk-trace-node';
import { DiagConsoleLogger, DiagLogLevel, diag } from '@opentelemetry/api';

// Enable debug logging for troubleshooting
if (process.env.NODE_ENV === 'development') {
  diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.ALL);
}

const sdk = new NodeSDK({
  traceExporter: new ConsoleSpanExporter(),
  instrumentations: [
    new HttpInstrumentation(),
    new ExpressInstrumentation(),
    new RedisInstrumentation(),
  ],
});

sdk.start();
