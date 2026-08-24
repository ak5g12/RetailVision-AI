import pandas as pd
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
import joblib
import os
import json

MODEL_PATH = "segmentation_model.pkl"
SCALER_PATH = "segmentation_scaler.pkl"
CENTROIDS_PATH = "segmentation_centroids.json"

def train_segmentation_model(df: pd.DataFrame):
    if len(df) < 10:
        raise ValueError("Insufficient data. Need at least 10 customers for clustering.")
        
    features = ['recency', 'frequency', 'monetary']
    X = df[features]
    
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    # 4 clusters: High Value, Regular, Occasional, At Risk (just as an example structure)
    n_clusters = min(4, len(df)) 
    kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
    kmeans.fit(X_scaled)
    
    joblib.dump(kmeans, MODEL_PATH)
    joblib.dump(scaler, SCALER_PATH)
    
    # Interpret clusters
    df['cluster'] = kmeans.labels_
    cluster_means = df.groupby('cluster')[features].mean().reset_index()
    
    # Simple heuristic to name clusters based on monetary and frequency
    # We'll save the cluster centers mapping
    mapping = {}
    for _, row in cluster_means.iterrows():
        cluster_id = int(row['cluster'])
        m = row['monetary']
        f = row['frequency']
        r = row['recency']
        
        # Basic logic for labels
        if m > cluster_means['monetary'].mean() and f > cluster_means['frequency'].mean():
            label = "High Value"
        elif r > cluster_means['recency'].mean() and f < cluster_means['frequency'].mean():
            label = "At Risk"
        elif f >= 2:
            label = "Regular"
        else:
            label = "Occasional"
            
        mapping[cluster_id] = {
            "label": label,
            "avg_recency": r,
            "avg_frequency": f,
            "avg_monetary": m
        }
        
    with open(CENTROIDS_PATH, "w") as f:
        json.dump(mapping, f)
        
    return {"clusters_found": n_clusters, "mapping": mapping}


def predict_segments(df: pd.DataFrame):
    if not os.path.exists(MODEL_PATH) or not os.path.exists(SCALER_PATH) or not os.path.exists(CENTROIDS_PATH):
        raise ValueError("Model not trained yet.")
        
    kmeans = joblib.load(MODEL_PATH)
    scaler = joblib.load(SCALER_PATH)
    
    with open(CENTROIDS_PATH, "r") as f:
        mapping = json.load(f)
        
    features = ['recency', 'frequency', 'monetary']
    X = df[features]
    X_scaled = scaler.transform(X)
    
    preds = kmeans.predict(X_scaled)
    
    results = []
    for i, p in enumerate(preds):
        cluster_id = str(p)
        results.append({
            "customer_id": df.iloc[i]['customer_id'],
            "segment": mapping[cluster_id]["label"],
            "cluster_id": p
        })
        
    return results
