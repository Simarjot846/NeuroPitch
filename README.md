# NeuroPitch: AI Tactical Brain

![NeuroPitch UI](https://via.placeholder.com/1200x600/0a0a0a/06b6d4?text=NeuroPitch+Premium+UI)

NeuroPitch is a next-generation predictive modeling analytics platform designed for cricket teams.

## Features
- **Live Match Coach Analyzer:** Automatic match discovery and live dynamic RAG simulation engine.
- **Quantum Simulator:** Run millions of Monte Carlo simulations per minute.
- **Vision Matrix:** Dynamic pitch heatmaps and spatial analysis.
- **Video Analyzer:** Drone and side-camera footage processing for biomechanics.

## API Key & Backend Configuration
For the Live Coach feature, this app dynamically fetches real games using `cricapi.com`. 
1. Get a key from `https://cricketdata.org/`
2. Run backend with api key: `set CRICKET_API_KEY=YOUR_KEY`
3. Launch backend from terminal root: `python main.py`

## Tech Stack
- Next.js 15+ (App Router), React 19, Tailwind CSS
- React Three Fiber, Drei, Three.js (for 3D Vision Matrix)
- FastAPI (Python), BeautifulSoup, Recharts & Plotly.js

## Getting Started

1. Install Frontend dependencies:
```bash
npm install
npm install three @types/three @react-three/fiber @react-three/drei
```

2. Run local frontend server:
```bash
npm run dev
```

3. Open a second terminal to install explicit backend web scraping & API tools:
```bash
pip install -r requirements.txt
# Ensure you have installed parsing libraries:
pip install beautifulsoup4 lxml requests fastapi uvicorn pydantic
python main.py
```

## Vercel Deployment

Deploying completely free on Vercel:

1. Push your code to GitHub.
2. Sign up / Login to Vercel (vercel.com).
3. Click "Add New Project" and import your repository.
4. Framework Preset will auto-detect "Next.js".
5. Leave Build Command and Output Directory as default.
6. Click "Deploy". The platform will be live globally within 60 seconds with SSL enabled.
