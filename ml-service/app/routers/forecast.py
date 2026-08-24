from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Dict, Any

from app.services.data_loader import fetch_sales_data
from app.services.feature_engineering import prepare_features
from app.services.demand_forecast import train_model, predict_demand

router = APIRouter()

class TrainRequest(BaseModel):
    token: str

class PredictRequest(BaseModel):
    day_of_week: int
    month: int
    day: int
    qty_lag_1: float
    qty_lag_7: float

@router.post("/train")
async def train_forecast_model(req: TrainRequest):
    try:
        # 1. Load data from Node API
        raw_data = await fetch_sales_data(req.token)
        
        # 2. Preprocess & Feature Engineering
        df = prepare_features(raw_data)
        
        # 3. Train
        metrics = train_model(df)
        
        return {"message": "Model trained successfully", "metrics": metrics}
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/predict")
def predict(req: PredictRequest):
    try:
        features = {
            "day_of_week": req.day_of_week,
            "month": req.month,
            "day": req.day,
            "qty_lag_1": req.qty_lag_1,
            "qty_lag_7": req.qty_lag_7
        }
        pred = predict_demand(features)
        return {"predicted_quantity": pred}
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
