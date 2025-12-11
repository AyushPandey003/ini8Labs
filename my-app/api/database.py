import os
import psycopg2
from psycopg2.extras import RealDictCursor
from contextlib import contextmanager

def get_db_url():
    return os.environ.get("DATABASE_URL")

def init_db():
    url = get_db_url()
    if not url:
        print("DATABASE_URL not set in environment")
        return

    try:
        conn = psycopg2.connect(url)
        cur = conn.cursor()
        
        cur.execute("""
            CREATE TABLE IF NOT EXISTS documents (
                id SERIAL PRIMARY KEY,
                filename TEXT NOT NULL,
                filepath TEXT NOT NULL,
                filesize INTEGER NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)
        
        conn.commit()
        cur.close()
        conn.close()
        print("Database initialized successfully")
    except Exception as e:
        print(f"Error initializing database: {e}")

@contextmanager
def get_db_connection():
    url = get_db_url()
    if not url:
        raise Exception("DATABASE_URL environment variable not set")
        
    conn = psycopg2.connect(url, cursor_factory=RealDictCursor)
    try:
        yield conn
    finally:
        conn.close()
