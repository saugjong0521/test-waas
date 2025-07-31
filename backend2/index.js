import express from "express";
import cors from "cors";
import axios from "axios";
import { Buffer } from "buffer";

const app = express();
app.use(express.json());
app.use(cors());

const PRIVY_APP_ID = "cmdpl4wck03e7l70jwyuv6422";
const PRIVY_APP_SECRET = "5AyXhMtZ8StdJX8XDBg5K7WNgRrPXxKbS6dgxRcNQ64Bmyr91iJGhEKS4GUcqNcutdNxuTrk1XweZvin3eRreXRY";
const BASIC_AUTH = Buffer.from(`${PRIVY_APP_ID}:${PRIVY_APP_SECRET}`).toString("base64");

app.get("/", (req, res) => {
  res.send("✅ Privy Wallet Server is running");
});



// create wallet
app.post("/create-wallet", async (req, res) => {
  try {
    const { chainType = "ethereum" } = req.body;

    const response = await axios.post(
      "https://api.privy.io/v1/wallets",
      { chain_type: chainType },
      {
        headers: {
          Authorization: `Basic ${BASIC_AUTH}`,
          "Content-Type": "application/json",
          "privy-app-id": PRIVY_APP_ID,
        },
      }
    );

    res.json({ success: true, wallet: response.data });
  } catch (error) {
    console.error("❌ Wallet creation failed:", error.response?.data || error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});



// get balance
app.get("/wallet/:walletId/balance", async (req, res) => {
  const { walletId } = req.params;
  const { chain = "ethereum", asset = "eth" } = req.query;

  if (!walletId) {
    return res.status(400).json({ success: false, error: "walletId is required" });
  }

  try {
    const response = await axios.get(`https://api.privy.io/v1/wallets/${walletId}/balance`, {
      headers: {
        Authorization: `Basic ${BASIC_AUTH}`,
        "privy-app-id": PRIVY_APP_ID,
      },
      params: { chain, asset },
    });

    res.json({ success: true, data: response.data });
  } catch (error) {
    console.error("❌ Balance fetch failed:", error.response?.data || error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});



// send Tx
app.post("/send-transaction", async (req, res) => {
  const { walletId, to, valueEth, chainId = 11155111 } = req.body;

  if (!walletId || !to || !valueEth) {
    return res.status(400).json({ success: false, error: "walletId, to, valueEth are required" });
  }

  try {
    // Convert valueEth (e.g., "0.02") to wei in hex
    const weiBigInt = BigInt(Math.floor(Number(valueEth) * 1e18));
    const valueHex = "0x" + weiBigInt.toString(16);

    const response = await axios.post(
      `https://api.privy.io/v1/wallets/${walletId}/rpc`,
      {
        method: "eth_sendTransaction",
        caip2: `eip155:${chainId}`,
        chain_type: "ethereum",
        params: {
          transaction: {
            to,
            value: valueHex,
            type: 2, // EIP-1559
            gas_limit: "0x5208", // 21000
            max_fee_per_gas: "0xeade4ef",
            max_priority_fee_per_gas: "0x16d08b",
          },
        },
      },
      {
        headers: {
          Authorization: `Basic ${BASIC_AUTH}`,
          "Content-Type": "application/json",
          "privy-app-id": PRIVY_APP_ID,
        },
      }
    );

    console.log("✅ Transaction sent:", response.data);
    res.json({ success: true, tx: response.data });
  } catch (error) {
    console.error("❌ Transaction failed:", error.response?.data || error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(3000, () => {
  console.log("✅ Server running at http://localhost:3000");
});
