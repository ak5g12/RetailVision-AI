import pandas as pd
from sklearn.linear_model import LinearRegression
import joblib
import os

MODEL_PATH = "stock_out_model.pkl"

def train_stock_out_model(df: pd.DataFrame):
    if len(df) < 30:
        raise ValueError("Insufficient data. Need at least 30 records for stock-out model.")
    
    # We want to predict daily demand velocity
    # This is a very simple linear regression predicting quantity based on day_of_week and month
    X = df[['day_of_week', 'month']]
    y = df['quantity']
    
    model = LinearRegression()
    model.fit(X, y)
    
    joblib.dump(model, MODEL_PATH)
    
    return {"r2_score": model.score(X, y)}

def predict_stock_out_velocity(features: dict):
    if not os.path.exists(MODEL_PATH):
        raise ValueError("Model not trained yet.")
        
    model = joblib.load(MODEL_PATH)
    
    X_new = pd.DataFrame([features])
    predicted_velocity = model.predict(X_new)[0]
    
    return max(0.1, predicted_velocity) # Avoid zero or negative division later
