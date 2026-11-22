MOMO MTN. POS — Firebase setup

This project is preconfigured for Firebase project momo-mtn-9a01c.
It uses Firebase Authentication anonymous sign-in and Firestore for live orders and product availability.

HOW TO RUN / UPDATE
1. Extract this ZIP.
2. Upload/replace ALL files inside the momo-mtn folder in your GitHub repository (keep index.html, app.js and style.css together).
3. Keep GitHub Pages enabled (Settings > Pages > deploy from branch > main > /(root)).
4. In Firebase Console > Authentication > Sign-in method, enable Anonymous.
5. In Firebase Console > Firestore Database > Rules, replace the rules with the starter rules below and click Publish.
6. Open the published website on cashier and kitchen devices. Wait for “Live · Synced”.

FIRESTORE RULES (STARTER / TESTING ONLY)

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /orders/{orderId} {
      allow read, create, update: if request.auth != null;
      allow delete: if false;
    }
    match /products/{productId} {
      allow read, create, update: if request.auth != null;
      allow delete: if false;
    }
  }
}

FEATURES
- Today's summary counts orders created today using the device's local calendar date. Sales exclude cancelled orders.
- Kitchen statuses New, Preparing, Ready; New/Preparing orders can also be cancelled.
- Product availability is shared live through the Firestore “products” collection. Use “Mark Out of Stock” / “Mark Available” below each menu item. Out-of-stock products cannot be added to an order.
- Half-plate prices remain saved in that cashier browser/device only.

SECURITY NOTE
These starter rules allow any signed-in anonymous user to read and modify orders/products. They are for initial testing only, NOT production security. Before real business use, restrict access to authorized staff and validate order fields/status transitions.

NOTES
No customer accounts, payment gateway, or printing are included.
