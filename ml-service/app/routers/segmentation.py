from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
import pandas as pd

from app.services.customer_segmentation import train_segmentation_model, predict_segments

router = APIRouter()

class CustomerData(BaseModel):
    customer_id: str
    recency: float
    frequency: float
    monetary: float

class SegmentRequest(BaseModel):
    customers: List[CustomerData]

@router.post("/train")
def train_model(req: SegmentRequest):
    try:
        if not req.customers:
            raise ValueError("No customer data provided")
            
        # Convert to pandas
        df = pd.DataFrame([c.dict() for c in req.customers])
        metrics = train_segmentation_model(df)
        
        return {"message": "Segmentation model trained", "metrics": metrics}
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/predict")
def predict(req: SegmentRequest):
    try:
        if not req.customers:
            raise ValueError("No customer data provided")
            
        df = pd.DataFrame([c.dict() for c in req.customers])
        results = predict_segments(df)
        
        return {"predictions": results}
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
