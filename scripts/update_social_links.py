# -*- coding: utf-8 -*-
"""
Update social links across all website pages and templates
"""
import os
import re

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

NEW_IG = "https://www.instagram.com/mehraj_abdullah21?dlrf=MXZ1aTh4a2V5Y2YweQ=="
NEW_FB = "https://www.facebook.com/share/19gdwQooG6/"
NEW_YT = "https://www.youtube.com/@mehrajabdullah"

SOCIAL_LINKS_HTML = f'''          <div class="social-links-bar" style="margin-bottom: 2rem;">
            <a href="{NEW_IG}" 
               target="_blank" 
               rel="noopener" 
               class="social-link-btn" 
               aria-label="Instagram">
              <img src="assets/icons/instagram.svg" alt="" width="18" height="18">
            </a>
            <a href="{NEW_FB}" 
               target="_blank" 
               rel="noopener" 
               class="social-link-btn" 
               aria-label="Facebook">
              <img src="assets/icons/facebook.svg" alt="" width="18" height="18">
            </a>
            <a href="{NEW_YT}" 
               target="_blank" 
               rel="noopener" 
               class="social-link-btn" 
               aria-label="YouTube">
              <img src="assets/icons/youtube.svg" alt="" width="18" height="18">
            </a>
            <a href="https://wa.me/918838452088" 
               target="_blank" 
               rel="noopener" 
               class="social-link-btn" 
               aria-label="WhatsApp">
              <img src="assets/icons/whatsapp.svg" alt="" width="18" height="18">
            </a>
          </div>'''

# 1. Update all existing HTML files in BASE_DIR
updated_files = []

for fname in os.listdir(BASE_DIR):
    if fname.endswith('.html'):
        fpath = os.path.join(BASE_DIR, fname)
        with open(fpath, 'r', encoding='utf-8') as f:
            content = f.read()

        changed = False

        # Replace old IG links
        if "instagram.com/mehraj_abdullah21" in content:
            content = re.sub(
                r'https?://(?:www\.)?instagram\.com/mehraj_abdullah21[^\s"\'<>]*',
                NEW_IG,
                content
            )
            changed = True

        # Replace old FB links
        if "facebook.com/share/" in content:
            content = re.sub(
                r'https?://(?:www\.)?facebook\.com/share/[^\s"\'<>]*',
                NEW_FB,
                content
            )
            changed = True

        # Replace old YouTube links
        if "@mehrajabdullah" in content:
            content = re.sub(
                r'https?://(?:www\.)?youtube\.com/@mehrajabdullah[^\s"\'<>]*',
                NEW_YT,
                content
            )
            changed = True

        # If file is blog.html and lacks social-links-bar in footer
        if fname == 'blog.html' and 'social-links-bar' not in content:
            # Insert right before footer-links-list
            target = '<div class="footer-links-list" style="margin-top: 1.5rem;">'
            if target in content:
                content = content.replace(target, SOCIAL_LINKS_HTML + "\n\n          " + target)
                changed = True

        if changed:
            with open(fpath, 'w', encoding='utf-8') as f:
                f.write(content)
            updated_files.append(fname)

print(f"Updated social links in {len(updated_files)} HTML files.")
