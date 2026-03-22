# Blockchain Backend - ETH Price Checker

A Rust application that queries the current ETH/USDC price from the Uniswap V2 Router contract on Ethereum mainnet using the [Alloy](https://github.com/alloy-rs/alloy) library.

## Prerequisites

- **Rust** (1.76 or later) — Install from [rustup.rs](https://rustup.rs/)
- **Cargo** (included with Rust)
- Internet connection (the app queries a public Ethereum RPC endpoint)

## Build

```bash
cd backend
cargo build
```

For a release (optimized) build:

```bash
cargo build --release
```

## Run

```bash
cd backend
cargo run
```

Or run the compiled binary directly:

```bash
# Debug build
./target/debug/blockchain-backend

# Release build
./target/release/blockchain-backend
```

### Example Output

```
Current ETH Price in USDC: $1967.10
```

## How It Works

1. Connects to Ethereum mainnet via a public RPC endpoint (`https://eth.llamarpc.com`)
2. Uses the Alloy `sol!` macro to generate a type-safe Rust interface for the Uniswap V2 Router contract
3. Calls `getAmountsOut()` with 1 ETH to get the equivalent USDC amount
4. Formats and displays the current ETH price in USDC

## Dependencies

| Crate   | Version | Purpose                              |
|---------|---------|--------------------------------------|
| `alloy` | 0.1     | Ethereum provider, contract, and ABI |
| `tokio` | 1       | Async runtime                        |
| `eyre`  | 0.6     | Error handling                       |
