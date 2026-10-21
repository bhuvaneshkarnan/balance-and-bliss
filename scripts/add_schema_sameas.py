# -*- coding: utf-8 -*-
import os

NEW_SAME_AS_CLINIC = '''        "sameAs": [
          "https://www.instagram.com/mehraj_abdullah21?dlrf=MXZ1aTh4a2V5Y2YweQ==",
          "https://www.facebook.com/share/19gdwQooG6/",
          "https://www.youtube.com/@mehrajabdullah",
          "https://wa.me/918838452088"
        ],'''

NEW_SAME_AS_DOC = '''        "sameAs": [
          "https://www.instagram.com/mehraj_abdullah21?dlrf=MXZ1aTh4a2V5Y2YweQ==",
          "https://www.facebook.com/share/19gdwQooG6/",
          "https://www.youtube.com/@mehrajabdullah"
        ],'''

files = ["index.html", "foot-reflexology-madurai.html", "about.html"]

for f in files:
    if os.path.exists(f):
        with open(f, 'r', encoding='utf-8') as fp:
            c = fp.read()
        
        # Add to clinic if not present
        if '"email": "balanceandblisshealings@gmail.com",' in c and '"sameAs"' not in c:
            c = c.replace('"email": "balanceandblisshealings@gmail.com",', '"email": "balanceandblisshealings@gmail.com",\n' + NEW_SAME_AS_CLINIC)
        
        # Add to physician if present
        if '"identifier": "ATAMA Reg. No: 20261714 / TN",' in c and 'mehraj_abdullah21' not in c[c.find('"identifier": "ATAMA Reg. No: 20261714 / TN",'):c.find('"identifier": "ATAMA Reg. No: 20261714 / TN",')+300]:
            c = c.replace('"identifier": "ATAMA Reg. No: 20261714 / TN",', '"identifier": "ATAMA Reg. No: 20261714 / TN",\n' + NEW_SAME_AS_DOC)
            
        with open(f, 'w', encoding='utf-8') as fp:
            fp.write(c)
        print(f"Added schema sameAs to {f}")
