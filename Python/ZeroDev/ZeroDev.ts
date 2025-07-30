import "dotenv/config"
import {
  createKernelAccount,
  createZeroDevPaymasterClient,
  createKernelAccountClient,
} from "@zerodev/sdk"
import { signerToEcdsaValidator } from "@zerodev/ecdsa-validator"
import { http, Hex, createPublicClient, zeroAddress } from "viem"
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts"
import { sepolia } from "viem/chains"
import { getEntryPoint, KERNEL_V3_1 } from "@zerodev/sdk/constants"

if (!process.env.ZERODEV_RPC) {
  throw new Error("ZERODEV_RPC is not set")
}

if (!process.env.ZERODEV_API_KEY) {
  throw new Error("ZERODEV_API_KEY is not set")
}

const chain = sepolia
const publicClient = createPublicClient({
  // Use your own RPC for public client in production
  transport: http(process.env.ZERODEV_RPC),
  chain,
})

const entryPoint = getEntryPoint("0.7")
const kernelVersion = KERNEL_V3_1

const main = async () => {
  console.log("=== Creating 3 Smart Accounts ===\n")

  const smartAccounts = []

  for (let i = 1; i <= 3; i++) {
    console.log(`Creating Smart Account ${i}...`)
    
    // Generate a new private key for each account
    const privateKey = generatePrivateKey()
    const signer = privateKeyToAccount(privateKey)
    
    console.log(`Private Key ${i}: ${privateKey}`)
    console.log(`Signer Address: ${signer.address}`)

    const ecdsaValidator = await signerToEcdsaValidator(publicClient, {
      signer,
      entryPoint,
      kernelVersion,
    })

    const account = await createKernelAccount(publicClient, {
      plugins: {
        sudo: ecdsaValidator,
      },
      entryPoint,
      kernelVersion,
    })

    smartAccounts.push({
      index: i,
      privateKey,
      signerAddress: signer.address,
      smartAccountAddress: account.address
    })

    console.log(`Smart Account ${i}: ${account.address}`)
    console.log("---")
  }

  console.log("\n=== Summary ===")
  smartAccounts.forEach(acc => {
    console.log(`Account ${acc.index}:`)
    console.log(`  Private Key: ${acc.privateKey}`)
    console.log(`  Signer Address: ${acc.signerAddress}`)
    console.log(`  Smart Account: ${acc.smartAccountAddress}`)
    console.log("")
  })

  console.log("All Smart Accounts created successfully!")
  process.exit(0);
}

main()