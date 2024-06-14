from flask import Blueprint, request, jsonify
import yfinance as yf
import os
import json

stock_bp = Blueprint('stock_bp', __name__)

@stock_bp.route('/test', methods=['GET'])
def get_dummy_stock_data():
    dummy_data_path = os.path.join(os.path.dirname(__file__),'..', 'data', 'dummy_stock_data.json')
    with open(dummy_data_path, 'r') as f:
        data = json.load(f)
    # return jsonify(data)
    return jsonify({"message": "Welcome to the Stock Data API"})