import http.server
import json
import urllib.request
import urllib.parse
import os
import base64
import time

PORT = 8000
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
CONFIG_PATH = os.path.join(SCRIPT_DIR, "config.json")
DATA_PATH = os.path.join(SCRIPT_DIR, "data.json")

GITHUB_REPO_OWNER = 'zaharr1990'
GITHUB_REPO_NAME = 'zachariah-handyman'
GITHUB_FILE_PATH = 'data.json'

def load_config():
    try:
        with open(CONFIG_PATH, 'r', encoding='utf-8') as f:
            return json.load(f)
    except:
        return None

def fetch_github_data(token):
    url = f"https://api.github.com/repos/{GITHUB_REPO_OWNER}/{GITHUB_REPO_NAME}/contents/{GITHUB_FILE_PATH}"
    req = urllib.request.Request(
        url + "?t=" + str(int(time.time())),
        headers={
            'Authorization': f'Bearer {token}',
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'ZachariahHandymanServer'
        }
    )
    with urllib.request.urlopen(req) as res:
        response_data = json.loads(res.read().decode('utf-8'))
        content_bytes = base64.b64decode(response_data['content'])
        data = json.loads(content_bytes.decode('utf-8'))
        return data, response_data['sha']

def push_github_data(token, data, sha):
    url = f"https://api.github.com/repos/{GITHUB_REPO_OWNER}/{GITHUB_REPO_NAME}/contents/{GITHUB_FILE_PATH}"
    content_bytes = json.dumps(data, indent=2, ensure_ascii=False).encode('utf-8')
    base64_content = base64.b64encode(content_bytes).decode('utf-8')
    
    put_payload = json.dumps({
        "message": "Auto-update business data from Local Server Proxy",
        "content": base64_content,
        "sha": sha
    }).encode('utf-8')
    
    req = urllib.request.Request(
        url,
        method='PUT',
        data=put_payload,
        headers={
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json',
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'ZachariahHandymanServer'
        }
    )
    with urllib.request.urlopen(req) as res:
        return res.status in [200, 201]

class ProxyHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path.startswith('/api/data'):
            config = load_config()
            token = config.get("github_token") if config else None
            if not token:
                self.send_error(401, "GitHub Token missing in config.json")
                return
            try:
                data, sha = fetch_github_data(token)
                self.send_response(200)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps(data, ensure_ascii=False).encode('utf-8'))
            except Exception as e:
                self.send_error(500, f"GitHub API error: {str(e)}")
        else:
            super().do_GET()

    def do_POST(self):
        if self.path.startswith('/api/data'):
            config = load_config()
            token = config.get("github_token") if config else None
            if not token:
                self.send_error(401, "GitHub Token missing in config.json")
                return
            try:
                content_length = int(self.headers['Content-Length'])
                post_data = self.rfile.read(content_length)
                client_data = json.loads(post_data.decode('utf-8'))
                
                # Fetch latest version first to get current sha
                _, sha = fetch_github_data(token)
                
                # Push updated data
                success = push_github_data(token, client_data, sha)
                if success:
                    self.send_response(200)
                    self.send_header('Content-Type', 'application/json')
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.end_headers()
                    self.wfile.write(json.dumps({"status": "success"}).encode('utf-8'))
                else:
                    self.send_error(500, "Failed to commit data to GitHub")
            except Exception as e:
                self.send_error(500, f"Error: {str(e)}")
        else:
            self.send_error(404)

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

def main():
    os.chdir(SCRIPT_DIR)
    server_address = ('', PORT)
    httpd = http.server.HTTPServer(server_address, ProxyHandler)
    print(f"Custom server running on port {PORT} with local API proxy...")
    httpd.serve_forever()

if __name__ == '__main__':
    main()
