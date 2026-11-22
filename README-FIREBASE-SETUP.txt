MOMO MTN. POS — Firebase setup

This project is preconfigured for the Firebase project momo-mtn-9a01c.
It uses Firebase Authentication anonymous sign-in, then Firestore for live orders.

HOW TO RUN
1. Extract this ZIP.
2. Upload the contents of the momo-mtn folder to your GitHub repository (keep index.html, app.js and style.css together).
3. Enable GitHub Pages for the repository (Settings > Pages > deploy from branch > main > /(root)).
4. Open the published site on the cashier device and kitchen device.
5. Wait until the top-right connection label says “Live · Synced”.
6. Place a small test order on Cashier desk. Open Kitchen display on the other device; it should appear under New.
7. Tap “Mark Preparing”, then “Mark Ready” to test status updates.

FIREBASE CHECKS
- Authentication > Sign-in method > Anonymous must be enabled.
- Firestore Database > Rules must be published. The current starter rules permit read/create/update for any signed-in user and deny delete. This is suitable only for initial testing, NOT production security. Anyone who can load the public site may anonymously sign in and access orders. Before real business use, restrict access to authorized staff and validate order fields/status transitions.
- Firestore database must be created in the same project: momo-mtn-9a01c.

NOTES
- No customer accounts, payment gateway, or printing are included.
- Half-plate prices are configurable in the cashier screen and are saved in that browser/device only.
- Do not share this starter security setup as production-secure.
