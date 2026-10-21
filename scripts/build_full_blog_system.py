# -*- coding: utf-8 -*-
"""
Main Generator for Balance & Bliss 110 Clinical Blog System
Generates:
1. data/blogs-database.json
2. js/blogs-data.js
3. 110 static HTML article pages (blog-[slug].html)
4. sitemap.xml update
"""

import os
import json
from datetime import datetime, timedelta

from pillars_1_to_3 import PILLARS_1_TO_3
from pillars_4_to_6 import PILLARS_4_TO_6
from pillars_7_to_10 import PILLARS_7_TO_10

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, 'data')
JS_DIR = os.path.join(BASE_DIR, 'js')
os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(JS_DIR, exist_ok=True)

# Combine all 110 articles
ALL_ARTICLES = PILLARS_1_TO_3 + PILLARS_4_TO_6 + PILLARS_7_TO_10
ALL_ARTICLES.sort(key=lambda x: x["id"])

# Build Mon/Wed/Fri publishing schedule
def build_schedule(total=110):
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
        if curr.weekday() in (0, 2, 4): # Mon, Wed, Fri
            dates.append(curr.strftime("%Y-%m-%d"))
        curr += timedelta(days=1)
    return dates

SCHEDULE = build_schedule(len(ALL_ARTICLES))

# Format date string into human readable: "October 21, 2026"
def format_human_date(date_str):
    dt = datetime.strptime(date_str, "%Y-%m-%d")
    return dt.strftime("%B %d, %Y")

# Assign schedule to all articles
for idx, art in enumerate(ALL_ARTICLES):
    art["publishDate"] = SCHEDULE[idx]
    art["formattedDate"] = format_human_date(SCHEDULE[idx])
    art["excerpt"] = art.get("lead", "")[:180] + "..." if len(art.get("lead", "")) > 180 else art.get("lead", "")

# 1. Output data/blogs-database.json
json_path = os.path.join(DATA_DIR, 'blogs-database.json')
with open(json_path, 'w', encoding='utf-8') as f:
    json.dump(ALL_ARTICLES, f, indent=2, ensure_ascii=False)
print(f"Written: {json_path} ({len(ALL_ARTICLES)} articles)")

# 2. Output js/blogs-data.js (inline global object for instant load without CORS)
js_path = os.path.join(JS_DIR, 'blogs-data.js')
with open(js_path, 'w', encoding='utf-8') as f:
    f.write("/* Balance & Bliss 110 Clinical Blog Database (Auto-Generated) */\n")
    f.write("window.BB_BLOGS_DATA = ")
    json.dump(ALL_ARTICLES, f, indent=2, ensure_ascii=False)
    f.write(";\n")
print(f"Written: {js_path}")

# 3. Generate 110 Static HTML Files
ARTICLE_TEMPLATE = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <title>{title} | Balance &amp; Bliss Madurai</title>
  <meta name="description" content="{meta_desc}">
  <meta name="keywords" content="{keywords}">
  <link rel="canonical" href="https://www.balanceandbliss.in/{slug}">

  <!-- Open Graph -->
  <meta property="og:type" content="article">
  <meta property="og:title" content="{title}">
  <meta property="og:description" content="{meta_desc}">
  <meta property="og:image" content="{image}">
  <meta property="og:url" content="https://www.balanceandbliss.in/{slug}">

  <!-- Favicon -->
  <link rel="icon" type="image/svg+xml" href="assets/icons/logo-icon.svg">
  <link rel="apple-touch-icon" href="assets/icons/logo-icon.svg">

  <!-- Stylesheet -->
  <link rel="stylesheet" href="css/styles.css">

  <!-- JSON-LD MedicalWebPage & BlogPosting Schema -->
  <script type="application/ld+json">
  {{
    "@context": "https://schema.org",
    "@type": ["BlogPosting", "MedicalWebPage"],
    "@id": "https://www.balanceandbliss.in/{slug}#article",
    "headline": "{title_escaped}",
    "description": "{meta_desc_escaped}",
    "image": "https://www.balanceandbliss.in/{image}",
    "datePublished": "{publish_date}",
    "dateModified": "{publish_date}",
    "author": {{
      "@type": "Physician",
      "name": "Dr. M. Mehraj Abdullah",
      "honorificPrefix": "Dr.",
      "jobTitle": "Head Consultant & Drugless Medicine Practitioner",
      "identifier": "ATAMA Reg. No: 20261714 / TN",
      "url": "https://www.balanceandbliss.in/about"
    }},
    "publisher": {{
      "@type": "MedicalClinic",
      "name": "Balance and Bliss",
      "url": "https://www.balanceandbliss.in/"
    }},
    "about": {{
      "@type": "MedicalCondition",
      "name": "{condition_escaped}",
      "possibleTreatment": [
        {therapies_json}
      ]
    }}
  }}
  </script>
</head>
<body id="article-page">

  <!-- ==========================================================================
       SITE HEADER / NAVIGATION
       ========================================================================== -->
  <header class="site-header" role="banner">
    <div class="container header-inner">
      <a href="/" class="brand-logo" aria-label="Balance and Bliss Home">
        Balance &amp; Bliss
      </a>

      <nav role="navigation" aria-label="Main Navigation">
        <ul class="nav-menu">
          <li><a href="/" class="nav-link">Home</a></li>
          <li><a href="/about" class="nav-link">About</a></li>
          <li><a href="/foot-reflexology-madurai" class="nav-link">Foot Reflexology</a></li>
          <li><a href="/services" class="nav-link">Services</a></li>
          <li><a href="/academy" class="nav-link">Academy</a></li>
          <li><a href="/blog" class="nav-link active">Blog</a></li>
          <li><a href="/contact" class="nav-link">Contact</a></li>
        </ul>
      </nav>

      <a href="https://wa.me/918838452088?text=Hello%20Dr.%20Mehraj,%20I%20read%20your%20article%20on%20{whatsapp_topic}%20and%20would%20like%20to%20book%20a%20consultation." 
         target="_blank" 
         rel="noopener" 
         class="btn-pill btn-pill-light">
        Book Consultation
      </a>

      <!-- Mobile Hamburger Button -->
      <button class="mobile-toggle" aria-label="Toggle navigation menu" aria-expanded="false">
        <span></span>
        <span></span>
        <span></span>
      </button>
    </div>
  </header>

  <!-- Mobile Drawer -->
  <div class="mobile-drawer-backdrop" aria-hidden="true"></div>
  <aside class="mobile-drawer" aria-label="Mobile Navigation Drawer">
    <nav>
      <ul class="mobile-nav-list">
        <li><a href="/" class="mobile-nav-link">Home</a></li>
        <li><a href="/about" class="mobile-nav-link">About Doctor</a></li>
        <li><a href="/foot-reflexology-madurai" class="mobile-nav-link">Foot Reflexology</a></li>
        <li><a href="/services" class="mobile-nav-link">Services</a></li>
        <li><a href="/academy" class="mobile-nav-link">Academy &amp; Courses</a></li>
        <li><a href="/blog" class="mobile-nav-link active">Blog &amp; Insights</a></li>
        <li><a href="/contact" class="mobile-nav-link">Contact &amp; Map</a></li>
      </ul>
    </nav>
    <div style="margin-top: 2rem;">
      <a href="https://wa.me/918838452088?text=Hello%20Dr.%20Mehraj,%20I%20would%20like%20to%20book%20a%20consultation%20at%20Balance%20and%20Bliss." 
         target="_blank" 
         rel="noopener" 
         class="btn-pill btn-pill-light" 
         style="width: 100%; text-align: center;">
        Book Consultation (8838452088)
      </a>
    </div>
  </aside>

  <main>
    <article class="article-container">
      
      <!-- Article Header -->
      <header class="article-header">
        <div class="breadcrumbs" style="justify-content: center; margin-bottom: 1.5rem;">
          <a href="/">Home</a>
          <span class="sep">&gt;</span>
          <a href="/blog">Blog</a>
          <span class="sep">&gt;</span>
          <span class="current">{short_title}</span>
        </div>

        <span class="blog-category-pill">{category} &bull; Clinical Guide</span>

        <h1 class="article-h1">
          {title}
        </h1>

        <p class="article-lead">
          {lead}
        </p>

        <!-- Author Bar -->
        <div class="article-author-bar">
          <img src="assets/images/about-doctor-landscape.jpg" alt="Dr. M. Mehraj Abdullah, M.D (Acu)" class="article-author-avatar">
          <div class="article-author-meta">
            <span class="article-author-name">Dr. M. Mehraj Abdullah, M.D (Acu)</span>
            <span class="article-author-sub">ATAMA Reg. No: 20261714 / TN &bull; {formatted_date} &bull; {read_time}</span>
          </div>
        </div>
      </header>

      <!-- Featured Image -->
      <div class="article-featured-image-wrap">
        <img src="{image}" alt="{image_alt}">
        <div class="article-caption">
          {caption}
        </div>
      </div>

      <!-- Clinical Body Content -->
      <div class="article-content">
        <h2>{sec1_h2}</h2>
        <p>
          {sec1_p}
        </p>

        <h2>{sec2_h2}</h2>
        <p>
          {sec2_p}
        </p>

        <!-- Key Takeaway Callout Box -->
        <div class="article-takeaway-box">
          <h4>{takeaway_title}</h4>
          <p>
            {takeaway_text}
          </p>
        </div>

        <h2>{sec3_h2}</h2>
        <p>
          {sec3_p}
        </p>

        <h2>Consult Dr. M. Mehraj Abdullah at Balance &amp; Bliss Madurai</h2>
        <p>
          If you or a family member in Madurai are experiencing chronic discomfort, don't rely on temporary pharmaceutical suppression. Experience the restorative healing power of certified clinical drugless medicine in a hygienic, unhurried medical wellness environment.
        </p>
      </div>

      <!-- Author Bio Card -->
      <div class="article-author-bio-card">
        <img src="assets/images/doctor-mehraj-consultation.jpg" alt="Dr. M. Mehraj Abdullah, M.D (Acu)" class="article-author-bio-avatar">
        <div class="article-author-bio-text">
          <h3>Written by Dr. M. Mehraj Abdullah, M.D (Acu)</h3>
          <p>
            Dr. M. Mehraj Abdullah is the Head Practitioner at Balance and Bliss Healing Therapies and Academy in K.K Nagar, Madurai. Registered under ATAMA (Reg. No: 20261714 / TN), Dr. Mehraj specializes in drugless Foot Reflexology, Classical Acupuncture, and Spinal Thermal Decompression, having personally treated over 200+ patients across South Tamil Nadu.
          </p>
        </div>
      </div>

      <!-- High-Conversion Booking CTA Box (NO PRICING MENTIONED) -->
      <div class="article-cta-box">
        <h3>Experience Doctor-Led Natural Healing</h3>
        <p>
          Consult Dr. M. Mehraj Abdullah for a personalized Clinical Session at Balance &amp; Bliss, K.K Nagar, Madurai. Prior appointments ensure dedicated one-on-one attention with reserved parking.
        </p>
        <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
          <a href="https://wa.me/918838452088?text=Hello%20Dr.%20Mehraj,%20I%20read%20your%20article%20on%20{whatsapp_topic}%20and%20would%20like%20to%20book%20a%20consultation." 
             target="_blank" 
             rel="noopener" 
             class="btn-pill btn-pill-gold" 
             style="padding: 0.95rem 2.25rem;">
            Book on WhatsApp &rarr;
          </a>
          <a href="tel:8838452088" 
             class="btn-pill btn-pill-light" 
             style="background: rgba(255, 255, 255, 0.12); padding: 0.95rem 2rem;">
            Call Clinic: 8838452088
          </a>
        </div>
      </div>

      <!-- Navigation Links -->
      <div style="text-align: center; margin-top: 3rem; display: flex; justify-content: center; gap: 1rem; flex-wrap: wrap;">
        <a href="/blog" class="btn-pill btn-pill-dark" style="background: transparent;">
          &larr; Back to All Clinical Guides
        </a>
        <a href="/foot-reflexology-madurai" class="btn-pill btn-pill-dark" style="background: transparent;">
          Foot Reflexology Clinic Details &rarr;
        </a>
      </div>

    </article>
  </main>

  <!-- ==========================================================================
       SITE FOOTER
       ========================================================================== -->
  <footer class="site-footer" role="contentinfo">
    <div class="container">
      <div class="footer-top-grid">
        <div class="footer-brand-col">
          <div class="footer-logo-box">
            <img src="assets/icons/logo-icon.svg" alt="Balance and Bliss Logo Emblem">
          </div>
          <h3 class="footer-brand-name">Balance &amp; Bliss</h3>
          <div class="footer-contact-info">
            <p><strong>Dr. M. Mehraj Abdullah, M.D (Acu)</strong></p>
            <p>ATAMA Reg. No: 20261714 / TN</p>
            <p><a href="tel:8838452088">8838452088</a> &bull; <a href="tel:9842251844">9842251844</a></p>
            <p><a href="mailto:balanceandblisshealings@gmail.com">balanceandblisshealings@gmail.com</a></p>
            <p>B6/17 Housing Board Colony, K.K Nagar, Madurai 625020</p>
            <p>Near Annanagar Police Station, Opp. Ibaco (Dedicated Parking)</p>
          </div>
          <div class="footer-links-list" style="margin-top: 1.5rem;">
            <a href="/">Home</a> &bull;
            <a href="/about">About</a> &bull;
            <a href="/foot-reflexology-madurai">Foot Reflexology</a> &bull;
            <a href="/services">Services</a> &bull;
            <a href="/academy">Academy</a> &bull;
            <a href="/blog">Blog</a> &bull;
            <a href="/contact">Contact</a>
          </div>
          <div class="footer-links-list" style="margin-top: 0.5rem;">
            <a href="/privacy-policy">Privacy Policy</a> &bull;
            <a href="/accessibility-statement">Accessibility Statement</a>
          </div>
        </div>

        <div class="footer-newsletter-col">
          <h3 class="newsletter-title">Subscribe to Health Articles</h3>
          <form id="newsletter-form" class="newsletter-form" novalidate>
            <div class="newsletter-input-group">
              <label for="newsletter-email">Email *</label>
              <input type="email" id="newsletter-email" name="email" required>
            </div>
            <div class="newsletter-checkbox-group">
              <input type="checkbox" id="newsletter-consent" required checked>
              <label for="newsletter-consent">Yes, send me evidence-based natural healing tips.*</label>
            </div>
            <button type="submit" class="btn-pill btn-pill-light" style="align-self: flex-start; width: 100%;">
              Subscribe
            </button>
          </form>
        </div>
      </div>

      <div class="footer-bottom-bar">
        <p class="copyright-text">
          &copy; 2026 by Balance and Bliss Healing Therapies and Academy. Non Drug Medicine.
        </p>
      </div>
    </div>
  </footer>

  <!-- Floating WhatsApp Quick-Chat Button (NO SHADOW) -->
  <a href="https://wa.me/918838452088?text=Hello%20Dr.%20Mehraj,%20I%20would%20like%20to%20inquire%20about%20Foot%20Reflexology%20at%20Balance%20and%20Bliss." 
     target="_blank" 
     rel="noopener" 
     class="whatsapp-float-btn" 
     aria-label="Chat directly on WhatsApp">
    <img src="assets/icons/whatsapp.svg" alt="" width="26" height="26">
    <span class="whatsapp-float-text">Book on WhatsApp</span>
  </a>

  <!-- JavaScript -->
  <script src="js/main.js"></script>
</body>
</html>
"""

print("Generating 110 Static HTML Article Files...")
count_generated = 0

for art in ALL_ARTICLES:
    filename = f"{art['slug']}.html"
    filepath = os.path.join(BASE_DIR, filename)

    # Format therapies JSON for schema
    therapies_json = ",\n        ".join([f'{{"@type": "MedicalTherapy", "name": "{t}"}}' for t in art.get("therapies", ["Clinical Foot Reflexology"])])
    
    # URL encoded topic for WhatsApp
    whatsapp_topic = art["short_title"].replace(" ", "%20").replace("&", "%26")
    
    html_content = ARTICLE_TEMPLATE.format(
        title=art["title"],
        title_escaped=art["title"].replace('"', '\\"'),
        meta_desc=art["meta_desc"],
        meta_desc_escaped=art["meta_desc"].replace('"', '\\"'),
        keywords=art["keywords"],
        slug=art["slug"],
        image=art["image"],
        image_alt=art.get("image_alt", art["title"]),
        caption=art.get("caption", "Clinical healing insights at Balance & Bliss in K.K Nagar, Madurai."),
        publish_date=art["publishDate"],
        formatted_date=art["formattedDate"],
        read_time=art.get("read_time", "6 min read"),
        category=art["category"],
        short_title=art["short_title"],
        lead=art["lead"],
        condition_escaped=art.get("condition", "Musculoskeletal Condition").replace('"', '\\"'),
        therapies_json=therapies_json,
        whatsapp_topic=whatsapp_topic,
        sec1_h2=art.get("sec1_h2", "Clinical Understanding of the Condition"),
        sec1_p=art.get("sec1_p", ""),
        sec2_h2=art.get("sec2_h2", "The Evidence-Based Reflexology Protocol"),
        sec2_p=art.get("sec2_p", ""),
        takeaway_title=art.get("takeaway_title", "Doctor's Advice"),
        takeaway_text=art.get("takeaway_text", ""),
        sec3_h2=art.get("sec3_h2", "Clinical Outcomes and Recovery Trajectory"),
        sec3_p=art.get("sec3_p", "")
    )

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(html_content)
    count_generated += 1

print(f"Successfully generated {count_generated} static HTML article files!")

# 4. Update sitemap.xml
sitemap_path = os.path.join(BASE_DIR, 'sitemap.xml')
sitemap_urls = [
    {"loc": "https://www.balanceandbliss.in/", "priority": "1.0", "changefreq": "weekly", "lastmod": "2026-10-21"},
    {"loc": "https://www.balanceandbliss.in/foot-reflexology-madurai", "priority": "0.95", "changefreq": "weekly", "lastmod": "2026-10-21"},
    {"loc": "https://www.balanceandbliss.in/services", "priority": "0.85", "changefreq": "weekly", "lastmod": "2026-10-21"},
    {"loc": "https://www.balanceandbliss.in/about", "priority": "0.80", "changefreq": "monthly", "lastmod": "2026-10-21"},
    {"loc": "https://www.balanceandbliss.in/academy", "priority": "0.85", "changefreq": "weekly", "lastmod": "2026-10-21"},
    {"loc": "https://www.balanceandbliss.in/blog", "priority": "0.90", "changefreq": "daily", "lastmod": "2026-10-21"},
    {"loc": "https://www.balanceandbliss.in/contact", "priority": "0.80", "changefreq": "monthly", "lastmod": "2026-10-21"},
    {"loc": "https://www.balanceandbliss.in/privacy-policy", "priority": "0.30", "changefreq": "yearly", "lastmod": "2026-10-21"},
    {"loc": "https://www.balanceandbliss.in/accessibility-statement", "priority": "0.30", "changefreq": "yearly", "lastmod": "2026-10-21"}
]

for art in ALL_ARTICLES:
    sitemap_urls.append({
        "loc": f"https://www.balanceandbliss.in/{art['slug']}",
        "priority": "0.80",
        "changefreq": "monthly",
        "lastmod": art["publishDate"]
    })

with open(sitemap_path, 'w', encoding='utf-8') as f:
    f.write('<?xml version="1.0" encoding="UTF-8"?>\n')
    f.write('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n')
    for u in sitemap_urls:
        f.write('  <url>\n')
        f.write(f'    <loc>{u["loc"]}</loc>\n')
        f.write(f'    <lastmod>{u["lastmod"]}</lastmod>\n')
        f.write(f'    <changefreq>{u["changefreq"]}</changefreq>\n')
        f.write(f'    <priority>{u["priority"]}</priority>\n')
        f.write('  </url>\n')
    f.write('</urlset>\n')

print(f"Updated: {sitemap_path} with {len(sitemap_urls)} indexed URLs!")
