"""
RAONE - API Key Seeding Script
Creates a test company and an API key for development and testing.
"""

import asyncio
import uuid
from app.database import init_db, async_session
from app.models.company import Company
from app.models.api_key import ApiKey
from app.utils.hashing import generate_api_key, hash_api_key, get_key_prefix
from sqlalchemy import select


from app.models.user import User

async def seed():
    print("Initializing database...")
    await init_db()

    async with async_session() as db:
        # 0. Check if test user exists
        result = await db.execute(select(User).where(User.email == "test@acme.com"))
        user = result.scalar_one_or_none()
        
        if not user:
            print("Creating test user...")
            user = User(
                id=uuid.uuid4(),
                email="test@acme.com",
                password_hash="test",
                full_name="Acme Tester",
            )
            db.add(user)
            await db.flush()

        # 1. Check if test company already exists
        result = await db.execute(select(Company).where(Company.name == "Acme Corp (Test)"))
        company = result.scalar_one_or_none()

        if not company:
            print("Creating test company: Acme Corp (Test)...")
            company = Company(
                id=uuid.uuid4(),
                name="Acme Corp (Test)",
                slug="acme-test",
                owner_id=user.id
            )
            db.add(company)
            await db.flush()
        else:
            print("Test company already exists.")

        # 2. Generate a new API key
        print("Generating test API key...")
        raw_key = generate_api_key()
        key_hash = hash_api_key(raw_key)
        prefix = get_key_prefix(raw_key)

        api_key = ApiKey(
            company_id=company.id,
            key_hash=key_hash,
            key_prefix=prefix,
            name="Development Key",
            rate_limit=1000,
        )
        db.add(api_key)
        await db.commit()

        print("\n" + "="*50)
        print("SEEDING COMPLETE")
        print("="*50)
        print(f"Company ID: {company.id}")
        print(f"API Key:    {raw_key}")
        print("="*50)
        print("\nIMPORTANT: Copy the API Key above. You will need it for testing.")
        print(f"\nNow run the verification script:")
        print(f"python verify_api_key.py {raw_key}")
        print("="*50 + "\n")


if __name__ == "__main__":
    asyncio.run(seed())
