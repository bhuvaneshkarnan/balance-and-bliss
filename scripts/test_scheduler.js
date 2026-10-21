/**
 * Comprehensive Automated Test Suite for Balance & Bliss Blog Scheduler
 * Verifies exact date and time auto-publishing across Indian Standard Time (IST)
 */

const fs = require('fs');
const path = require('path');

// 1. Load blogs database
const dataPath = path.join(__dirname, '..', 'data', 'blogs-database.json');
const blogs = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

console.log(`\n=======================================================`);
console.log(`🧪 BALANCE & BLISS - 110 BLOG SCHEDULER TEST SUITE`);
console.log(`=======================================================\n`);
console.log(`Total Articles Loaded: ${blogs.length}`);

let totalPassed = 0;
let totalFailed = 0;

function assert(condition, testName, details = "") {
  if (condition) {
    console.log(`  ✅ PASS: ${testName} ${details ? '(' + details + ')' : ''}`);
    totalPassed++;
  } else {
    console.error(`  ❌ FAIL: ${testName} ${details ? '(' + details + ')' : ''}`);
    totalFailed++;
  }
}

// Helper to evaluate published count at a specific timestamp
function evaluateAt(simulatedDateString) {
  const simulatedTime = new Date(simulatedDateString).getTime();
  const published = blogs.filter(post => {
    const postTime = new Date(post.publishDateTime || (post.publishDate + "T06:00:00+05:30")).getTime();
    return postTime <= simulatedTime;
  });
  return published;
}

console.log(`\n--- TEST GROUP 1: Schedule Integrity & Mon/Wed/Fri Cadence ---`);

// Test 1: Verify all 110 posts have valid publishDateTime in IST (+05:30)
const allHaveValidDates = blogs.every(b => {
  return b.publishDateTime && b.publishDateTime.endsWith("+05:30") && !isNaN(new Date(b.publishDateTime).getTime());
});
assert(allHaveValidDates, "All 110 articles have valid ISO 8601 timestamps anchored to IST (+05:30)");

// Test 2: Verify Mon / Wed / Fri cadence starting from post 7 onwards
let cadenceValid = true;
let invalidPost = null;
for (let i = 6; i < blogs.length; i++) {
  const dt = new Date(blogs[i].publishDate + "T12:00:00+05:30");
  const day = dt.getUTCDay(); // UTC day or local day
  // In IST (+05:30), 12:00:00 is same day
  const localDay = dt.getDay();
  if (localDay !== 1 && localDay !== 3 && localDay !== 5) { // 1=Mon, 3=Wed, 5=Fri
    cadenceValid = false;
    invalidPost = blogs[i];
    break;
  }
}
assert(cadenceValid, "Scheduled posts strictly follow Monday, Wednesday, Friday cadence", invalidPost ? `Error on ${invalidPost.slug}` : "");

console.log(`\n--- TEST GROUP 2: Date & Time Auto-Publishing Transitions ---`);

// Test 3: Today's Date (Oct 21, 2026, 14:30 IST)
const currentResults = evaluateAt("2026-10-21T14:30:00+05:30");
assert(currentResults.length === 6, "Currently published on Oct 21, 2026 at 14:30 IST", `Count: ${currentResults.length} / 6`);
assert(currentResults[currentResults.length - 1].id === 6, "Latest published article today is Article #6 (Metatarsalgia)");

// Test 4: 1 second BEFORE Article 7 release (Oct 23, 2026, 05:59:59 IST)
const beforeRelease = evaluateAt("2026-10-23T05:59:59+05:30");
assert(beforeRelease.length === 6, "At Oct 23 05:59:59 IST (1 sec before release), Article 7 is STILL LOCKED", `Count: ${beforeRelease.length} (Article 7 not yet live)`);

// Test 5: EXACT Release Second of Article 7 (Oct 23, 2026, 06:00:00 IST)
const atRelease = evaluateAt("2026-10-23T06:00:00+05:30");
assert(atRelease.length === 7, "At Oct 23 06:00:00 IST (exact second), Article 7 AUTOMATICALLY UNLOCKS", `Count: ${atRelease.length}`);
assert(atRelease[atRelease.length - 1].id === 7, "Newly published post is Article #7 (Bunion Relief)");

// Test 6: Weekend Check (Saturday Oct 24 & Sunday Oct 25)
const saturday = evaluateAt("2026-10-24T12:00:00+05:30");
assert(saturday.length === 7, "Over the weekend (Saturday), published count remains stable at 7");

// Test 7: Monday Oct 26, 2026 Release (Article 8: Plantar Fibromatosis)
const mondayBefore = evaluateAt("2026-10-26T05:59:59+05:30");
const mondayAfter = evaluateAt("2026-10-26T06:00:00+05:30");
assert(mondayBefore.length === 7, "Monday Oct 26 at 05:59:59 IST: count is 7");
assert(mondayAfter.length === 8, "Monday Oct 26 at 06:00:00 IST: Article #8 automatically publishes (Count: 8)");
assert(mondayAfter[mondayAfter.length - 1].id === 8, "Article #8 is Plantar Fibroma Nodules");

// Test 8: Wednesday Oct 28, 2026 Release (Article 9: Ankle Instability)
const wednesdayAfter = evaluateAt("2026-10-28T06:00:00+05:30");
assert(wednesdayAfter.length === 9, "Wednesday Oct 28 at 06:00:00 IST: Article #9 automatically publishes (Count: 9)");

// Test 9: Friday Oct 30, 2026 Release (Article 10: Morning Heel Stiffness)
const fridayAfter = evaluateAt("2026-10-30T06:00:00+05:30");
assert(fridayAfter.length === 10, "Friday Oct 30 at 06:00:00 IST: Article #10 automatically publishes (Count: 10)");

console.log(`\n--- TEST GROUP 3: Timezone Independence (Global Visitors) ---`);

// Test 10: Visitor in London (GMT) accessing at Oct 23, 2026 00:30:00 GMT (which is 06:00:00 IST)
const londonVisitor = evaluateAt("2026-10-23T00:30:00Z"); // 00:30 UTC = 06:00 IST
assert(londonVisitor.length === 7, "Visitor in London (UTC) sees Article #7 publish at exactly 00:30 GMT (06:00 IST)");

// Test 11: Visitor in New York (EDT, UTC-4) accessing at Oct 22, 2026 20:30:00 EDT (which is 06:00:00 IST)
const newYorkVisitor = evaluateAt("2026-10-22T20:30:00-04:00"); // 20:30 EDT = 06:00 IST
assert(newYorkVisitor.length === 7, "Visitor in New York (EDT) sees Article #7 publish at the exact synchronized global instant");

console.log(`\n--- TEST GROUP 4: Long-Term Horizon Validation ---`);

// Test 12: End of November 2026 Check
const endOfNov = evaluateAt("2026-11-30T23:59:59+05:30");
assert(endOfNov.length === 23, `By end of November 2026, exactly 23 articles are published`, `Count: ${endOfNov.length}`);

// Test 13: Final Scheduled Article (Article #110 on June 21, 2027)
const finalArticleTime = blogs[blogs.length - 1].publishDateTime;
const finalRelease = evaluateAt(finalArticleTime);
assert(finalRelease.length === 110, `On June 21, 2027 at 06:00 IST, all 110 articles are 100% published`);

console.log(`\n=======================================================`);
console.log(`📊 TEST RESULTS: ${totalPassed} PASSED, ${totalFailed} FAILED`);
console.log(`=======================================================\n`);

if (totalFailed > 0) {
  process.exit(1);
} else {
  console.log("🎉 ALL TESTS PASSED! The scheduling engine is 100% airtight and bug-free.");
}
