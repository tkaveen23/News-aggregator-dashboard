import http.server
import socketserver
import webbrowser
import os
from pathlib import Path

PORT = 8000
DIRECTORY = Path(__file__).parent

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(DIRECTORY), **kwargs)

def main():
    # Change working directory to project root
    os.chdir(DIRECTORY)
    
    # Configure socket server to allow address reuse (prevents "Address already in use" errors)
    socketserver.TCPServer.allow_reuse_address = True
    
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        url = f"http://localhost:{PORT}/index.html"
        print(f"==================================================")
        print(f"Local News Dashboard Server Running at:")
        print(f"   {url}")
        print(f"==================================================")
        print("Press Ctrl+C to stop the server.")
        
        # Open in default web browser
        webbrowser.open(url)
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down server. Goodbye!")

if __name__ == "__main__":
    main()
