from fastapi import FastAPI
from app.routers import forecast, stock_out, segmentation, anomaly

app = FastAPI(title="RetailVision ML Service")

app.include_router(forecast.router, prefix="/api/forecast", tags=["Forecast"])
app.include_router(stock_out.router, prefix="/api/stock-out", tags=["Stock Out"])
app.include_router(segmentation.router, prefix="/api/segmentation", tags=["Segmentation"])
app.include_router(anomaly.router, prefix="/api/anomaly", tags=["Anomaly"])

@app.get("/api/health")
def health_check():
    return {"status": "ML Service is healthy"}
