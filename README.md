# 📡 Pulse Aggregator (`pulse-aggregator`)

> **Author:** `Joseph Adogeri`  
> **Version:** `1.0.0`  
> **Date:** `26-May-2026`  

A production-ready, stateless **NestJS Health Aggregator Microservice** built with the `@nestjs/terminus` engine. This application acts as a central observer gateway that concurrently polls a list of downstream target APIs—such as the [**New Orleans Food Spots API**](https://github.com/jadogeri/new-orleans-food-spots.git).—and groups their individual up/down heartbeats into a single, unified status payload for external monitoring platforms.

---

## 🏗️ Architecture Design & Data Flow

The ecosystem operates as a stateless observer. Rather than having your uptime platform individually track dozens of services, it pings this aggregator once, triggering a localized, concurrent verification loop.

```text
┌─────────────────┐       ( Every 5-10 Mins )       ┌──────────────────┐
│ Uptimerobot.com │ ──────────────────────────────> │ pulse-aggregator │
└─────────────────┘     GET /api/health Endpoint    └─────────┬────────┘
                                                              │
                                        ┌─────────────────────┼─────────────────────┐
                                        │ (Concurrent Async)  │ (Concurrent Async)  │ (Concurrent Async)
                                        ▼                     ▼                     ▼
                             ┌────────────────────┐ ┌────────────────────┐ ┌────────────────────┐
                             │    dogs-spots-api  │ │   auth-microservice│ │ payment-gateway-api│
                             │    (/api/health)   │ │    (/api/health)   │ │    (/api/health)   │
                             └────────────────────┘ └────────────────────┘ └────────────────────┘
```

### 🔁 Execution Lifecycles:
1. **Trigger Phase**: `Uptimerobot.com` executes a periodic HTTP `GET` request against `https://onrender.com`.
2. **Aggregation Phase**: The application retrieves its array configuration string, spawns parallel, non-blocking runtime HTTP socket connections using `HttpHealthIndicator`, and executes health evaluation sweeps.
3. **Response Processing**:
   * **`200 OK` (Green)**: All dependencies verified operational. A single summary object is returned.
   * **`503 Service Unavailable` (Red)**: Any child service crashes, returns a bad code, or exceeds latency limits. The engine returns immediate terminal alerts to trigger monitoring fallback alarms.

---

## 📂 Project Structure Tree

```text
📁 pulse-aggregator/                 # GitHub Workspace Core Root
├── 📁 .github/
│   └── 📁 workflows/
│       └── ci.yml                   # Continuous Integration (24 Matrix Tests Workflow)
├── README.md                        # Architecture Documentation Index Blueprint
└── 📁 pulse-aggregator/             # NestJS Workspace Execution Folder Root
    ├── 📁 src/
    │   ├── 📁 config/
    │   │   └── services.config.ts   # Environment Variable Parsing Layer (JSON String Array Router)
    │   ├── 📁 health/
    │   │   ├── health.controller.ts      # Request Routing Context & Console Fallback Logging
    │   │   ├── health.controller.spec.ts # 24-Case Execution Test Suite (Matrix Testing Framework)
    │   │   └── health.module.ts          # Module Registry (Terminus Core & Axios Config)
    │   ├── app.module.ts
    │   └── main.ts
    ├── package.json
    └── tsconfig.json
```

---

## ⚙️ Environment Configuration (`.env`)

The service avoids hardcoded targets on GitHub. All nodes are passed as a single-line JSON text configuration matrix injected via the `MONITORED_SERVICES_JSON` variable.

```env
MONITORED_SERVICES_JSON="[{\"name\":\"new-orleans-food-spots-api\",\"url\":\"https://onrender.com\",\"timeout\":5000}]"
```

> **Production Deployment Tip**: When inputting values inside the Render Dashboard Environment panels, skip escaping characters. Paste raw values directly:
> `[{"name":"your web service name","url":"your web service url","timeout":optional timeout in ms}]`

---

## 🧪 Testing Verification Engine (`health.controller.spec.ts`)

The project uses a complete 24-variant automated data matrix validation layer inside `src/health/health.controller.spec.ts`. This platform simulates every possible architectural anomaly before code hits development pipelines.

* **🟢 Happy Path Tests (Cases 1-8)**: Resolves system payloads under rapid responses, tracking complex subdomains and structural trailing slashes.
* **🟡 Edge Case Tests (Cases 9-16)**: Tracks high network latencies right beneath limits, complex parameters, and cross-platform payload redirections.
* **🔴 Exception Case Tests (Cases 17-24)**: Evaluates terminal drop situations including socket drops (`ECONNREFUSED`), missing paths (`404`), application error responses (`500/502`), and null data blocks.

### Running Local Validation
Navigate into your NestJS directory and run your test runner suite:
```bash
cd pulse-aggregator
npm run test
```

---

## 🚀 Render Deployment Blueprint Configuration

Deployments are handled safely by connecting the platform repository layout to Render. The pipeline automatically reads your configuration settings directly from the workspace root.

```yaml
services:
  - type: web
    name: pulse-aggregator
    runtime: node
    buildCommand: npm ci && npm run build
    startCommand: npm run start:prod
    srcDir: pulse-aggregator
```

### Finalizing Uptime Robot Linkages
1. Copy the finalized deployed target service domain provided by your Render interface panel.
2. Setup a new **HTTP(s) Monitor** on `Uptimerobot.com` pointing exactly to: `https://onrender.com`.
3. Set your execution threshold step window interval safely to **every 5 to 10 minutes** to keep your application awake and avoid any initialization wake-up latencies.

---

## 🧠 Key Learnings, Bugs, and Fixes

Building this microservice provided massive insights into TypeScript configurations, continuous integration constraints, and stateless cluster infrastructure limitations.


| # | Bug / Issue Encountered | Root Cause | Resolution Strategy |
| :--- | :--- | :--- | :--- |
| **1** | `nest: command not found` on machine | The NestJS CLI utility was either missing globally or omitted from the machine's local system paths. | Prefixed scaffolding executions with `npx @nestjs/cli` to bypass global storage installs entirely. |
| **2** | `Option 'baseUrl' is deprecated` in compiler config | Modern `nodenext` resolutions in TypeScript 5+ deprecate absolute baseline resolution routing configurations. | Eliminated the `baseUrl` configuration key entirely and let TypeScript auto-detect modules relative to inputs. |
| **3** | `Cannot find name 'describe'` unit test compile failure | Changing module resolutions broke global testing namespace injections inside the standalone `.spec` types files. | Injected explicit `"types": ["jest"]` specifications directly into the `compilerOptions` config block. |
| **4** | CI Pipeline Crash: `Cannot find type definition file for 'Jest'` | TypeScript enforces case-sensitive module lookup. The config contained capitalized `"Jest"` instead of `"jest"`. | Fixed the letter casing pattern inside `tsconfig.json` to be entirely lowercase. |
| **5** | GitHub Workflow fails to find dependencies or files | The repo uses a nested subfolder workspace layout. The default runner path was looking for directories at the wrong level. | Injected `working-directory` and custom `cache-dependency-path` defaults targeting the subfolder context. |
| **6** | False alarm downtime flags inside Uptime Robot dashboard | Pointing the monitor to the base domain URL threw a `404` code because no default index router was declared. | Corrected the monitoring target query path explicitly to hit `/api/health` which responds with valid `200` codes. |

---

## 🔮 Future Enhancements & Roadmap

To evolve this project into an enterprise-grade tracking dashboard, the following iterations are planned:

*   **🔒 Security Ingestion Layer**: Implement a secure API token validator guard inside the controller to guarantee *only* verified Uptime Robot webhook headers can trigger ping sweeps.
*   **📊 Persistent Analytics Database**: Integrate a lightweight database (e.g., PostgreSQL or Redis) to save latency performance historical metrics over time rather than throwing stateless responses away.
*   **🚨 Multi-Channel Alert Fallbacks**: Write a dedicated logging notifier stream to broadcast instant failure warnings straight to Discord or Slack channels whenever the internal exception parser triggers.
*   **🎨 Visualization Status Interface**: Build a clean frontend dashboard (Next.js/Tailwind) displaying beautiful, public-facing status grids for users to check service status histories at a glance.
