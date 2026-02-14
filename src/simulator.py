import numpy as np
import pandas as pd
from src.models import NeuroPredictor

class MatchSimulator:
    def __init__(self, model: NeuroPredictor):
        self.model = model
        # Outcomes mapping: indices of model.classes_ to real values
        # Assumes model.classes_ are sorted: 0, 1, 2, 3, 4, 6, 7(W)
        self.outcomes_map = {0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 6, 6: 'W'} 
        # Note: Check model classes dynamically in real usage. 
        # For prototype we assume standard classes: [0, 1, 2, 3, 4, 6, 7]
        self.outcome_values = [0, 1, 2, 3, 4, 6, 'W']

    def simulate_innings(self, start_state, n_sims=1000, tactical_mods=None):
        """
        Runs Monte Carlo simulation for the rest of the innings.
        start_state: {overs_done, balls_done, wickets_lost, target, current_score, batter, bowler}
        """
        
        # Basic constraints
        overs_to_sim = 20 - start_state['overs_done']
        total_balls = int(overs_to_sim * 6) - start_state['balls_done']
        
        if total_balls <= 0:
            return {'win_prob': 0, 'avg_score': start_state['current_score']}

        # Get base probabilities from model for current matchup
        # For simplicity in prototype, we'll use a static probability vector 
        # derived from the current batter/bowler for ALL future balls (vectorized approximation)
        # In a full engine, we'd update batter/bowler rotation.
        
        # Get context
        phase = 'Death' if start_state['overs_done'] > 15 else ('Middle' if start_state['overs_done'] > 6 else 'Powerplay')
        
        context = {
            'over': start_state['overs_done'],
            'ball': start_state['balls_done'],
            'innings': 2 if start_state.get('target') else 1,
            'batter': start_state['batter'],
            'bowler': start_state['bowler'],
            'phase': phase
        }
        
        raw_probs = self.model.predict_probs(context)
        
        # Map raw_probs (which might be shape (2,) e.g. [0.9, 0.1] for classes [0, 1])
        # to standard 7-class vector: 0, 1, 2, 3, 4, 6, 7(W)
        
        base_probs = np.zeros(7)
        if hasattr(self.model.outcome_model, 'classes_'):
            model_classes = self.model.outcome_model.classes_
            # outcomes_map keys are model classes, values are real runs/wickets
            # We need to map model_classes indices to base_probs indices
            # Standard indices: 0->0, 1->1, 2->2, 3->3, 4->4, 5->6, 6->7(W)
            
            # Outcome to index map
            std_outcome_to_idx = {0:0, 1:1, 2:2, 3:3, 4:4, 6:5, 7:6}
            
            for i, cls in enumerate(model_classes):
                if cls in std_outcome_to_idx:
                    idx = std_outcome_to_idx[cls]
                    base_probs[idx] = raw_probs[i]
        else:
            # Fallback for some reason
             base_probs = np.array([0.4, 0.25, 0.05, 0.01, 0.1, 0.05, 0.14]) 
             
        # Normalize if sum > 0, else generic fallback
        if base_probs.sum() > 0:
            base_probs = base_probs / base_probs.sum()
        else:
            base_probs = np.array([0.4, 0.25, 0.05, 0.01, 0.1, 0.05, 0.14])

        # Normalize just in case
        base_probs = base_probs / base_probs.sum()

        # --- Apply Tactical Modifiers ---
        if tactical_mods:
            # tactical_mods = {'intent': 'attack', 'field': 'defensive', ...}
            if tactical_mods.get('intent') == 'attack':
                # Increase boundary probs, increase wicket prob
                # Heuristic: Shift 5% from dots/singles to 4s/6s/W
                base_probs = self._adjust_probs(base_probs, boost_indices=[4, 5, 6], penalty_indices=[0, 1], factor=0.15)
            elif tactical_mods.get('intent') == 'defend':
                base_probs = self._adjust_probs(base_probs, boost_indices=[0, 1], penalty_indices=[6], factor=0.10)
                
            if tactical_mods.get('bowler_type') == 'yorker_specialist':
                # More dots (0), maybe more wickets (6), fewer boundaries
                base_probs = self._adjust_probs(base_probs, boost_indices=[0, 6], penalty_indices=[4, 5], factor=0.10)
        
        sim_outcomes = np.random.choice(
            len(base_probs), 
            size=(n_sims, total_balls), 
            p=base_probs
        )
        
        # Map indices to runs/wickets
        # 0->0, 1->1, 2->2, 3->3, 4->4, 5->6, 6->W (Value 0, but wicket flag)
        
        run_map = np.array([0, 1, 2, 3, 4, 6, 0]) 
        wicket_map = np.array([0, 0, 0, 0, 0, 0, 1])
        
        runs_matrix = run_map[sim_outcomes]
        wickets_matrix = wicket_map[sim_outcomes]
        
        # Cumulative Sums
        cum_runs = runs_matrix.cumsum(axis=1) + start_state['current_score']
        cum_wickets = wickets_matrix.cumsum(axis=1) + start_state['wickets_lost']
        
        # Determine Status
        # Win if cum_runs > target (for chasing)
        # All out if cum_wickets >= 10
        
        matches_won = 0
        final_scores = []
        
        target = start_state.get('target', 9999) # 9999 for first innings
        
        for i in range(n_sims):
            # Find first index where wickets >= 10
            # or runs > target
            
            # Wicket limit check
            w_idx = np.argmax(cum_wickets[i] >= 10)
            if cum_wickets[i][w_idx] < 10: w_idx = total_balls - 1 # Survived simulation
            
            # Run target check
            r_idx = np.argmax(cum_runs[i] > target)
            if cum_runs[i][r_idx] <= target: r_idx = total_balls - 1 # Didn't chase
            
            # The match ends at the earlier of: All Out or Target Chased or Overs Finished
            end_idx = min(w_idx, r_idx, total_balls - 1)
            
            final_runs = cum_runs[i][end_idx]
            final_wickets = cum_wickets[i][end_idx]
            
            final_scores.append(final_runs)
            
            if target != 9999:
                if final_runs > target:
                    matches_won += 1
            else:
                 # In 1st innings, 'win' isn't defined, just score distribution
                 pass

        win_prob = (matches_won / n_sims) * 100
        xp_runs = np.mean(final_scores)
        risk = np.std(final_scores)
        
        return {
            "win_prob": win_prob,
            "expected_score": xp_runs,
            "risk_std": risk,
            "sim_scores": final_scores
        }

    def _adjust_probs(self, probs, boost_indices, penalty_indices, factor):
        """Redistributes probability mass."""
        new_probs = probs.copy()
        
        # Take mass from penalty
        total_penalty = 0
        for idx in penalty_indices:
            reduction = new_probs[idx] * factor
            new_probs[idx] -= reduction
            total_penalty += reduction
            
        # Add mass to boost
        dist_factor = total_penalty / len(boost_indices)
        for idx in boost_indices:
            new_probs[idx] += dist_factor
            
        return new_probs / new_probs.sum()
