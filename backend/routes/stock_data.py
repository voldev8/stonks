from flask import Blueprint, request, jsonify
import yfinance as yf
import os
import json

stock_bp = Blueprint('stock_bp', __name__)

# http://127.0.0.1:5000/api/stock/AAPL?period=1mo&interval=1d
@stock_bp.route('/stock/<ticker>', methods=['GET'])
def get_stock_data(ticker):
    try:
        period = request.args.get('period', '1mo')
        interval = request.args.get('interval', '1d')
        stock = yf.Ticker(ticker)
        hist = stock.history(period=period, interval=interval)
        if hist.empty:
            return jsonify({"error": "No data found for the given ticker"}), 404
        hist.reset_index(inplace=True)
        hist['Date'] = hist['Date'].dt.strftime('%Y-%m-%d')  # Format the Date column
        data = hist.to_dict(orient="records")
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


    # period “1d”, “5d”, “1mo”, “3mo”, “6mo”, “1y”, “2y”, “5y”, “10y”, “ytd”, “max”
    # interval “1m”, “2m”, “5m”, “15m”, “30m”, “60m”, “90m”, “1h”, “1d”, “5d”, “1wk”, “1mo”, “3mo”
    # if interval == '1d':
    #     data = stock.history(period='1d', interval='1m')
    # elif interval == '5d':
    #     data = stock.history(period='5d', interval='5m')
    # elif interval == '1y':
    #     data = stock.history(period='1y', interval='1d')
    # else:
    #     return jsonify({"error": "Invalid interval"}), 400

# dummy data for testing
# http://127.0.0.1:5000/api/stock/dummy
@stock_bp.route('/stock/dummy', methods=['GET'])
def get_dummy_stock_data():
    try:
        dummy_data_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'dummy_stock_data_6m.json')
        with open(dummy_data_path, 'r') as f:
            data = json.load(f)
        return jsonify(data)
    except FileNotFoundError:
        return jsonify({"error": "Dummy data file not found"}), 404
    except json.JSONDecodeError:
        return jsonify({"error": "Error decoding dummy data file"}), 500  