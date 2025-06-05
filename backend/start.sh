#!/bin/bash
cd /root/Search-Tool/backend
source venv/bin/activate
uvicorn run:app --host 0.0.0.0 --port 8000 