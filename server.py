#!/usr/bin/env python3
"""
Simple HTTP Server for Homework Tracker
Run this script to serve the homework tracker application locally.
"""

import http.server
import socketserver
import webbrowser
import os
import sys
from pathlib import Path

def main():
    # Get the directory where this script is located
    script_dir = Path(__file__).parent.absolute()
    
    # Change to the script directory
    os.chdir(script_dir)
    
    # Check if required files exist
    required_files = ['index.html', 'styles.css', 'script.js']
    missing_files = [f for f in required_files if not Path(f).exists()]
    
    if missing_files:
        print(f"❌ Error: Missing required files: {', '.join(missing_files)}")
        print("Make sure all files are in the same directory as this script.")
        sys.exit(1)
    
    PORT = 3000
    
    # Create the server
    Handler = http.server.SimpleHTTPRequestHandler
    
    try:
        with socketserver.TCPServer(("", PORT), Handler) as httpd:
            print(f"🚀 Homework Tracker server starting...")
            print(f"📁 Serving files from: {script_dir}")
            print(f"🌐 Server running at: http://localhost:{PORT}")
            print(f"📱 Open your browser and go to: http://localhost:{PORT}")
            print("\n" + "="*50)
            print("📋 Setup Instructions:")
            print("1. Get Google OAuth credentials from Google Cloud Console")
            print("2. Update the client_id in index.html")
            print("3. Sign in with your Google account")
            print("4. Start tracking your homework!")
            print("="*50)
            print("\nPress Ctrl+C to stop the server")
            
            # Try to open the browser automatically
            try:
                webbrowser.open(f'http://localhost:{PORT}')
                print("🌐 Browser opened automatically!")
            except:
                print("⚠️  Could not open browser automatically. Please open it manually.")
            
            # Start the server
            httpd.serve_forever()
            
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
    except OSError as e:
        if e.errno == 48:  # Address already in use
            print(f"❌ Error: Port {PORT} is already in use.")
            print(f"Try using a different port or stop the process using port {PORT}")
        else:
            print(f"❌ Error starting server: {e}")
    except Exception as e:
        print(f"❌ Unexpected error: {e}")

if __name__ == "__main__":
    main()

