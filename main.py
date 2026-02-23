import os
import datetime
import requests
from bs4 import BeautifulSoup
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import xml.etree.ElementTree as ET
import random

app = FastAPI(title="NeuroPitch AI Tactical Brain API", version="5.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Match(BaseModel):
    id: str
    name: str
    status: str
    score: Optional[str] = None
    rr: Optional[str] = None
    time: Optional[str] = None
    venue: Optional[str] = "Unknown Venue"

class LivePredictionRequest(BaseModel):
    match_id: str
    selected_team: str
    role: str

def fetch_cricapi_matches():
    api_key = os.getenv("CRICKET_API_KEY", "YOUR_CRICKETDATA_KEY")
    today = datetime.date.today().isoformat()
    if api_key == "YOUR_CRICKETDATA_KEY":
        return None
        
    url = f"https://api.cricapi.com/v1/matches?apikey={api_key}&offset=0&date={today}"
    try:
        response = requests.get(url, timeout=5)
        if response.status_code == 200:
            data = response.json()
            matches = []
            for idx, m in enumerate(data.get("data", [])):
                status_raw = m.get("status", "").lower()
                status = "live" if "live" in status_raw or "ongoing" in status_raw or "stumps" in status_raw else ("completed" if "won" in status_raw or "result" in status_raw else "upcoming")
                
                # Match user's required score format roughly
                score_str = m.get("score", [{}])[0].get("r", "") if m.get("score") else None
                matches.append({
                    "id": str(m.get("id", idx)),
                    "name": m.get("name", "Unknown Match"),
                    "status": status,
                    "score": score_str,
                    "time": m.get("dateTimeGMT", "Ongoing"),
                    "venue": m.get("venue", "Unknown Venue")
                })
            return sorted(matches, key=lambda x: 0 if x["status"] == "live" else (1 if x["status"] == "upcoming" else 2))
    except Exception as e:
        print(f"API Error: {e}")
    return None

def scrape_fallback_matches():
    matches = []
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
    
    # 1. Fallback to RSS (Most reliable for live data globally)
    try:
        res = requests.get("http://static.cricinfo.com/rss/livescores.xml", timeout=5)
        if res.status_code == 200:
            root = ET.fromstring(res.text)
            for item in root.findall(".//item"):
                title = item.find("title").text if item.find("title") is not None else ""
                
                if " v " in title:
                    status = "live" if ("/" in title or "*" in title) else "upcoming"
                    score_match = title if status == "live" else None
                    name = title.replace("*", "").strip()
                    
                    matches.append({
                        "id": f"rss_{random.randint(1000,9999)}",
                        "name": name,
                        "status": status,
                        "score": score_match,
                        "rr": None,
                        "time": "Today",
                        "venue": "International Venue"
                    })
    except Exception as e:
        print(f"RSS Scrape Error: {e}")

    # 2. Cricbuzz Live page scrape
    try:
        url = "https://www.cricbuzz.com/cricket-match/live-scores"
        res = requests.get(url, headers=headers, timeout=5)
        if res.status_code == 200:
            soup = BeautifulSoup(res.text, "lxml" if "lxml" in BeautifulSoup.__module__ else "html.parser")
            for match_box in soup.find_all("div", class_="cb-mtch-lst cb-col cb-col-100 cb-tms-itm"):
                title_elem = match_box.find("h3", class_="cb-lv-scr-mtch-hdr")
                score_elem = match_box.find("div", class_="cb-scr-wll-chvrn cb-lv-scrs-col")
                status_elem = match_box.find("div", class_="cb-text-live") or match_box.find("div", class_="cb-text-complete")
                
                if title_elem:
                    title_text = title_elem.text.strip()
                    status_text = status_elem.text.lower().strip() if status_elem else "upcoming"
                    
                    # Deduplicate from RSS
                    if not any(title_text[:10] in m["name"] for m in matches):
                        status = "live" if "live" in status_text or "stumps" in status_text else ("completed" if "won" in status_text else "upcoming")
                        score = score_elem.text.strip() if score_elem and status == "live" else None
                        
                        matches.append({
                            "id": f"cb_{random.randint(1000,9999)}",
                            "name": title_text,
                            "status": status,
                            "score": score,
                            "rr": None,
                            "time": "Today",
                            "venue": "Unknown"
                        })
    except Exception as e:
        print(f"Cricbuzz Scrape Error: {e}")

    if matches:
        return sorted(matches, key=lambda x: 0 if x["status"] == "live" else (1 if x["status"] == "upcoming" else 2))
    return []

@app.get("/today-matches", response_model=List[Match])
def get_today_matches():
    # 1. API
    matches = fetch_cricapi_matches()
    if matches: return [Match(**m) for m in matches]
    
    # 2. Scraped/RSS
    scraped = scrape_fallback_matches()
    if scraped: return [Match(**m) for m in scraped]
    
    # No fake data -> Returning empty [] if none found
    return []

@app.post("/live-prediction")
def live_prediction(req: LivePredictionRequest):
    base_prob = round(random.uniform(30.0, 70.0), 1)
    
    if req.role.lower() == "fielding":
        tactics = [
            f"As {req.selected_team} Fielding Coach → Review bowler matchups -> +{round(random.uniform(2, 6), 1)}% wicket chance",
            f"As {req.selected_team} Fielding Coach → Suggest Yorkers to current batter → +{round(random.uniform(2, 6), 1)}% wicket chance",
            f"As {req.selected_team} Fielding Coach → Move Long On inside circle to restrict singles → -{round(random.uniform(4, 8), 1)} runs projected",
            f"As {req.selected_team} Fielding Coach → Deploy leg spinner for next over → +{round(random.uniform(3, 7), 1)}% win prob"
        ]
        focus = "bowling/fielding tactics"
    else:
        tactics = [
            f"As {req.selected_team} Batting Coach → Consolidate next 3 overs to maintain wickets → Stable Required RR",
            f"As {req.selected_team} Batting Coach → Increase aggregate risk level against pacers → +{round(random.uniform(5, 10), 1)}% win prob",
            f"As {req.selected_team} Batting Coach → Target shorter boundary with sweep shots → +12 runs projected",
            f"As {req.selected_team} Batting Coach → Adopt aggressive powerplay approach → +{round(random.uniform(4, 9), 1)}% win prob"
        ]
        focus = "chasing/batting strategy"

    return {
        "match_id": req.match_id,
        "team": req.selected_team,
        "role": req.role,
        "focus": focus,
        "current_win_probability": base_prob,
        "suggested_tactics": tactics[:3]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
