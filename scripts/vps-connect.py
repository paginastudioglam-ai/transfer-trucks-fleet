"""Connect to VPS via SSH and run a command."""
import paramiko
import sys
import os

host = sys.argv[1] if len(sys.argv) > 1 else "212.227.251.228"
user = sys.argv[2] if len(sys.argv) > 2 else "root"
# Read password from file
pass_file = os.path.join(os.path.dirname(__file__), ".vps-pass")
try:
    with open(pass_file) as f:
        password = f.read().strip()
except FileNotFoundError:
    password = sys.argv[3] if len(sys.argv) > 3 else os.environ.get("VPS_PASSWORD", "")

command = " ".join(sys.argv[4:]) if len(sys.argv) > 4 else "echo OK"

if not password:
    print("ERROR: No password provided.")
    sys.exit(1)

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
try:
    client.connect(host, username=user, password=password, timeout=10)
    stdin, stdout, stderr = client.exec_command(command)
    out = stdout.read().decode('utf-8', errors='replace')
    err = stderr.read().decode('utf-8', errors='replace')
    if out:
        print(out)
    if err:
        print("STDERR:", err)
    client.close()
except Exception as e:
    print(f"SSH Error: {e}")
    sys.exit(1)
