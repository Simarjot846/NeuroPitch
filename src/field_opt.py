import numpy as np
import pandas as pd
import plotly.graph_objects as go

def generate_field_suggestions(batter_name, tactic='standard'):
    """
    Generates field placement coordinates based on batter and tactic.
    In a real system, this would query historical wagon wheels.
    Here we simulate it with synthetic clusters.
    """
    # Oval field approximation: scaled to 100x100 coord system, center (50,50)
    
    # Base positions (standard)
    fielders = {
        'Keeper': (50, 10),
        'Slip 1': (55, 12),
        'Third Man': (70, 15),
        'Point': (85, 45),
        'Cover': (80, 65),
        'Mid Off': (60, 80),
        'Mid On': (40, 80),
        'Mid Wicket': (20, 65),
        'Square Leg': (15, 45),
        'Fine Leg': (30, 15),
        'Bowler': (50, 55) # Approx
    }
    
    # Modifiers based on tactic
    if tactic == 'attacking':
        # Move fielders closer/catch positions
        fielders['Slip 2'] = (58, 14) # Add slip
        del fielders['Third Man'] # Remove saver
        fielders['Mid Off'] = (55, 70) # Closer
        fielders['Mid On'] = (45, 70) 
        
    elif tactic == 'defensive':
        # Spread field
        fielders['Deep Cover'] = (85, 85)
        del fielders['Cover']
        fielders['Long On'] = (40, 95)
        del fielders['Mid On']
        fielders['Deep Square'] = (10, 50)
        del fielders['Square Leg']

    return fielders

def plot_field(fielders, title="Recommended Field"):
    """
    Returns a Plotly figure of the field.
    """
    fig = go.Figure()
    
    # Draw Boundary (Circle)
    theta = np.linspace(0, 2*np.pi, 100)
    r = 45 # Radius
    x_bound = 50 + r * np.cos(theta)
    y_bound = 50 + r * np.sin(theta)
    
    fig.add_trace(go.Scatter(x=x_bound, y=y_bound, mode='lines', line=dict(color='white'), name='Boundary'))
    
    # Draw Pitch
    fig.add_shape(type="rect",
        x0=48, y0=40, x1=52, y1=60,
        line=dict(color="burlywood"),
        fillcolor="burlywood",
    )
    
    # Plot Fielders
    x_vals = [pos[0] for pos in fielders.values()]
    y_vals = [pos[1] for pos in fielders.values()]
    names = list(fielders.keys())
    
    fig.add_trace(go.Scatter(
        x=x_vals, y=y_vals,
        mode='markers+text',
        marker=dict(size=12, color='red', symbol='circle'),
        text=names,
        textposition="top center",
        name='Fielders'
    ))
    
    fig.update_layout(
        title=title,
        xaxis=dict(range=[0, 100], showgrid=False, zeroline=False, visible=False),
        yaxis=dict(range=[0, 100], showgrid=False, zeroline=False, visible=False),
        plot_bgcolor='green',
        width=400, height=400,
        margin=dict(l=20, r=20, t=40, b=20)
    )
    
    return fig
