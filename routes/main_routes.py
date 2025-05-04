from flask import Blueprint, render_template, jsonify, request, redirect, url_for
from utils.model_utils import ModelPredictor
import json
from datetime import datetime

main_bp = Blueprint('main', __name__)
predictor = ModelPredictor()

@main_bp.route('/')
def index():
    """Render the main page"""
    # Load the model if not already loaded
    if predictor.model is None:
        predictor.load_model()
    
    model_info = predictor.get_model_info()
    return render_template('index.html', model_info=model_info)

@main_bp.route('/documentation')
def documentation():
    """Render the API documentation page"""
    return render_template('documentation.html')

@main_bp.route('/history')
def history():
    """Render the prediction history page"""
    return render_template('history.html')