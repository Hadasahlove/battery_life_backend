import pickle
import numpy as np
from flask import Blueprint, request, jsonify

# Define Blueprint
api_bp = Blueprint('api', __name__)

# Simple cache to store the latest RUL value
rul_cache = {}

@api_bp.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    re = data.get('Re')
    rct = data.get('Rct')

    if re is None or rct is None:
        return jsonify({'status': 'error', 'message': 'Re and Rct are required'}), 400

    try:
        re = float(re)
        rct = float(rct)
    except ValueError:
        return jsonify({'status': 'error', 'message': 'Re and Rct must be numbers'}), 400

    degradation_feature = re * rct
    predicted_rul = 1000 / (degradation_feature + 1)

    # Store in cache
    rul_cache['predicted_RUL'] = predicted_rul

    return jsonify({
        'status': 'success',
        'message': 'RUL computed using degradation formula.',
        'Re': re,
        'Rct': rct,
        'degradation_feature': round(degradation_feature, 5),
        'predicted_RUL': round(predicted_rul, 2)
    })


@api_bp.route('/battery-life-years', methods=['POST'])
def battery_life_years():
    if 'predicted_RUL' not in rul_cache:
        return jsonify({'status': 'error', 'message': 'RUL not yet predicted. Please call /predict first.'}), 400

    data = request.get_json()
    try:
        mileage_per_cycle = float(data['mileage_per_cycle'])
        average_daily_mileage = float(data['average_daily_mileage'])
    except (KeyError, ValueError):
        return jsonify({
            'status': 'error',
            'message': 'Please provide valid mileage_per_cycle and average_daily_mileage.'
        }), 400

    predicted_rul = rul_cache['predicted_RUL']
    total_mileage = predicted_rul * mileage_per_cycle
    estimated_life_years = total_mileage / (average_daily_mileage * 365)

    return jsonify({
        'status': 'success',
        'message': 'Battery lifespan estimated using cached RUL.',
        'predicted_RUL': round(predicted_rul, 2),
        'mileage_per_cycle': mileage_per_cycle,
        'average_daily_mileage': average_daily_mileage,
        'total_mileage': round(total_mileage, 2),
        'estimated_lifespan_years': round(estimated_life_years, 2)
    })
