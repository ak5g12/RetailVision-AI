from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
import pandas as pd

from app.services.anomaly_detection import train_anomaly_model, predict_anomalies

router = APIRouter()

class TimeSeriesData(BaseModel):
    date: str
    revenue: float
    orders: int

class AnomalyRequest(BaseModel):
    data: List[TimeSeriesData]

@router.post("/train")
def train_model(req: AnomalyRequest):
    try:
        if not req.data:
            raise ValueError("No data provided")
            
        df = pd.DataFrame([d.dict() for d in req.data])
        metrics = train_anomaly_model(df)
        
        return {"message": "Anomaly model trained", "metrics": metrics}
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/predict")
def predict(req: AnomalyRequest):
    try:
        if not req.data:
            raise ValueError("No data provided")
            
        df = pd.DataFrame([d.dict() for d in req.data])
        results = predict_anomalies(df)
        
        return {"predictions": results}
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
