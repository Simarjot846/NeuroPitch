# NeuroPitch 🏏

NeuroPitch is a real-time cricket decision support system powered by machine learning and Monte Carlo simulations.

## Features
- **Data Pipeline**: Automatically fetches and processes T20 match data from Cricsheet.
- **Predictive Models**: Forecasts ball-by-ball outcomes using Random Forest/XGBoost.
- **Simulation Engine**: "What-if" tactical simulator (10,000+ runs/query).
- **Interactive Dashboard**: Streamlit UI for captains/coaches.
- **Field Optimization**: Visual field placement suggestions.

## Installation

1. Install Python 3.9+
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## Usage

Run the main launcher:
```bash
python main.py
```
Or directly via Streamlit:
```bash
streamlit run src/app.py
```

## Note on First Run
The first time you run the app, it will:
1. Download ~400MB of JSON data from Cricsheet.
2. Parse the data (this may take 1-2 minutes).
3. Train the ML models.

Subsequent runs will load from cache and be much faster.

## License
MIT
