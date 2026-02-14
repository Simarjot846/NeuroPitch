import os

def main():
    print("===========================================")
    print("Welcome to NeuroPitch - Cricket Analytics")
    print("===========================================")
    print("1. Initializing System...")
    
    # Ensure dependencies or setup if needed
    if not os.path.exists("src/app.py"):
        print("Error: Source code missing.")
        return

    print("2. Launching Dashboard Interface...")
    print("   (This will open in your default browser)")
    
    try:
        os.system("streamlit run src/app.py")
    except KeyboardInterrupt:
        print("\nShutting down...")

if __name__ == "__main__":
    main()
