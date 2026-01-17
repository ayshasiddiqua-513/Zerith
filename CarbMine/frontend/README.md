# Zerith Frontend

## Recommendations Page

- New route: `/recommendations` (requires auth via `ProtectedRoute`).
- Fetches recommendations from backend `POST /recommend_strategies`.
- Displays categorized cards with impact level and estimated reduction.

Development:
- Ensure `REACT_APP_API_URL` points to your backend (e.g., `http://127.0.0.1:8000`).
- Run `npm start`.


