import os
import joblib
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error
import pandas as pd

MODEL_DIR = os.path.join(os.path.dirname(__file__), '../models')
MODEL_PATH = os.path.join(MODEL_DIR, 'demand_forecast_model.pkl')

def train_model(df: pd.DataFrame):
    if df.empty or len(df) < 10:
        raise ValueError("Insufficient data to train demand forecasting model. Need more historical sales.")
    
    # We want to predict 'quantity'
    # Features: day_of_week, month, day, qty_lag_1, qty_lag_7
    features = ['day_of_week', 'month', 'day', 'qty_lag_1', 'qty_lag_7']
    target = 'quantity'
    
    # Ensure all features exist
    for f in features:
        if f not in df.columns:
            raise ValueError(f"Missing required feature: {f}")
            
    X = df[features]
    y = df[target]
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    model = RandomForestRegressor(n_estimators=50, random_state=42)
    model.fit(X_train, y_train)
    
    predictions = model.predict(X_test)
    
    mae = mean_absolute_error(y_test, predictions)
    rmse = mean_squared_error(y_test, predictions) ** 0.5
    
    os.makedirs(MODEL_DIR, exist_ok=True)
    joblib.dump(model, MODEL_PATH)
    
    return {
        "mae": mae,
        "rmse": rmse,
        "samples_trained": len(X_train),
        "samples_tested": len(X_test)
    }

def predict_demand(features_dict: dict):
    if not os.path.exists(MODEL_PATH):
        raise ValueError("Model has not been trained yet.")
    
    model = joblib.load(MODEL_PATH)
    
    # Expected features: day_of_week, month, day, qty_lag_1, qty_lag_7
    df = pd.DataFrame([features_dict])
    
    prediction = model.predict(df)
    return float(prediction[0])
