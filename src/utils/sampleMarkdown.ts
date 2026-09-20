export interface MarkdownSample {
  id: string;
  name: string;
  description: string;
  content: string;
}

export const SAMPLE_TEMPLATES: MarkdownSample[] = [
  {
    id: 'api-spec',
    name: 'Developer Documentation & API Spec',
    description: 'Comprehensive API documentation with tables, code blocks, and endpoints',
    content: `# CloudMesh API Reference

> **Version:** 2.4.0  
> **Environment:** Production & Staging  
> **Privacy:** Zero document content is transmitted outside your client device.

Welcome to the CloudMesh API developer documentation. This document outlines core authentication, rate limiting, and microservice orchestration endpoints.

---

## 1. Authentication

All requests to the CloudMesh gateway must include a valid bearer token in the \`Authorization\` header.

\`\`\`javascript
// Client-side authentication setup
const gatewayUrl = "https://api.cloudmesh.io/v2";

async function initializeClient(apiKey) {
  const response = await fetch(\`\${gatewayUrl}/auth/handshake\`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Client-Version": "2.4.0"
    },
    body: JSON.stringify({ key: apiKey, timestamp: Date.now() })
  });

  if (!response.ok) {
    throw new Error(\`Handshake failed with status: \${response.status}\`);
  }

  const session = await response.json();
  console.log("Connected to cluster:", session.clusterId);
  return session.token;
}
\`\`\`

---

## 2. Gateway Endpoints

The table below summarizes standard REST endpoints supported by the ingress proxy:

| Method | Endpoint | Auth Required | Rate Limit | Description |
| :--- | :--- | :---: | :---: | :--- |
| \`GET\` | \`/v2/services\` | Yes | 100 req/min | List all active microservices across availability zones |
| \`POST\` | \`/v2/services/deploy\` | Yes (Admin) | 10 req/min | Trigger rolling canary deployment for container pods |
| \`GET\` | \`/v2/metrics/realtime\` | Yes | 300 req/min | Stream telemetry, CPU utilization, and memory pressure |
| \`DELETE\` | \`/v2/cache/purge\` | Yes | 5 req/min | Invalidate global edge CDN cache tags across all regions |

---

## 3. High-Throughput Worker Loop

Below is the streaming ingestion consumer implementation used in background processing:

\`\`\`typescript
import { StreamDispatcher, QueueMessage, Logger } from "@cloudmesh/core";

export class TelemetryConsumer {
  private dispatcher: StreamDispatcher;
  private logger: Logger;
  private activeJobsCount: number = 0;

  constructor(endpoint: string, private readonly maxBatchSize: number = 250) {
    this.dispatcher = new StreamDispatcher({
      targetUrl: endpoint,
      retryBackoffMs: 1500,
      maxRetries: 5
    });
    this.logger = new Logger("TelemetryConsumer");
  }

  public async processBatch(messages: QueueMessage[]): Promise<void> {
    this.logger.info(\`Received batch of \${messages.length} messages\`);
    
    for (let index = 0; index < messages.length; index += this.maxBatchSize) {
      const slice = messages.slice(index, index + this.maxBatchSize);
      await this.dispatcher.dispatch(slice);
      this.activeJobsCount += slice.length;
    }
  }
}
\`\`\`

---

## 4. Deployment Checklist

Prior to promoting revisions to production, ensure that:

- [x] All integration and contract tests pass with 100% assertions
- [x] Security headers and CSP policies are verified
- [ ] Database schema migrations run in backward-compatible mode
- [ ] Canary traffic routing is configured at 5% for first 15 minutes
- [ ] Alerting webhooks are tested against PagerDuty channels

---

### Important Architectural Note

> **Reliability Notice:** The proxy gracefully buffers inbound sockets during hot-reloads. Connections will not drop, but slight latency bumps of up to 45ms may be observed.
`
  },
  {
    id: 'code-showcase',
    name: 'Multi-Language Code & Edge Cases',
    description: 'Stress-tests long lines, syntax highlighting, nested lists, and quotes',
    content: `# Multi-Language Code & Stress Test

This document tests syntax highlighting across multiple programming languages, very long single lines of code, and deep formatting.

## 1. Python Concurrency

\`\`\`python
import asyncio
from typing import AsyncGenerator, Dict, Any

async def fetch_telemetry_stream(device_id: str) -> AsyncGenerator[Dict[str, Any], None]:
    """Asynchronously polls IoT telemetry sensors with exponential backoff."""
    retry_delay = 1.0
    while True:
        try:
            telemetry = await read_sensor_registers(device_id)
            yield {"device": device_id, "reading": telemetry, "status": "nominal"}
            await asyncio.sleep(0.5)
        except ConnectionResetError:
            await asyncio.sleep(retry_delay)
            retry_delay = min(retry_delay * 2, 30.0)
\`\`\`

---

## 2. Extremely Long Code Line Wrapping Test

Here is a 200+ character line to verify that code wrapping prevents horizontal clipping:

\`\`\`bash
curl -X POST "https://gateway.internal.cluster.local:8443/v1/telemetry/ingest?format=json&compression=gzip&datacenter=us-east-1a&environment=production&tenantId=tenant_9847120938120391823" -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"
\`\`\`

---

## 3. SQL Complex Aggregation

\`\`\`sql
SELECT 
    d.department_name,
    COUNT(e.id) AS total_engineers,
    ROUND(AVG(e.salary), 2) AS average_salary,
    STRING_AGG(e.first_name, ', ' ORDER BY e.hire_date) AS team_members
FROM departments d
JOIN employees e ON d.id = e.department_id
WHERE e.is_active = TRUE AND d.budget > 1000000
GROUP BY d.department_name
HAVING COUNT(e.id) >= 5
ORDER BY average_salary DESC;
\`\`\`

---

## 4. Deeply Nested Structures

1. Level 1: System Infrastructure
   * Level 2: Compute Nodes
     * Level 3: Kernel configuration
       * Level 4: \`sysctl.conf\` network tuning
   * Level 2: Storage Volumes
     * Level 3: NVMe tiered cache
2. Level 1: Observability
   * Level 2: Prometheus scraping
   * Level 2: Grafana dashboards
`
  },
  {
    id: 'release-notes',
    name: 'Product Release Notes',
    description: 'Clean release announcement with features, fixes, and contributor notes',
    content: `# MD2PDF Release Notes v1.0

We are excited to introduce **MD2PDF** — the fast, privacy-first, client-side Markdown to PDF generator designed for developers, technical writers, and students.

### Highlights

* **100% Client-Side Generation**: Your Markdown never touches a server.
* **Vector Text Quality**: Output PDFs have selectable, searchable text rather than pixelated screenshots.
* **Natural Web Aesthetics**: Clean, readable developer documentation style with GitHub-inspired typography.
* **Smart Page Breaks**: Avoids orphaned headings and maintains table headers across multiple pages.
* **Flexible Page Sizes**: Full support for A4, A3, A5, and US Letter in Portrait and Landscape.

---

### What's Changed

- Added zero-latency live preview with debounced parsing.
- Added intelligent code block wrapping for long lines.
- Added configurable margin presets (Normal, Narrow, Wide, Custom).
- Added multi-page table continuation with repeated headers.
- Added in-browser PDF preview embed and instant download.
`
  }
];
