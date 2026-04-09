# dahua-timesync

Synchronizes the system clock of Dahua NVR/DVR devices by comparing the NVR time against the local system time and correcting drift exceeding 1 minute.

Uses the Dahua JSON-RPC API with MD5 digest authentication.

## Requirements

- [Bun](https://bun.sh/) runtime

## Setup

1. Copy the example environment file and fill in your NVR credentials:

```bash
cp .env.example .env
```

2. Edit `.env`:

```
HOST=192.168.1.100
USER_NAME=admin
PASSWORD=your_password
```

### Environment Variables

| Variable | Required | Description |
| --- | --- | --- |
| `HOST` | Yes | NVR IP address or hostname |
| `USER_NAME` | Yes | NVR login username |
| `PASSWORD` | Yes | NVR login password |
| `TIMEOUT` | No | RPC request timeout in milliseconds (default: `120000`) |

## Usage

### Run directly

```bash
bun start
```

### Build a standalone binary

```bash
bun run build
```

This produces a `dahua-timesync` executable. Place a `.env` file next to it with the required credentials, then run:

```bash
./dahua-timesync
```

## How It Works

1. Authenticates with the NVR via a two-step login process
2. Reads the current time from the NVR
3. Compares it against the local system time
4. If the drift exceeds 1 minute, sets the NVR time to match the local system time
5. Logs out of the NVR session

## Running as a Scheduled Task

For continuous time synchronization, run this tool on a schedule (e.g., via cron).

> **Note:** The binary locates `.env` relative to itself

```cron
*/5 * * * * /path/to/dahua-timesync >> /path/to/log.txt 2>&1
```

## Project Structure

```
├── index.ts              # Entry point
├── src/
│   ├── app.ts            # DahuaRPC factory (login, logout, time get/set)
│   ├── rpc-client.ts     # Generic JSON-RPC HTTP client
│   ├── types.ts          # TypeScript types and RPC method enum
│   └── utils.ts          # Helpers: date formatting, MD5 encryption, env loading
├── .env.example          # Example environment file
├── package.json
└── tsconfig.json
```
