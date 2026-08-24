from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.data_loader import fetch_sales_data
from app.services.feature_engineering import prepare_features
from app.services.stock_out_model import train_stock_out_model, predict_stock_out_velocity

router = APIRouter()

class TrainRequest(BaseModel):
    token: str

class PredictRequest(BaseModel):
    day_of_week: int
    month: int

@router.post("/train")
async def train_stock_model(req: TrainRequest):
    try:
        raw_data = await fetch_sales_data(req.token)
        df = prepare_features(raw_data)
        metrics = train_stock_out_model(df)
        return {"message": "Stock-out model trained", "metrics": metrics}
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/predict")
def predict_velocity(req: PredictRequest):
    try:
        features = {
            "day_of_week": req.day_of_week,
            "month": req.month
        }
        velocity = predict_stock_out_velocity(features)
        return {"predicted_velocity": velocity}
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
