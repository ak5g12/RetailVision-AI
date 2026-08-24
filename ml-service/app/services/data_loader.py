import httpx
import os

NODE_API_URL = os.getenv("NODE_API_URL", "http://127.0.0.1:5000/api")

async def fetch_sales_data(token: str):
    """Fetch structured historical sales data from the Node.js backend."""
    async with httpx.AsyncClient() as client:
        headers = {"Authorization": f"Bearer {token}"}
        # The node backend endpoint we just created
        response = await client.get(f"{NODE_API_URL}/analytics/ml/sales-data", headers=headers)
        if response.status_code != 200:
            raise Exception(f"Failed to fetch sales data: {response.text}")
        return response.json()
