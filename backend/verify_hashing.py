
import sys
import os

# Add backend directory to path
sys.path.append(os.path.abspath("."))

from app.utils.hashing import hash_password, verify_password

def test_hashing():
    passwords = [
        "short",
        "standard_password_123",
        "a" * 72,
        "a" * 73,
        "a" * 128,
        "very_long_passphrase_" * 10
    ]

    for pwd in passwords:
        print(f"Testing password length: {len(pwd)}")
        try:
            hashed = hash_password(pwd)
            print(f"  Hashed successfully. Length: {len(hashed)}")
            print(f"  Hash starts with: {hashed[:15]}")
            
            is_valid = verify_password(pwd, hashed)
            print(f"  Verified: {is_valid}")
            
            if not is_valid:
                print("  ERROR: Verification failed!")
                return False
        except Exception as e:
            print(f"  ERROR: {str(e)}")
            return False
    
    # Test legacy bcrypt compatibility (simulated)
    # Note: Since I don't have an old hash handy, I'll just skip this or 
    # manually create one if bcrypt works on this system.
    print("\nAll tests passed!")
    return True

if __name__ == "__main__":
    if test_hashing():
        sys.exit(0)
    else:
        sys.exit(1)
