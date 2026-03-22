use alloy::primitives::{address, uint};
use alloy::providers::{Provider, ProviderBuilder};
use alloy::sol;
use axum::{
    extract::State,
    routing::get,
    Router,
    http::HeaderValue,
};
use serde::Serialize;
use std::net::SocketAddr;
use std::sync::Arc;
use std::time::Duration;
use tokio::sync::RwLock;
use tokio::time::timeout;
use tower_http::cors::{Any, CorsLayer};
use tracing::{info, warn, error, debug, instrument, Level};
use tracing_subscriber;

// 1. Generate the Rust interface for the Uniswap Router contract using its ABI
sol!(
    #[sol(rpc)]
    interface IUniswapV2Router {
        function getAmountsOut(uint amountIn, address[] calldata path) external view returns (uint[] memory amounts);
    }
);

// Response structure for the Uniswap price API
#[derive(Serialize)]
struct PriceResponse {
    eth_price: f64,
    timestamp: String,
}

// Structure for storing gas price data
#[derive(Debug, Clone, Serialize)]
struct GasPriceData {
    safe_gwei: f64,
    propose_gwei: f64,
    fast_gwei: f64,
    base_fee_gwei: f64,
    last_block: u64,
    timestamp: String,
}

// Structure for cached gas price data with timestamp
#[derive(Debug, Clone)]
struct CachedGasPrice {
    data: GasPriceData,
    fetched_at: std::time::Instant,
}

// Shared application state
#[derive(Clone)]
struct AppState {
    gas_price_cache: Arc<RwLock<Option<CachedGasPrice>>>,
}

// Configuration constants
const CACHE_TTL_SECONDS: u64 = 10;
const RPC_REQUEST_TIMEOUT_SECONDS: u64 = 5;
const GAS_PRICE_REQUEST_TIMEOUT_SECONDS: u64 = 7; // Slightly longer for gas price + block data

// List of RPC endpoints to try (in order of preference)
const RPC_ENDPOINTS: &[&str] = &[
    "https://eth.llamarpc.com",
    "https://rpc.ankr.com/eth",
    "https://cloudflare-eth.com",
    "https://ethereum.publicnode.com",
    "https://1rpc.io/eth",
];

// Initialize tracing/logging
fn init_logging() {
    tracing_subscriber::fmt()
        .with_max_level(Level::INFO)
        .with_target(false)
        .with_thread_ids(false)
        .with_thread_names(false)
        .compact()
        .init();
    info!("Logging initialized");
}

// Function to get ETH price from Uniswap
#[instrument(name = "get_eth_price", level = "info")]
async fn get_eth_price() -> Result<PriceResponse, String> {
    info!("Fetching ETH price from Uniswap");
    
    // Setup the Provider (using a free public RPC)
    let rpc_url = "https://eth.llamarpc.com"
        .parse()
        .map_err(|e| format!("Failed to parse RPC URL: {}", e))?;
    
    let provider = ProviderBuilder::new()
        .on_http(rpc_url);

    // Define the Contract and Token Addresses
    let router_address = address!("7a250d5630B4cF539739dF2C5dAcb4c659F2488D"); // Uniswap V2 Router
    let weth = address!("C02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2");
    let usdc = address!("A0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48");

    // Create a contract instance
    let router =  IUniswapV2Router::new(router_address, provider);

    // Query the price: [InputToken, OutputToken]
    let path = vec![weth, usdc];
    let amount_in = uint!(1_000_000_000_000_000_000_U256); // 1 ETH (18 decimals)

    info!("Calling getAmountsOut on Uniswap V2 Router");
    let start_time = std::time::Instant::now();
    
    let amounts = timeout(
        Duration::from_secs(RPC_REQUEST_TIMEOUT_SECONDS),
        router.getAmountsOut(amount_in, path).call()
    )
    .await
    .map_err(|_| format!("RPC request timeout after {} seconds", RPC_REQUEST_TIMEOUT_SECONDS))?
    .map_err(|e| format!("Failed to call contract: {}", e))?;

    let elapsed = start_time.elapsed();
    info!("Uniswap price fetched in {:.2}ms", elapsed.as_millis());

    // Format the price (USDC has 6 decimals)
    let price = amounts.amounts[1]
        .to_string()
        .parse::<f64>()
        .map_err(|e| format!("Failed to parse price: {}", e))? 
        / 1_000_000.0;

    // Get current timestamp
    let timestamp = chrono::Utc::now().to_rfc3339();

    info!("ETH price: ${:.2} USDC", price);
    Ok(PriceResponse {
        eth_price: price,
        timestamp,
    })
}

// Fetch gas price from a single RPC endpoint with timeout
#[instrument(name = "fetch_gas_from_endpoint", level = "debug", skip(rpc_url_str))]
async fn fetch_gas_from_endpoint(rpc_url_str: &str) -> Result<GasPriceData, String> {
    debug!("Fetching gas price from {}", rpc_url_str);
    
    let rpc_url = rpc_url_str
        .parse()
        .map_err(|e| format!("Failed to parse RPC URL: {}", e))?;
    
    let provider = ProviderBuilder::new()
        .on_http(rpc_url);

    // Get gas price with timeout
    let start_time = std::time::Instant::now();
    let gas_price = timeout(
        Duration::from_secs(RPC_REQUEST_TIMEOUT_SECONDS),
        provider.get_gas_price()
    )
    .await
    .map_err(|_| format!("Gas price request timeout after {} seconds", RPC_REQUEST_TIMEOUT_SECONDS))?
    .map_err(|e| format!("Failed to fetch gas price: {}", e))?;

    let gas_price_elapsed = start_time.elapsed();
    debug!("Gas price fetched from {} in {:.2}ms", rpc_url_str, gas_price_elapsed.as_millis());
    
    // Convert from wei to gwei (1 gwei = 10^9 wei)
    let gas_price_gwei = gas_price.to_string().parse::<f64>()
        .map_err(|e| format!("Failed to parse gas price: {}", e))? / 1_000_000_000.0;
    
    // For simplicity, we'll use the same value for all gas price tiers
    // In a real implementation, you might want to get more detailed estimates
    let safe_gwei = gas_price_gwei * 0.9; // 10% lower than current
    let propose_gwei = gas_price_gwei; // Current gas price
    let fast_gwei = gas_price_gwei * 1.1; // 10% higher than current
    
    // Try to get the latest block for additional data (with separate timeout)
    let (last_block, base_fee_gwei) = match timeout(
        Duration::from_secs(2), // Shorter timeout for block data
        provider.get_block_by_number(alloy::rpc::types::BlockNumberOrTag::Latest, false)
    )
    .await
    {
        Ok(Ok(Some(block))) => {
            let block_num = block.header.number.unwrap_or_default();
            let base_fee = match block.header.base_fee_per_gas {
                Some(fee) => {
                    fee.to_string().parse::<f64>()
                        .map_err(|e| format!("Failed to parse base fee: {}", e))? / 1_000_000_000.0
                }
                None => 0.0,
            };
            (block_num, base_fee)
        }
        _ => {
            warn!("Failed to fetch block data from {}", rpc_url_str);
            (0, 0.0) // Default values if block fetch fails or times out
        }
    };
    
    let total_elapsed = start_time.elapsed();
    info!("Successfully fetched gas price from {} in {:.2}ms", rpc_url_str, total_elapsed.as_millis());
    
    Ok(GasPriceData {
        safe_gwei,
        propose_gwei,
        fast_gwei,
        base_fee_gwei,
        last_block,
        timestamp: chrono::Utc::now().to_rfc3339(),
    })
}

// Function to fetch gas prices with parallel requests
#[instrument(name = "fetch_gas_prices", level = "info")]
async fn fetch_gas_prices() -> Result<GasPriceData, String> {
    info!("Starting parallel gas price fetch from {} endpoints", RPC_ENDPOINTS.len());
    
    let start_time = std::time::Instant::now();
    
    // Create tasks for all endpoints
    let mut tasks = Vec::new();
    for &endpoint in RPC_ENDPOINTS {
        let endpoint_str = endpoint.to_string();
        tasks.push(tokio::spawn(async move {
            match timeout(
                Duration::from_secs(RPC_REQUEST_TIMEOUT_SECONDS),
                fetch_gas_from_endpoint(&endpoint_str)
            ).await {
                Ok(Ok(result)) => Ok(result),
                Ok(Err(err)) => Err(err),
                Err(_) => Err(format!("Request timeout for {}", endpoint_str)),
            }
        }));
    }
    
    // Wait for the first successful result
    let mut last_error = None;
    for task in tasks {
        match timeout(
            Duration::from_secs(GAS_PRICE_REQUEST_TIMEOUT_SECONDS),
            task
        ).await {
            Ok(Ok(Ok(result))) => {
                let elapsed = start_time.elapsed();
                info!("Gas price fetched successfully in {:.2}ms", elapsed.as_millis());
                return Ok(result);
            }
            Ok(Ok(Err(err))) => {
                warn!("Endpoint failed: {}", err);
                last_error = Some(err);
            }
            Ok(Err(join_err)) => {
                warn!("Task join error: {}", join_err);
            }
            Err(_) => {
                warn!("Task timeout");
            }
        }
    }
    
    let elapsed = start_time.elapsed();
    error!("All {} RPC endpoints failed after {:.2}ms", RPC_ENDPOINTS.len(), elapsed.as_millis());
    Err(format!("All RPC endpoints failed. Last error: {:?}", last_error))
}

// Get gas prices with caching
#[instrument(name = "get_gas_prices_with_cache", level = "info", skip(state))]
async fn get_gas_prices_with_cache(state: AppState) -> Result<GasPriceData, String> {
    // Check cache first
    let cache = state.gas_price_cache.read().await;
    
    if let Some(cached) = &*cache {
        // Check if cache is still valid (less than CACHE_TTL_SECONDS old)
        let elapsed = cached.fetched_at.elapsed();
        if elapsed.as_secs() < CACHE_TTL_SECONDS {
            info!("Returning cached gas price data ({} seconds old)", elapsed.as_secs());
            return Ok(cached.data.clone());
        }
        info!("Cache expired ({} seconds old), fetching fresh data", elapsed.as_secs());
    } else {
        debug!("No cache found, fetching fresh data");
    }
    
    // Cache is stale or doesn't exist, fetch fresh data
    drop(cache); // Release read lock before acquiring write lock
    
    info!("Fetching fresh gas price data...");
    let gas_data = fetch_gas_prices().await?;
    
    // Update cache
    let mut cache = state.gas_price_cache.write().await;
    *cache = Some(CachedGasPrice {
        data: gas_data.clone(),
        fetched_at: std::time::Instant::now(),
    });
    
    info!("Gas price cache updated");
    Ok(gas_data)
}

// Handler for the /api/uniswap/price endpoint
#[instrument(name = "uniswap_price_handler", level = "info")]
async fn uniswap_price_handler() -> axum::Json<PriceResponse> {
    let start_time = std::time::Instant::now();
    
    match get_eth_price().await {
        Ok(price) => {
            let elapsed = start_time.elapsed();
            info!("Uniswap price request completed in {:.2}ms", elapsed.as_millis());
            axum::Json(price)
        }
        Err(err) => {
            error!("Failed to fetch Uniswap price: {}", err);
            let elapsed = start_time.elapsed();
            warn!("Uniswap price request failed after {:.2}ms", elapsed.as_millis());
            // Return a default error response
            axum::Json(PriceResponse {
                eth_price: 0.0,
                timestamp: chrono::Utc::now().to_rfc3339(),
            })
        }
    }
}

// Handler for the /api/gas/price endpoint
#[instrument(name = "gas_price_handler", level = "info", skip(state))]
async fn gas_price_handler(State(state): State<AppState>) -> axum::Json<GasPriceData> {
    let start_time = std::time::Instant::now();
    
    match get_gas_prices_with_cache(state).await {
        Ok(gas_data) => {
            let elapsed = start_time.elapsed();
            info!("Gas price request completed in {:.2}ms", elapsed.as_millis());
            axum::Json(gas_data)
        }
        Err(e) => {
            error!("Error fetching gas prices: {}", e);
            let elapsed = start_time.elapsed();
            warn!("Gas price request failed after {:.2}ms", elapsed.as_millis());
            // Return a default error response instead of None
            axum::Json(GasPriceData {
                safe_gwei: 0.0,
                propose_gwei: 0.0,
                fast_gwei: 0.0,
                base_fee_gwei: 0.0,
                last_block: 0,
                timestamp: chrono::Utc::now().to_rfc3339(),
            })
        }
    }
}

// Diagnostic endpoint for RPC health
#[instrument(name = "rpc_health_handler", level = "info")]
async fn rpc_health_handler() -> axum::Json<serde_json::Value> {
    info!("RPC health check requested");
    
    let mut results = Vec::new();
    let mut tasks = Vec::new();
    
    // Test all RPC endpoints in parallel
    for &endpoint in RPC_ENDPOINTS {
        let endpoint_str = endpoint.to_string();
        tasks.push(tokio::spawn(async move {
            let start_time = std::time::Instant::now();
            match timeout(
                Duration::from_secs(3),
                fetch_gas_from_endpoint(&endpoint_str)
            )
            .await
            {
                Ok(Ok(gas_data)) => {
                    let elapsed = start_time.elapsed();
                    serde_json::json!({
                        "endpoint": endpoint_str,
                        "status": "healthy",
                        "response_time_ms": elapsed.as_millis(),
                        "gas_price_gwei": gas_data.propose_gwei,
                        "last_block": gas_data.last_block,
                    })
                }
                Ok(Err(err)) => {
                    let elapsed = start_time.elapsed();
                    serde_json::json!({
                        "endpoint": endpoint_str,
                        "status": "error",
                        "response_time_ms": elapsed.as_millis(),
                        "error": err,
                    })
                }
                Err(_) => {
                    serde_json::json!({
                        "endpoint": endpoint_str,
                        "status": "timeout",
                        "response_time_ms": 3000,
                        "error": "Request timeout after 3 seconds",
                    })
                }
            }
        }));
    }
    
    // Collect all results
    for task in tasks {
        match task.await {
            Ok(result) => results.push(result),
            Err(_) => results.push(serde_json::json!({
                "endpoint": "unknown",
                "status": "task_failed",
                "error": "Task failed to complete",
            })),
        }
    }
    
    axum::Json(serde_json::json!({
        "timestamp": chrono::Utc::now().to_rfc3339(),
        "endpoints_tested": RPC_ENDPOINTS.len(),
        "results": results,
    }))
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Initialize structured logging
    init_logging();
    
    info!("Starting blockchain backend server");
    
    // Initialize shared state
    let state = AppState {
        gas_price_cache: Arc::new(RwLock::new(None)),
    };
    
    // Configure CORS
    let allowed_origins = vec![
        "http://localhost:5173".parse::<HeaderValue>().unwrap(), // Vite's default port
        "http://localhost:3001".parse::<HeaderValue>().unwrap(), // Alternative port
    ];
    let cors = CorsLayer::new()
        .allow_origin(allowed_origins)
        .allow_methods(Any)
        .allow_headers(Any);

    // Build the router with shared state
    let app = Router::new()
        .route("/api/uniswap/price", get(uniswap_price_handler))
        .route("/api/gas/price", get(gas_price_handler))
        .route("/api/health/rpc", get(rpc_health_handler)) // New diagnostic endpoint
        .with_state(state)
        .layer(cors);

    // Start the server
    let addr = SocketAddr::from(([127, 0, 0, 1], 8080));
    info!("Server running at http://{}", addr);
    info!("Gas price fetching: On-demand with {} second cache", CACHE_TTL_SECONDS);
    info!("RPC request timeout: {} seconds", RPC_REQUEST_TIMEOUT_SECONDS);
    info!("Available endpoints:");
    info!("  GET /api/uniswap/price - Get ETH price from Uniswap");
    info!("  GET /api/gas/price - Get current gas prices from chain (fetched on-demand)");
    info!("  GET /api/health/rpc - Diagnostic endpoint for RPC health");

    let listener = tokio::net::TcpListener::bind(addr).await?;
    info!("Listening on {}", addr);
    
    axum::serve(listener, app).await?;

    Ok(())
}