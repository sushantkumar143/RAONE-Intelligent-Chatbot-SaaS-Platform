import sys
import os
import asyncio
import logging

# Add backend directory to path
sys.path.append(os.path.abspath("."))

from app.database import async_session, init_db
from app.models.company import Company
from app.models.user import User
from app.schemas.knowledge import TextIngestionRequest

from app.services.knowledge_service import ingest_text
from app.services.chat_service import process_chat_message

# Set up logging to show everything
logging.basicConfig(
    level=logging.INFO,
    format='>>> %(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

async def run_rag_test():
    print("\n--- INITIALIZING PIPELINE TEST ---")
    await init_db()
    
    async with async_session() as db:

        # Create a dummy user and company for testing
        print("\n--- SETTING UP NAMESPACE ---")
        dummy_user = User(email="rag_test@example.com", password_hash="test", full_name="Test User", id="00000000-0000-0000-0000-000000000000")
        db.add(dummy_user)
        try:
             await db.commit()
        except:
             await db.rollback() # User might already exist from previous failed run

        import uuid
        dummy_company = Company(name="Test RAG Company", slug=f"test-rag-{uuid.uuid4().hex[:8]}", owner_id="00000000-0000-0000-0000-000000000000")
        db.add(dummy_company)


        await db.commit()
        await db.refresh(dummy_company)
        
        company_id = dummy_company.id
        print(f"Test Company Created: {company_id}")
        
        # 1. Test Ingestion
        print("\n--- PHASE 1: INGESTION (Text -> Chunk -> Embed -> Index) ---")
        secret_text = (
            "The Project Nexus launch date is confirmed for November 15, 2026. "
            "All marketing materials must be ready by the end of October. "
            "The primary color scheme for the launch is Midnight Blue and Cyber Gold."
        )
        
        req = TextIngestionRequest(title="Project Nexus Info", content=secret_text)
        # This will trigger the asynchronous ingestion process immediately in our updated logic
        await ingest_text(db, company_id, req)
        
        print("\n--- INGESTION COMPLETE ---")
        
        # 2. Test Retrieval via Chat
        print("\n--- PHASE 2: RETRIEVAL & GENERATION (Chat Query) ---")
        question = "What is the launch date for Project Nexus, and what are the colors?"
        print(f"User Question: '{question}'")
        
        try:
            # This triggers vector search AND generation
            message, conv_id = await process_chat_message(db, company_id, question)
            print("\n--- RAG PIPELINE SUCCESS ---")
            print(f"AI Response:\n{message.content}")
        except Exception as e:
             print(f"\n--- RAG PIPELINE FAILED (Generation) ---")
             print(f"Error during response generation (possibly missing LLM keys): {e}")
             print("However, if you see the retrieval logs above (FAISS search, Top K), the RAG pipeline is working!")
        
        # Cleanup
        await db.rollback() # Rollback dummy company

if __name__ == "__main__":
    asyncio.run(run_rag_test())
