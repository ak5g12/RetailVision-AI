import pandas as pd

def add_time_features(df: pd.DataFrame) -> pd.DataFrame:
    """Add time-based features to the DataFrame."""
    df['date'] = pd.to_datetime(df['date'])
    df['day_of_week'] = df['date'].dt.dayofweek
    df['month'] = df['date'].dt.month
    df['day'] = df['date'].dt.day
    return df

def add_lag_features(df: pd.DataFrame, lags=[1, 7]) -> pd.DataFrame:
    """Add lag features (previous sales) per product."""
    df = df.sort_values(by=['productId', 'date'])
    for lag in lags:
        df[f'qty_lag_{lag}'] = df.groupby('productId')['quantity'].shift(lag)
    return df

def prepare_features(data: list) -> pd.DataFrame:
    """Convert JSON data to DataFrame and run feature engineering."""
    df = pd.DataFrame(data)
    if df.empty:
        return df
    
    # We expect data to have: date, productId, quantity, revenue
    df = add_time_features(df)
    
    # We need a continuous date range for each product to make lags accurate
    # For a simple foundation, we'll just sort and lag based on existing dates.
    df = add_lag_features(df)
    
    # Drop rows with NaN (due to lag)
    df = df.dropna()
    
    return df
