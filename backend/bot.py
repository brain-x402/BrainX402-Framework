import asyncio
from solana.rpc.async_api import AsyncClient

async def check_balance(pubkey: str):
    client = AsyncClient("https://api.mainnet-beta.solana.com")
    balance = await client.get_balance(pubkey)
    print(f"Balance for {pubkey}: {balance['result']['value']} SOL")
    await client.close()

asyncio.run(check_balance("So11111111111111111111111111111111111111112"))
