import pandas as pd
import numpy as np
import joblib
import json
import sys
from datetime import datetime, timedelta

FESTIVE_DATES = [
    '2025-03-14', '2025-03-30', '2025-06-06',
    '2025-09-22', '2025-10-02', '2025-10-20',
    '2025-12-25', '2025-12-31', '2026-01-26',
    '2026-03-03', '2026-03-20', '2026-05-27',
    '2026-08-15', '2026-10-11', '2026-10-20',
    '2026-11-08', '2026-12-25',
]

def is_festive(date_str):
    date = datetime.strptime(date_str, '%Y-%m-%d')
    for fd in FESTIVE_DATES:
        fdate = datetime.strptime(fd, '%Y-%m-%d')
        if abs((date - fdate).days) <= 3:
            return 1
    return 0

def predict(model_path, history_json, days=7, avg_price=100):
    try:
        saved   = joblib.load(model_path)
        model   = saved['model']
        scaler  = saved['scaler']
        features = saved['features']
    except Exception as e:
        print(json.dumps({ 'error': str(e) }))
        return

    history = json.loads(history_json) if isinstance(history_json, str) else history_json
    qtys    = [float(h.get('qty', 0)) for h in history]

    results = []
    rolling = qtys.copy()

    for i in range(1, days + 1):
        date = (datetime.now() + timedelta(days=i)).strftime('%Y-%m-%d')
        dow  = (datetime.now() + timedelta(days=i)).weekday()

        row = {
            'day_of_week':  dow,
            'day_of_month': (datetime.now() + timedelta(days=i)).day,
            'month':        (datetime.now() + timedelta(days=i)).month,
            'week_of_year': int((datetime.now() + timedelta(days=i)).strftime('%W')),
            'is_weekend':   1 if dow in [5, 6] else 0,
            'lag_1':        rolling[-1]  if len(rolling) >= 1  else 0,
            'lag_7':        rolling[-7]  if len(rolling) >= 7  else 0,
            'lag_14':       rolling[-14] if len(rolling) >= 14 else 0,
            'rolling_7':    np.mean(rolling[-7:])  if rolling else 0,
            'rolling_14':   np.mean(rolling[-14:]) if rolling else 0,
            'rolling_30':   np.mean(rolling[-30:]) if rolling else 0,
            'price':        avg_price,
            'festive_flag': is_festive(date),
        }

        X = pd.DataFrame([[row.get(f, 0) for f in features]], columns=features)
        X_scaled   = scaler.transform(X)
        predicted  = float(max(0, model.predict(X_scaled)[0]))

        # Confidence interval via bootstrap
        std_recent = np.std(rolling[-14:]) if len(rolling) >= 14 else predicted * 0.2
        ci_lower   = round(max(0, predicted - 1.96 * std_recent), 2)
        ci_upper   = round(predicted + 1.96 * std_recent, 2)

        results.append({
            'date':        date,
            'predicted':   round(predicted, 2),
            'ci_lower':    ci_lower,
            'ci_upper':    ci_upper,
            'festive_flag': bool(row['festive_flag']),
        })

        rolling.append(predicted)

    print(json.dumps(results))

if __name__ == '__main__':
    model_path   = sys.argv[1]
    history_json = sys.argv[2]
    days         = int(sys.argv[3]) if len(sys.argv) > 3 else 7
    avg_price    = float(sys.argv[4]) if len(sys.argv) > 4 else 100
    predict(model_path, history_json, days, avg_price)