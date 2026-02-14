import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
from src.data_loader import process_data, get_player_stats
from src.models import NeuroPredictor, train_pipeline
from src.simulator import MatchSimulator
from src.field_opt import generate_field_suggestions, plot_field
import time

# --- Page Config ---
st.set_page_config(
    page_title="NeuroPitch | Cricket Tactics",
    page_icon="🏏",
    layout="wide",
    initial_sidebar_state="expanded"
)

# --- Custom CSS ---
st.markdown("""
<style>
    .reportview-container {
        background: #0e1117;
    }
    .main .block-container {
        padding-top: 2rem;
    }
    h1, h2, h3 {
        color: #f0f2f6;
    }
    .stButton>button {
        background-color: #4CAF50;
        color: white;
    }
    .metric-card {
        background-color: #262730;
        padding: 15px;
        border-radius: 5px;
        border: 1px solid #464b5c;
    }
</style>
""", unsafe_allow_html=True)

# --- Init Data & Models ---
@st.cache_resource
def load_system():
    # 1. Load Data
    with st.spinner("Initializing NeuroPitch Engine... (Downloading Data if needed)"):
        # Limited load for prototype speed
        df = process_data(limit=100) 
    
    # 2. Train/Load Model
    model = NeuroPredictor()
    if not model.load_model():
        with st.spinner("First run detected. Training models..."):
            train_pipeline()
            model.load_model()
            
    # 3. Stats
    batters, bowlers = get_player_stats(df)
    
    return df, model, batters, bowlers

try:
    df, model_engine, batter_stats, bowler_stats = load_system()
    simulator = MatchSimulator(model=model_engine)
except Exception as e:
    st.error(f"System Backend Failed: {e}")
    st.stop()

# --- Sidebar Controls ---
st.sidebar.title("🏏 NeuroPitch Control")

st.sidebar.subheader("Match State")
match_type = st.sidebar.selectbox("Format", ["T20", "ODI"], index=0)
innings = st.sidebar.radio("Innings", [1, 2], index=1)

col1, col2 = st.sidebar.columns(2)
overs_done = col1.number_input("Overs Done", 0.0, 19.9, 16.0, step=0.1)
wickets_lost = col2.number_input("Wickets Lost", 0, 9, 3)

target_runs = 0
if innings == 2:
    target_runs = st.sidebar.number_input("Target Score", 100, 300, 180)
    current_runs = st.sidebar.number_input("Current Runs", 0, 300, 140)
    
    runs_needed = target_runs - current_runs
    balls_rem = int((20 - overs_done) * 6) # Approximation (decimal over handling simple)
    req_rr = (runs_needed / balls_rem) * 6 if balls_rem > 0 else 0
    
    st.sidebar.metric("Required RR", f"{req_rr:.1f}")

st.sidebar.subheader("Current Players")
# Get top players from stats
top_batters = batter_stats.sort_values('runs', ascending=False).head(50)['batter'].tolist()
top_bowlers = bowler_stats.sort_values('wickets', ascending=False).head(50)['bowler'].tolist()

striker = st.sidebar.selectbox("Striker", top_batters, index=0)
bowler = st.sidebar.selectbox("Bowler", top_bowlers, index=0)

st.sidebar.subheader("Conditions")
dew = st.sidebar.checkbox("Dew Factor (+Run Rate)")
pitch = st.sidebar.select_slider("Pitch Type", options=["Green", "Flat", "Turning", "Dusty"], value="Flat")

# --- Tactical Logic ---
st.title("NeuroPitch: Captain's Dashboard")

# Top Level Metrics
# 1. Base Simulation
sim_state = {
    'overs_done': int(overs_done), # Flooring for simplicity
    'balls_done': int((overs_done * 10) % 10), # Crude extraction
    'wickets_lost': wickets_lost,
    'target': target_runs if innings == 2 else 9999,
    'current_score': current_runs if innings == 2 else 0,
    'batter': striker,
    'bowler': bowler
}

# Run Baseline Sim
baseline_res = simulator.simulate_innings(sim_state, n_sims=5000)

c1, c2, c3, c4 = st.columns(4)
c1.metric("Win Probability", f"{baseline_res['win_prob']:.1f}%", delta_color="normal")
c2.metric("Expected Score", f"{int(baseline_res['expected_score'])}")
c3.metric("Projected Runs", f"{int(baseline_res['expected_score'] - sim_state['current_score'])}")
c4.metric("Risk Level", "High" if baseline_res['risk_std'] > 15 else "Low")

# --- Tactical Recommendations ---
st.header("🧠 Tactical Recommendations")

tactics = {
    "Baseline": None,
    "Attack (Bring Fielders In)": {'intent': 'attack'},
    "Defend (Spread Field)": {'intent': 'defend'},
    "Bowl Wide Yorkers": {'bowler_type': 'yorker_specialist'}
}

results = []
for name, mod in tactics.items():
    res = simulator.simulate_innings(sim_state, n_sims=2000, tactical_mods=mod)
    try:
        win_delta = res['win_prob'] - baseline_res['win_prob']
    except:
        win_delta = 0
    results.append({
        "Tactic": name,
        "Win %": f"{res['win_prob']:.1f}%",
        "Delta": win_delta,
        "Exp Score": int(res['expected_score'])
    })

res_df = pd.DataFrame(results)
st.table(res_df.style.applymap(lambda x: 'color: green' if x > 0 else 'color: red', subset=['Delta']))

# --- Field Visual ---
st.header("🏟️ Field Optimization")
col_f1, col_f2 = st.columns([1, 1])

with col_f1:
    field_tactic = st.selectbox("Select Strategy", ["Standard", "Attacking", "Defensive"])
    field_coords = generate_field_suggestions(striker, tactic=field_tactic.lower())
    fig_field = plot_field(field_coords, title=f"Field vs {striker} ({field_tactic})")
    st.plotly_chart(fig_field, use_container_width=True)

with col_f2:
    st.subheader("Batter Analysis")
    b_stat = batter_stats[batter_stats['batter'] == striker]
    if not b_stat.empty:
        st.write(f"**Strike Rate:** {b_stat['strike_rate'].values[0]:.1f}")
        st.write(f"**Avg:** {b_stat['avg'].values[0]:.1f}")
        st.write("Weakness: Off-spin (Historical proxy)") # Placeholder
    
    st.subheader("Bowler Matchup")
    bw_stat = bowler_stats[bowler_stats['bowler'] == bowler]
    if not bw_stat.empty:
        st.write(f"**Economy:** {bw_stat['economy'].values[0]:.1f}")

# --- Outcome Distribution ---
st.header("📊 Outcomes projection")
fig_hist = px.histogram(baseline_res['sim_scores'], nbins=30, title="Projected Run Distribution (Monte Carlo)")
st.plotly_chart(fig_hist, use_container_width=True)

# --- Footer ---
st.markdown("---")
st.caption("NeuroPitch Prototype | v0.1 | Powered by XGBoost & Scikit-Learn")
