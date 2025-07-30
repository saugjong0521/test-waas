import { PrivyClient } from "@privy-io/server-auth";
import express from "express";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("✅ Privy Wallet Server is running");
});

const PRIVY_APP_ID = "cmdig80iv00umjp0j73mz0xww";
const PRIVY_API_KEY = "3FrNXCMtyzNHL9g6hkQ4BtroezjuP855v8XVAAfELgoTcnHQgKxojE9NyhX4wPt6nDjEFYPgXSXyFtyby7oyioQr";

console.log("App ID:", PRIVY_APP_ID);
console.log("API Key:", PRIVY_API_KEY);

const privy = new PrivyClient(PRIVY_APP_ID, {
  apiKey: PRIVY_API_KEY,
});

app.post("/create-wallet", async (req, res) => {
  try {
    const { customUserId } = req.body;

    if (!customUserId) {
      return res.status(400).json({
        success: false,
        error: "customUserId is required",
      });
    }

    console.log("Creating user with ID:", customUserId);

    const user = await privy.importUser({
      linkedAccounts: [
        {
          type: "custom_auth",
          customUserId: customUserId,
        },
      ],
      wallets: [{ chainType: "ethereum" }],
    });

    const address = user?.wallets?.[0]?.address;
    console.log("✅ Wallet created for user:", customUserId);
    console.log("✅ Wallet address:", address);

    res.json({
      success: true,
      address,
      userId: customUserId,
      user: user,
    });
  } catch (e) {
    console.error("❌ Wallet creation failed:", e);
    res.status(500).json({ success: false, error: e.message });
  }
});

// 특정 사용자 정보 조회
app.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await privy.getUser(userId);
    res.json({ success: true, user });
  } catch (e) {
    console.error("❌ User fetch failed:", e);
    res.status(500).json({ success: false, error: e.message });
  }
});

// 모든 사용자 목록 조회
app.get("/users", async (req, res) => {
  try {
    const users = await privy.getUsers();
    res.json({ success: true, users });
  } catch (e) {
    console.error("❌ Users fetch failed:", e);
    res.status(500).json({ success: false, error: e.message });
  }
});

app.listen(3000, () => {
  console.log("✅ Server running at http://localhost:3000");
});
