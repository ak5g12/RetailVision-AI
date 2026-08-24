import pandas as pd
from sklearn.ensemble import IsolationForest
import joblib
import os

MODEL_PATH = "anomaly_model.pkl"

def train_anomaly_model(df: pd.DataFrame):
    if len(df) < 14:
        raise ValueError("Insufficient data. Need at least 14 days of history for anomaly detection.")
        
    features = ['revenue', 'orders']
    X = df[features]
    
    # Isolation Forest for unsupervised anomaly detection
    # contamination is the expected proportion of outliers. We'll set a modest 5%.
    model = IsolationForest(contamination=0.05, random_state=42)
    model.fit(X)
    
    joblib.dump(model, MODEL_PATH)
    
    return {"message": "Isolation Forest model trained"}

def predict_anomalies(df: pd.DataFrame):
    if not os.path.exists(MODEL_PATH):
        raise ValueError("Model not trained yet.")
        
    model = joblib.load(MODEL_PATH)
    features = ['revenue', 'orders']
    X = df[features]
    
    preds = model.predict(X)
    scores = model.decision_function(X)
    
    results = []
    for i, p in enumerate(preds):
        # Isolation Forest predict returns 1 for inliers, -1 for outliers
        is_anomaly = bool(p == -1)
        # Score is lower for more anomalous points, we invert it for readability
        score = float(-scores[i])
        
        severity = "NORMAL"
        if is_anomaly:
            if score > 0.15:
                severity = "HIGH"
            else:
                severity = "MEDIUM"
                
        results.append({
            "date": df.iloc[i]['date'],
            "revenue": float(df.iloc[i]['revenue']),
            "orders": int(df.iloc[i]['orders']),
            "is_anomaly": is_anomaly,
            "score": score,
            "severity": severity
        })
        
    return results
