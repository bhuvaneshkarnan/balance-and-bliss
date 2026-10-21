# -*- coding: utf-8 -*-
"""
Balance & Bliss - 110 Clinical Blog Generator
Generates:
1. data/blogs-database.json
2. js/blogs-data.js
3. 110 individual static HTML article files (blog-[slug].html)
4. sitemap.xml update
"""

import os
import json
from datetime import datetime, timedelta

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, 'data')
JS_DIR = os.path.join(BASE_DIR, 'js')
os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(JS_DIR, exist_ok=True)

# Generate Mon/Wed/Fri publishing schedule
def build_schedule(total=110):
    # First 6 posts are published on or before Oct 21, 2026:
    initial_dates = [
        "2026-10-09", # Fri
        "2026-10-12", # Mon
        "2026-10-14", # Wed
        "2026-10-16", # Fri
        "2026-10-19", # Mon
        "2026-10-21", # Wed (Today!)
    ]
    dates = list(initial_dates)
    curr = datetime(2026, 10, 22)
    while len(dates) < total:
        # Monday is 0, Wednesday is 2, Friday is 4
        if curr.weekday() in (0, 2, 4):
            dates.append(curr.strftime("%Y-%m-%d"))
        curr += timedelta(days=1)
    return dates

SCHEDULE = build_schedule(110)
print(f"Generated schedule for {len(SCHEDULE)} posts: from {SCHEDULE[0]} to {SCHEDULE[-1]}")
