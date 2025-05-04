# utils/model_utils.py
import os
import joblib
import numpy as np
import pandas as pd

class ModelPredictor:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(ModelPredictor, cls).__new__(cls)
            cls._instance._model = None
        return cls._instance

    def __init__(self):
        self.model_path = os.path.join('models', 'rf2_model.pkl')

    def load_model(self):
        try:
            print(f"Attempting to load model from {self.model_path}")
            self._model = joblib.load(self.model_path)
            print("Model loaded successfully")
            return True
        except FileNotFoundError:
            print(f"Model file not found at {self.model_path}")
            return False
        except Exception as e:
            print(f"Error loading model: {str(e)}")
            return False

    @property
    def model(self):
        if self._model is None:
            self.load_model()
        return self._model

    def predict(self, input_dict):
        if self.model is None:
            return None, "Model not loaded"

        try:
            expected_columns = [
                'Capacity',
                'ambient_temperature',
                'battery_id',
                'test_id',
                'type',
                'degradation_feature',
                'uid'
            ]
            input_df = pd.DataFrame([input_dict], columns=expected_columns)
            print(f"Predicting with input: {input_df.to_dict()}")
            prediction = self.model.predict(input_df)[0]
            return prediction, None
        except Exception as e:
            return None, f"Prediction error: {str(e)}"

    def get_model_info(self):
        if self.model is None:
            return {"status": "Not loaded"}
        try:
            return {
                "status": "Loaded",
                "type": type(self.model).__name__,
                "features": 7,
            }
        except Exception as e:
            return {"status": f"Error: {str(e)}"}
