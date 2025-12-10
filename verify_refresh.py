import requests
import json
import sys

BASE_URL = "http://localhost:8081/api/auth"

def verify_refresh_flow():
    # 1. Login
    print("1. Logging in...")
    login_payload = {
        "username": "validuser1",
        "password": "password123"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/login", json=login_payload)
        response.raise_for_status()
        data = response.json()
        
        access_token_1 = data.get("accessToken")
        refresh_token = data.get("refreshToken")
        
        if not access_token_1 or not refresh_token:
            print("FAILED: Tokens not found in login response")
            print(data)
            return False
            
        print(f"   SUCCESS: Got Access Token ({access_token_1[:10]}...) & Refresh Token ({refresh_token})")
        
    except Exception as e:
        print(f"FAILED: Login error - {e}")
        return False

    # 2. Refresh Token
    print("\n2. Requesting new token with Refresh Token...")
    refresh_payload = {
        "refreshToken": refresh_token
    }
    
    try:
        response = requests.post(f"{BASE_URL}/refresh", json=refresh_payload)
        response.raise_for_status()
        data = response.json()
        
        access_token_2 = data.get("accessToken")
        
        if not access_token_2:
            print("FAILED: New Access Token not found in refresh response")
            print(data)
            return False
            
        if access_token_1 == access_token_2:
             print("WARNING: Access Token is identical (it might not have expired yet, but should be a new string generally if issuedAt changed)")
             
        print(f"   SUCCESS: Got New Access Token ({access_token_2[:10]}...)")
        
    except Exception as e:
        print(f"FAILED: Refresh error - {e}")
        print(response.text)
        return False
        
    return True

if __name__ == "__main__":
    if verify_refresh_flow():
        print("\n[VERIFICATION PASSED] Refresh Token flow is working correctly.")
        sys.exit(0)
    else:
        print("\n[VERIFICATION FAILED]")
        sys.exit(1)
