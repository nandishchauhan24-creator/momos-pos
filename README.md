# MOMO MTN. — Momos POS (GitHub Pages)

A simple two-device point-of-sale website with an Eastern Himalayan / Buddhist-inspired mountain theme.

## Features
- Cashier: customer name, Dine in / Takeaway, menu selection, half/full plate, quantity controls and automatic bill total.
- Kitchen: live order board with New → Preparing → Ready status buttons.
- No sign-in, no printing.
- Firebase Firestore synchronises orders between devices.
- Full-plate prices are prefilled from the final menu supplied by the stall.
- Half-plate prices are deliberately left blank and can be entered later from the cashier screen.

## Menu and full-plate prices

| Category | Dish | Full plate |
|---|---|---:|
| Kurkure | Paneer Kurkure | ₹100 |
| Kurkure | Veg Kurkure | ₹80 |
| Kurkure | Cheese Corn Kurkure | ₹110 |
| Steam | Veg Steam | ₹60 |
| Steam | Paneer Steam | ₹70 |
| Steam | Cheese Corn Steam | ₹100 |
| Fry | Veg Fry | ₹70 |
| Fry | Paneer Fry | ₹80 |
| Fry | Cheese Corn Fry | ₹100 |
| Gravy – Afghani Style | Paneer Afghani Style | ₹150 |
| Gravy – Afghani Style | Veg Afghani Style | ₹140 |
| Gravy – Afghani Style | Cheese Corn Afghani Style | ₹170 |
| Gravy – Malai | Veg Malai Style | ₹150 |
| Gravy – Malai | Paneer Malai Style | ₹140 |
| Gravy – Malai | Cheese Corn Malai Style | ₹170 |
| Gravy – Manchurian Style | Veg Manchurian Style | ₹140 |
| Gravy – Manchurian Style | Paneer Manchurian Style | ₹180 |
| Gravy – Manchurian Style | Cheese Corn Manchurian Style | ₹200 |
| Ragi Style | Veg Ragi Style | ₹90 |
| Ragi Style | Paneer Ragi Style | ₹100 |
| Ragi Style | Cheese Corn Ragi Style | ₹150 |

## Step 1 — Create Firebase project
1. Open https://console.firebase.google.com/ and create a project.
2. Open **Build → Firestore Database** and create a database.
3. Open **Project settings → General → Your apps → Add app → Web**.
4. Register the web app and copy the Firebase configuration object.
5. Open `app.js`. Replace the six `PASTE_...` values in `firebaseConfig` with the matching values from Firebase. Do not change the property names.

## Step 2 — Set Firestore rules (no-login trial)
In Firestore Database → Rules, paste and publish:

```text
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /orders/{orderId} {
      allow read, write: if true;
    }
  }
}
```

**Security warning:** This intentionally open setup allows anyone who knows the website URL and database project details to read, add, edit or delete order data through the public app. Do not store sensitive customer information. It is suitable only as a low-security trial for a small stall. A shared PIN or proper access control is recommended before relying on it for business records.

## Step 3 — Publish with GitHub Pages
1. Sign in to https://github.com/.
2. Create a repository named `momos-pos` (Public).
3. Upload `index.html`, `style.css`, `app.js`, and `README.md` directly into the repository root (not inside another folder).
4. Open **Settings → Pages**.
5. Under Build and deployment, choose **Deploy from a branch**.
6. Choose branch `main` and folder `/ (root)`, then Save.
7. Wait for the green deployment check. Your address will be `https://YOUR-GITHUB-USERNAME.github.io/momos-pos/`.

## Step 4 — Use on two devices
1. Open the website on the cashier device and use **Cashier desk**.
2. Open the same URL on the kitchen device and choose **Kitchen display**.
3. Both devices must have internet access. New orders should appear in the kitchen automatically.
4. In the kitchen, tap **Mark Preparing**, then **Mark Ready** as the order progresses.

## Step 5 — Add half-plate prices later
1. On the cashier device, open the **Set half-plate prices** section below the menu.
2. Enter the half-plate price next to each dish you want to sell as a half plate.
3. The values save automatically in that browser on that device.
4. Until a dish's half price is entered, its half-plate button asks you to set the price first. Full-plate ordering continues to work normally.

Half-plate prices are stored in that cashier browser's local storage, not in Firebase. If you clear browser data or change cashier devices, you must enter them again. Once an order is sent, its item prices and total are stored with that order, so the kitchen sees the correct order summary.

## Notes
- No printing is included.
- There is no login or staff account system, as requested.
- Keep the same repository and Firebase project when updating the website; replace the existing files with the newer versions.
