import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import pandas as pd
import numpy as np
import joblib
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, log_loss
from pathlib import Path

# Config
MODEL_DIR = Path("models")
MODEL_DIR.mkdir(exist_ok=True)

class NeuroPredictor:
    def __init__(self):
        self.outcome_model = None
        self.le_batter = LabelEncoder()
        self.le_bowler = LabelEncoder()
        self.le_phase = LabelEncoder()
        
    def prepare_data(self, df):
        """Prepares features and targets for training."""
        # Target: simplify to discrete outcomes
        # 0, 1, 2, 3, 4, 6, W (encoded as 7)
        
        def encode_outcome(row):
            if row['is_wicket']: return 7
            if row['runs_batter'] == 6: return 6
            if row['runs_batter'] == 4: return 4
            if row['runs_batter'] == 3: return 3
            if row['runs_batter'] == 2: return 2
            if row['runs_batter'] == 1: return 1
            return 0
            
        df['outcome'] = df.apply(encode_outcome, axis=1)
        
        # Features
        # Using encoding for IDs is primitive but works for prototype
        # Need to handle unseen labels in production (using 'unknown')
        
        # Filter for top N players to keep dimensionality manageable or use LabelEncoder
        # valid_batters = df['batter'].value_counts().index[:500]
        # valid_bowlers = df['bowler'].value_counts().index[:300]
        # df = df[df['batter'].isin(valid_batters) & df['bowler'].isin(valid_bowlers)]
        
        df['batter_code'] = self.le_batter.fit_transform(df['batter'])
        df['bowler_code'] = self.le_bowler.fit_transform(df['bowler'])
        df['phase_code'] = self.le_phase.fit_transform(df['phase'].astype(str))
        
        features = ['over', 'ball', 'innings', 'batter_code', 'bowler_code', 'phase_code']
        target = 'outcome'
        
        return df[features], df[target]

    def train(self, df):
        print("Preparing training data...")
        X, y = self.prepare_data(df)
        
        print("Splitting data...")
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        print("Training Random Forest (this may take a moment)...")
        # Using RF for multi-class proba support out of box
        self.outcome_model = RandomForestClassifier(
            n_estimators=100, 
            max_depth=10, 
            n_jobs=-1,
            random_state=42
        )
        self.outcome_model.fit(X_train, y_train)
        
        # Evaulate
        try:
            probs = self.outcome_model.predict_proba(X_test)
            # Handle single-class case in test set
            if len(np.unique(y_test)) > 1:
                loss = log_loss(y_test, probs, labels=self.outcome_model.classes_)
                acc = accuracy_score(y_test, self.outcome_model.predict(X_test))
                print(f"Model Trained. Accuracy: {acc:.3f}, Log Loss: {loss:.3f}")
            else:
                print("Model Trained. (Skipping metrics: Insufficient class variance in test set)")
        except Exception as e:
            print(f"Model Trained. (Metrics calculation failed: {e})")
        
    def save_model(self):
        joblib.dump(self.outcome_model, MODEL_DIR / "outcome_model.joblib")
        joblib.dump(self.le_batter, MODEL_DIR / "le_batter.joblib")
        joblib.dump(self.le_bowler, MODEL_DIR / "le_bowler.joblib")
        joblib.dump(self.le_phase, MODEL_DIR / "le_phase.joblib")
        print("Models saved.")

    def load_model(self):
        try:
            self.outcome_model = joblib.load(MODEL_DIR / "outcome_model.joblib")
            self.le_batter = joblib.load(MODEL_DIR / "le_batter.joblib")
            self.le_bowler = joblib.load(MODEL_DIR / "le_bowler.joblib")
            self.le_phase = joblib.load(MODEL_DIR / "le_phase.joblib")
            return True
        except FileNotFoundError:
            print("Models not found. Please train first.")
            return False

    def predict_probs(self, current_state):
        """
        Returns outcome probabilities for a single state.
        state format: {over, ball, innings, batter, bowler, phase}
        """
        # Handle unseen labels by assigning a default (e.g., mode or special index)
        # For prototype, we try/except and use 0 (often unlikely to match but safe crash-wise)
        
        try:
            b_code = self.le_batter.transform([current_state['batter']])[0]
        except:
            b_code = 0 # Unknown
            
        try:
            bw_code = self.le_bowler.transform([current_state['bowler']])[0]
        except:
            bw_code = 0 # Unknown
            
        try:
            p_code = self.le_phase.transform([current_state['phase']])[0]
        except:
            p_code = 0
            
        X = np.array([[
            current_state['over'],
            current_state['ball'],
            current_state['innings'],
            b_code,
            bw_code,
            p_code
        ]])
        
        return self.outcome_model.predict_proba(X)[0]

def train_pipeline():
    from src.data_loader import process_data
    df = process_data(limit=200) # Limit for speed in prototype
    if df.empty:
        print("No data available for training.")
        return
        
    model = NeuroPredictor()
    model.train(df)
    model.save_model()

if __name__ == "__main__":
    train_pipeline()
