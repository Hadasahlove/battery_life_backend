# RUL Predictor - Battery Life Estimation System

A Flask application for predicting the Remaining Useful Life (RUL) of batteries based on their electrochemical impedance parameters.

## Features

- Modern, responsive web interface for inputting battery parameters
- RESTful API for programmatic access
- Visualization of prediction results
- Historical prediction tracking
- Dark/light theme support

## Installation

1. Clone this repository:
   ```
   git clone <repository-url>
   cd rul-predictor
   ```

2. Create a virtual environment and activate it:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows, use venv\Scripts\activate
   ```

3. Install the required dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Place your trained model file (`rf2_model.pkl`) in the `models` directory.

## Running the Application

1. Start the application:
   ```
   python run.py
   ```

2. Open your browser and navigate to:
   ```
   http://127.0.0.1:5000/
   ```

## API Usage

### Predict RUL

**Endpoint:** `/api/predict`
**Method:** `POST`
**Content-Type:** `application/json`

**Request Body:**
```json
{
  "Re": 1.0,
  "Rct": 2.0
}
```

**Response:**
```json
{
  "predicted_RUL": 1200.5,
  "input": {
    "Re": 1.0,
    "Rct": 2.0,
    "degradation": 2.0
  }
}
```

## Model Information

The application uses a pre-trained Random Forest model to predict battery RUL based on the degradation factor calculated from Ohmic resistance (Re) and Charge transfer resistance (Rct) values.

## License

[MIT License](LICENSE)