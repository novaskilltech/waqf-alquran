import subprocess
import os

db_url = "postgresql://postgres:Khouribga111*@db.tqbcmcddnohnqmcxvgut.supabase.co:5432/postgres"
sql_file = "output.sql"

try:
    result = subprocess.run(['psql', db_url, '-f', sql_file], capture_output=True, text=True, check=True)
    print("Success:")
    print(result.stdout)
except subprocess.CalledProcessError as e:
    print("Error:")
    print(e.stdout)
    print(e.stderr)
