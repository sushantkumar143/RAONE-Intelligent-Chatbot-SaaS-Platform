"""
RAONE - LLM Service
Handles the LLM fallback chain: Groq -> OpenRouter -> HuggingFace -> Ollama.
"""

import httpx
import logging
from typing import List, Dict

from app.config import settings

logger = logging.getLogger(__name__)


async def _call_groq(messages: List[Dict], temperature: float = 0.7, max_tokens: int = 2048) -> Dict:
    """Call Groq API."""
    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {settings.GROQ_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": settings.GROQ_MODEL,
                "messages": messages,
                "temperature": temperature,
                "max_tokens": max_tokens,
            },
        )
        response.raise_for_status()
        data = response.json()
        usage = data.get("usage", {})
        return {
            "content": data["choices"][0]["message"]["content"],
            "input_tokens": usage.get("prompt_tokens", 0),
            "output_tokens": usage.get("completion_tokens", 0),
            "model": settings.GROQ_MODEL,
        }


async def _call_openrouter(messages: List[Dict], temperature: float = 0.7, max_tokens: int = 2048) -> Dict:
    """Call OpenRouter API."""
    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(
            f"{settings.OPENROUTER_BASE_URL}/chat/completions",
            headers={
                "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
                "Content-Type": "application/json",
                "HTTP-Referer": settings.BACKEND_URL,
                "X-Title": settings.APP_NAME,
            },
            json={
                "model": settings.OPENROUTER_MODEL,
                "messages": messages,
                "temperature": temperature,
                "max_tokens": max_tokens,
            },
        )
        response.raise_for_status()
        data = response.json()
        usage = data.get("usage", {})
        return {
            "content": data["choices"][0]["message"]["content"],
            "input_tokens": usage.get("prompt_tokens", 0),
            "output_tokens": usage.get("completion_tokens", 0),
            "model": settings.OPENROUTER_MODEL,
        }


async def _call_huggingface(messages: List[Dict], temperature: float = 0.7, max_tokens: int = 2048) -> Dict:
    """Call HuggingFace Inference API."""
    prompt = ""
    for msg in messages:
        role = msg["role"]
        content = msg["content"]
        if role == "system":
            prompt += f"System: {content}\n\n"
        elif role == "user":
            prompt += f"User: {content}\n\n"
        elif role == "assistant":
            prompt += f"Assistant: {content}\n\n"
    prompt += "Assistant: "

    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(
            f"https://api-inference.huggingface.co/models/{settings.HF_MODEL}",
            headers={
                "Authorization": f"Bearer {settings.HUGGINGFACE_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "inputs": prompt,
                "parameters": {
                    "temperature": temperature,
                    "max_new_tokens": max_tokens,
                    "return_full_text": False,
                },
            },
        )
        response.raise_for_status()
        data = response.json()
        content = ""
        if isinstance(data, list):
            content = data[0].get("generated_text", "")
        else:
            content = data.get("generated_text", "")
            
        return {
            "content": content,
            "input_tokens": len(prompt.split()) * 2,  # Rough estimate
            "output_tokens": len(content.split()) * 2, # Rough estimate
            "model": settings.HF_MODEL,
        }


async def _call_ollama(messages: List[Dict], temperature: float = 0.7, max_tokens: int = 2048) -> Dict:
    """Call local Ollama instance."""
    async with httpx.AsyncClient(timeout=120.0) as client:
        response = await client.post(
            f"{settings.OLLAMA_BASE_URL}/api/chat",
            json={
                "model": settings.OLLAMA_MODEL,
                "messages": messages,
                "stream": False,
                "options": {
                    "temperature": temperature,
                    "num_predict": max_tokens,
                },
            },
        )
        response.raise_for_status()
        data = response.json()
        return {
            "content": data["message"]["content"],
            "input_tokens": data.get("prompt_eval_count", 0),
            "output_tokens": data.get("eval_count", 0),
            "model": settings.OLLAMA_MODEL,
        }


async def generate_response(
    messages: List[Dict],
    temperature: float = 0.7,
    max_tokens: int = 2048,
) -> Dict:
    """
    Generate an LLM response using the fallback chain.
    Groq -> OpenRouter -> HuggingFace -> Ollama
    Returns a dict containing content, input_tokens, output_tokens, and model.
    """
    providers = []

    if settings.GROQ_API_KEY:
        providers.append(("groq", _call_groq))
    if settings.OPENROUTER_API_KEY:
        providers.append(("openrouter", _call_openrouter))
    if settings.HUGGINGFACE_API_KEY:
        providers.append(("huggingface", _call_huggingface))
    # Ollama is always available as final fallback
    providers.append(("ollama", _call_ollama))

    last_error = None
    for provider_name, provider_fn in providers:
        try:
            logger.info(f"Attempting LLM call via {provider_name}...")
            result = await provider_fn(messages, temperature, max_tokens)
            logger.info(f"Successfully got response from {provider_name}")
            return result
        except Exception as e:
            logger.warning(f"LLM provider {provider_name} failed: {e}")
            last_error = e
            continue

    raise RuntimeError(f"All LLM providers failed. Last error: {last_error}")
