"""Apply nginx config: subdomains for n8n/Portainer + path fallbacks + Twenty root."""
import paramiko

with open(r'C:\Users\ivanp\projects\transfer-trucks-fleet\scripts\.vps-pass') as f:
    pw = f.read().strip()

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('212.227.251.228', username='root', password=pw, timeout=10)

config = (
    "# n8n via nip.io\n"
    "server {\n"
    "    listen 80;\n"
    "    server_name n8n.212.227.251.228.nip.io;\n"
    "    client_max_body_size 100M;\n"
    "    location / {\n"
    "        proxy_pass http://127.0.0.1:5678;\n"
    "        proxy_http_version 1.1;\n"
    "        proxy_set_header Upgrade $http_upgrade;\n"
    "        proxy_set_header Connection upgrade;\n"
    "        proxy_set_header Host $host;\n"
    "        proxy_set_header X-Real-IP $remote_addr;\n"
    "    }\n"
    "}\n"
    "\n"
    "# Portainer via nip.io\n"
    "server {\n"
    "    listen 80;\n"
    "    server_name portainer.212.227.251.228.nip.io;\n"
    "    client_max_body_size 100M;\n"
    "    location / {\n"
    "        proxy_pass http://127.0.0.1:9000;\n"
    "        proxy_http_version 1.1;\n"
    "        proxy_set_header Host $host;\n"
    "    }\n"
    "}\n"
    "\n"
    "# Main: Twenty + Portainer + API + SW cleanup\n"
    "server {\n"
    "    listen 80 default_server;\n"
    "    server_name _;\n"
    "    client_max_body_size 100M;\n"
    "    location = /cleanup-sw {\n"
    "        root /opt;\n"
    "        try_files /cleanup-sw.html =404;\n"
    "    }\n"
    "    location /api/ {\n"
    "        proxy_pass http://127.0.0.1:8000;\n"
    "        proxy_http_version 1.1;\n"
    "        proxy_set_header Host $host;\n"
    "    }\n"
    "    location / {\n"
    "        proxy_pass http://127.0.0.1:3001;\n"
    "        proxy_http_version 1.1;\n"
    "        proxy_set_header Upgrade $http_upgrade;\n"
    "        proxy_set_header Connection upgrade;\n"
    "        proxy_set_header Host $host;\n"
    "        proxy_set_header X-Real-IP $remote_addr;\n"
    "        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\n"
    "        # Prevent browser caching stale state after server restarts\n"
    "        add_header Cache-Control \"no-cache, must-revalidate\" always;\n"
    "        add_header Pragma \"no-cache\" always;\n"
    "        expires -1;\n"
    "    }\n"
    "}\n"
)

sftp = c.open_sftp()
with sftp.file('/etc/nginx/sites-available/default', 'w') as f:
    f.write(config)
sftp.close()

_, o, e = c.exec_command('nginx -t && nginx -s reload && echo OK')
print(o.read().decode())
err = e.read().decode()
if err.strip():
    print("ERR:", err[:300])
c.close()
