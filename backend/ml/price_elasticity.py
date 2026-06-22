import numpy as np
import pandas as pd
import json
import sys
from sklearn.linear_model import LinearRegression

def calculate_elasticity(sales_data):
    """
    Calculate price elasticity of demand.
    sales_data: list of { price, qty } objects
    """
    df = pd.DataFrame(sales_data)

    if len(df) < 5:
        print(json.dumps({ 'error': 'Need at least 5 data points' }))
        return

    # Remove zeros
    df = df[(df['price'] > 0) & (df['qty'] > 0)]

    if len(df) < 3:
        print(json.dumps({ 'error': 'Not enough valid data points' }))
        return

    # Log transformation for elasticity
    df['log_price'] = np.log(df['price'])
    df['log_qty']   = np.log(df['qty'])

    X = df[['log_price']].values
    y = df['log_qty'].values

    model = LinearRegression()
    model.fit(X, y)

    elasticity = model.coef_[0]

    # Price vs demand chart data
    price_range = np.linspace(df['price'].min(), df['price'].max(), 20)
    pred_qty    = np.exp(model.predict(np.log(price_range).reshape(-1, 1)))

    chart_data = [
        { 'price': round(float(p), 2), 'predicted_qty': round(float(q), 2) }
        for p, q in zip(price_range, pred_qty)
    ]

    result = {
        'elasticity':       round(float(elasticity), 3),
        'interpretation':   interpret_elasticity(elasticity),
        'optimal_price':    find_optimal_price(df, model),
        'chart_data':       chart_data,
        'data_points':      len(df),
        'r_squared':        round(float(model.score(X, y)), 3),
    }

    print(json.dumps(result))

def interpret_elasticity(e):
    if e < -1:
        return 'Elastic — customers are price sensitive. Lowering price increases revenue.'
    elif e > -1 and e < 0:
        return 'Inelastic — customers are not very price sensitive. You can raise price slightly.'
    else:
        return 'Positive elasticity — unusual pattern, check data quality.'

def find_optimal_price(df, model):
    # Find price that maximizes revenue (price × qty)
    price_range = np.linspace(df['price'].min() * 0.8, df['price'].max() * 1.2, 100)
    revenues    = []
    for p in price_range:
        q = np.exp(model.predict([[np.log(p)]])[0])
        revenues.append(p * q)
    optimal_idx = np.argmax(revenues)
    return round(float(price_range[optimal_idx]), 2)

if __name__ == '__main__':
    data = json.loads(sys.argv[1])
    calculate_elasticity(data)