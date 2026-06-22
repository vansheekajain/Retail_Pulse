import pandas as pd
import numpy as np
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error
import joblib
import json
import sys
import os

def create_features(df):
    df = df.copy()
    df['date'] = pd.to_datetime(df['date'])
    df['day_of_week']  = df['date'].dt.dayofweek
    df['day_of_month'] = df['date'].dt.day
    df['month']        = df['date'].dt.month
    df['week_of_year'] = df['date'].dt.isocalendar().week.astype(int)
    df['is_weekend']   = df['day_of_week'].isin([5, 6]).astype(int)

    # Lag features
    df = df.sort_values('date')
    df['lag_1']  = df['qty'].shift(1).fillna(0)
    df['lag_7']  = df['qty'].shift(7).fillna(0)
    df['lag_14'] = df['qty'].shift(14).fillna(0)

    # Rolling averages
    df['rolling_7']  = df['qty'].rolling(7,  min_periods=1).mean()
    df['rolling_14'] = df['qty'].rolling(14, min_periods=1).mean()
    df['rolling_30'] = df['qty'].rolling(30, min_periods=1).mean()

    return df

def train_model(data_path, model_path='model.joblib'):
    # Load data
    with open(data_path) as f:
        data = json.load(f)

    df = pd.DataFrame(data)
    if len(df) < 14:
        print("Not enough data to train — need at least 14 days")
        return None

    df = create_features(df)

    features = [
        'day_of_week', 'day_of_month', 'month',
        'week_of_year', 'is_weekend',
        'lag_1', 'lag_7', 'lag_14',
        'rolling_7', 'rolling_14', 'rolling_30',
        'price', 'festive_flag',
    ]

    # Fill missing columns
    for f in features:
        if f not in df.columns:
            df[f] = 0

    X = df[features].fillna(0)
    y = df['qty']

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled  = scaler.transform(X_test)

    model = GradientBoostingRegressor(
        n_estimators=100,
        max_depth=4,
        learning_rate=0.1,
        random_state=42,
    )
    model.fit(X_train_scaled, y_train)

    preds = model.predict(X_test_scaled)
    mae   = mean_absolute_error(y_test, preds)
    print(f"Model trained — MAE: {mae:.2f}")

    # Save model + scaler
    joblib.dump({ 'model': model, 'scaler': scaler, 'features': features }, model_path)
    print(f"Model saved to {model_path}")
    return model

if __name__ == '__main__':
    data_path  = sys.argv[1] if len(sys.argv) > 1 else 'data.json'
    model_path = sys.argv[2] if len(sys.argv) > 2 else 'model.joblib'
    train_model(data_path, model_path)