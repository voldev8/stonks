from flask import Flask, jsonify
from flask_cors import CORS
from routes.stock_data import stock_bp
import logging

app = Flask(__name__)
CORS(app)

@app.route('/')
def index():
    return jsonify({"message": "Welcome to the Stock Data API"})

app.register_blueprint(stock_bp, url_prefix='/api')

if __name__ == '__main__':
    logging.basicConfig(level=logging.DEBUG)
    app.run(debug=True)