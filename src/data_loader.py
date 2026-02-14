import os
import io
import requests
import zipfile
import json
import pandas as pd
import numpy as np
from pathlib import Path

# Config
DATA_DIR = Path("data")
RAW_DIR = DATA_DIR / "raw"
PROCESSED_DIR = DATA_DIR / "processed"
CRICSHEET_URL = "https://cricsheet.org/downloads/t20s_male_json.zip"

def ensure_directories():
    os.makedirs(RAW_DIR, exist_ok=True)
    os.makedirs(PROCESSED_DIR, exist_ok=True)

def download_data():
    """Downloads and extracting Cricsheet T20 JSON data."""
    ensure_directories()
    
    # Check if we already have data to avoid re-downloading large files in dev
    if list(RAW_DIR.glob("*.json")):
        print(f"Data already present in {RAW_DIR}. Skipping download.")
        return

    print(f"Downloading data from {CRICSHEET_URL}...")
    zip_path = DATA_DIR / "t20s_data.zip"
    
    try:
        with requests.get(CRICSHEET_URL, stream=True) as r:
            r.raise_for_status()
            total_size = int(r.headers.get('content-length', 0))
            downloaded = 0
            
            with open(zip_path, 'wb') as f:
                for chunk in r.iter_content(chunk_size=8192): 
                    f.write(chunk)
                    downloaded += len(chunk)
                    if total_size:
                        done = int(50 * downloaded / total_size)
                        print(f"\rDownloading: [{'=' * done}{' ' * (50-done)}] {downloaded//(1024*1024)}MB / {total_size//(1024*1024)}MB", end='')
        
        print("\nExtracting zip file... (this may take a minute)")
        with zipfile.ZipFile(zip_path, 'r') as z:
            z.extractall(RAW_DIR)
            
        print("Download and extraction complete.")
        # Cleanup zip to save space
        try:
            os.remove(zip_path)
        except:
            pass
            
    except Exception as e:
        print(f"\nFailed to download data: {e}")
        # Create dummy data for offline/fallback mode
        create_dummy_data()

def create_dummy_data():
    """Creates a small dummy dataset structure if download fails."""
    print("Creating dummy data for demonstration...")
    # This is a fallback to ensure the app runs even without internet
    dummy_match = {
        "info": {
            "dates": ["2025-01-01"],
            "teams": ["India", "Australia"],
            "venue": "Wankhede Stadium"
        },
        "innings": [
            {
                "team": "India",
                "overs": [
                    {
                        "over": 0,
                        "deliveries": [
                            {"batter": "V Kohli", "bowler": "P Cummins", "runs": {"total": 1, "batter": 1, "extras": 0}},
                            {"batter": "RG Sharma", "bowler": "P Cummins", "runs": {"total": 4, "batter": 4, "extras": 0}},
                            {"batter": "RG Sharma", "bowler": "P Cummins", "runs": {"total": 6, "batter": 6, "extras": 0}},
                            {"batter": "V Kohli", "bowler": "P Cummins", "runs": {"total": 0, "batter": 0, "extras": 0}},
                            {"batter": "V Kohli", "bowler": "P Cummins", "runs": {"total": 1, "batter": 1, "extras": 0}},
                            {"batter": "RG Sharma", "bowler": "P Cummins", "runs": {"total": 0, "batter": 0, "extras": 0}, "wicket": {"kind": "caught", "player_out": "RG Sharma"}}
                        ]
                    }
                ]
            }
        ]
    }
    with open(RAW_DIR / "dummy_sample.json", "w") as f:
        json.dump(dummy_match, f)

def parse_json_to_df(limit=None):
    """
    Parses JSON files into a flat Pandas DataFrame.
    limit: max number of matches to process (for speed).
    """
    json_files = list(RAW_DIR.glob("*.json"))
    if not json_files:
        print("No JSON files found.")
        return pd.DataFrame()
    
    if limit:
        json_files = json_files[:limit]
        
    all_deliveries = []
    
    print(f"Parsing {len(json_files)} matches...")
    for file_path in json_files:
        try:
            with open(file_path, "r") as f:
                data = json.load(f)
            
            info = data.get("info", {})
            venue = info.get("venue", "Unknown")
            dates = info.get("dates", ["Unknown"])[0]
            teams = info.get("teams", ["Team A", "Team B"])
            
            # Simple assumption: 1st innings only for simplicity or handle both
            for inning_idx, inning in enumerate(data.get("innings", [])):
                batting_team = inning.get("team")
                bowling_team = [t for t in teams if t != batting_team][0] if len(teams) > 1 else "Unknown"
                
                for over_data in inning.get("overs", []):
                    over_num = over_data.get("over")
                    
                    for ball_idx, delivery in enumerate(over_data.get("deliveries", [])):
                        runs = delivery.get("runs", {})
                        wicket = delivery.get("wicket", {})
                        
                        row = {
                            "match_id": file_path.stem,
                            "date": dates,
                            "venue": venue,
                            "batting_team": batting_team,
                            "bowling_team": bowling_team,
                            "innings": inning_idx + 1,
                            "over": over_num,
                            "ball": ball_idx + 1,
                            "batter": delivery.get("batter"),
                            "bowler": delivery.get("bowler"),
                            "non_striker": delivery.get("non_striker"),
                            "runs_batter": runs.get("batter", 0),
                            "runs_extras": runs.get("extras", 0),
                            "runs_total": runs.get("total", 0),
                            "is_wicket": 1 if wicket else 0,
                            "wicket_type": wicket.get("kind", ""),
                            "player_out": wicket.get("player_out", "")
                        }
                        all_deliveries.append(row)
        except Exception as e:
            # print(f"Error parsing {file_path}: {e}")
            continue

    df = pd.DataFrame(all_deliveries)
    return df

def process_data(limit=500):
    """Main pipeline to load and process data."""
    # 1. Download if needed
    download_data()
    
    # 2. Check cache
    cache_path = PROCESSED_DIR / "matches_flat.pkl"
    if cache_path.exists():
        print("Loading cached processed data...")
        return pd.read_pickle(cache_path)
        
    # 3. Parse and Create DF
    print("Parsing raw data...")
    df = parse_json_to_df(limit=limit)
    
    if df.empty:
        print("No data found or parsed.")
        return df

    # 4. Feature Engineering
    print("Engineering features...")
    
    # Phase
    df['phase'] = pd.cut(df['over'], bins=[-1, 5, 15, 20], labels=['Powerplay', 'Middle', 'Death'])
    
    # Cumulative stats (simple version)
    # Ideally should be historical, but for prototype we just use global stats
    
    # Save
    df.to_pickle(cache_path)
    print(f"Data processed and saved to {cache_path}")
    return df

def get_player_stats(df):
    """Aggregates player stats from the dataframe."""
    batter_stats = df.groupby('batter').agg(
        runs=('runs_batter', 'sum'),
        balls=('ball', 'count'),
        dismissals=('is_wicket', 'sum')
    ).reset_index()
    batter_stats['strike_rate'] = (batter_stats['runs'] / batter_stats['balls']) * 100
    batter_stats['avg'] = batter_stats['runs'] / np.maximum(1, batter_stats['dismissals'])
    
    bowler_stats = df.groupby('bowler').agg(
        balls_bowled=('ball', 'count'),
        runs_conceded=('runs_total', 'sum'),
        wickets=('is_wicket', 'sum')
    ).reset_index()
    bowler_stats['economy'] = (bowler_stats['runs_conceded'] / bowler_stats['balls_bowled']) * 6
    
    return batter_stats, bowler_stats

if __name__ == "__main__":
    process_data(limit=100)
