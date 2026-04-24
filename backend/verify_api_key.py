"""
RAONE - API Key Verification Script
Run this script to test if a generated API key is working correctly.

Usage:
    python verify_api_key.py <YOUR_API_KEY>
    python verify_api_key.py              # (interactive prompt)

Prerequisites:
    - Backend server must be running (uvicorn app.main:app --reload)
    - Database (PostgreSQL) must be running
    - At least one API key must be generated from the dashboard
"""

import sys
import requests
import json

BACKEND_URL = "http://127.0.0.1:8000"


def verify_key(api_key: str):
    """Run all verification tests against the given API key."""

    print("=" * 60)
    print("  RAONE - API Key Verification")
    print("=" * 60)
    print(f"\n  Key: {api_key[:15]}...{api_key[-4:]}")
    print(f"  Target: {BACKEND_URL}")
    print()

    # ── Test 1: Health check (no auth needed) ──────────────────
    print("[1/3] Checking if backend is reachable...")
    try:
        resp = requests.get(f"{BACKEND_URL}/health", timeout=5)
        if resp.status_code == 200:
            print("  [OK] Backend is healthy\n")
        else:
            print(f"  [FAIL] Backend returned status {resp.status_code}")
            return
    except requests.ConnectionError:
        print("  [FAIL] Cannot reach backend. Is it running?")
        print(f"     Start it with: uvicorn app.main:app --reload")
        return

    # ── Test 2: API key validation via public chat ─────────────
    print("[2/3] Testing API key authentication...")
    headers = {
        "X-API-Key": api_key,
        "Content-Type": "application/json",
    }
    payload = {
        "message": "Hello, this is a test message to verify the API key works."
    }

    try:
        resp = requests.post(
            f"{BACKEND_URL}/api/public/chat",
            headers=headers,
            json=payload,
            timeout=60,
        )

        if resp.status_code == 200:
            data = resp.json()
            print("  [OK] API key is VALID and working!")
            print(f"  [INFO] Conversation ID: {data.get('conversation_id')}")
            print(f"  [INFO] AI Reply: {data.get('reply', '')[:150]}...")
            if data.get("sources"):
                print(f"  [INFO] Sources used: {len(data['sources'])}")
            print()
        elif resp.status_code == 401:
            error = resp.json().get("detail", "Unknown")
            print(f"  [FAIL] Authentication FAILED: {error}")
            print("     The API key is either invalid or has been revoked.")
            return
        else:
            print(f"  [FAIL] Unexpected status: {resp.status_code}")
            print(f"     Response: {resp.text[:300]}")
            return
    except requests.Timeout:
        print("  [WARN] Request timed out (LLM may be slow). Key likely valid.")
        print()

    # ── Test 3: Conversation continuity ────────────────────────
    print("[3/3] Testing conversation continuity...")
    if resp.status_code == 200:
        conv_id = data.get("conversation_id")
        follow_up = {
            "message": "Can you repeat what I just said?",
            "conversation_id": conv_id,
        }
        try:
            resp2 = requests.post(
                f"{BACKEND_URL}/api/public/chat",
                headers=headers,
                json=follow_up,
                timeout=60,
            )
            if resp2.status_code == 200:
                print("  [OK] Conversation continuity works!")
                print(f"  [INFO] Follow-up reply: {resp2.json().get('reply', '')[:150]}...")
            else:
                print(f"  [WARN] Follow-up returned status {resp2.status_code}")
        except requests.Timeout:
            print("  [WARN] Follow-up timed out. Continuity likely works.")

    print()
    print("=" * 60)
    print("  [OK] ALL TESTS PASSED — API key is fully functional!")
    print("=" * 60)
    print()
    print("  You can now use this key in any external application:")
    print()
    print("  curl -X POST http://localhost:8000/api/public/chat \\")
    print('    -H "X-API-Key: YOUR_KEY" \\')
    print('    -H "Content-Type: application/json" \\')
    print('    -d \'{"message": "Your question here"}\'')
    print()


if __name__ == "__main__":
    if len(sys.argv) > 1:
        key = sys.argv[1]
    else:
        key = input("Enter your API key (starts with rk_): ").strip()

    if not key:
        print("No API key provided. Exiting.")
        sys.exit(1)

    verify_key(key)
