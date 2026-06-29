@echo off
cd /d D:\@공부방\천손비사
start "" "http://localhost:8000/cheonson.html"
python -m http.server 8000
