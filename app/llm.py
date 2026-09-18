import litellm


def openrouter_model(slug: str) -> str:
    """Translate a bare provider/model slug into a litellm OpenRouter model string."""
    return f"openrouter/{slug}"


def complete(model: str, system_prompt: str, question: str, history: list[dict] | None = None) -> str:
    """Run a single chat completion against the given model."""
    messages = [{"role": "system", "content": system_prompt}]
    messages.extend(history or [])
    messages.append({"role": "user", "content": question})
    response = litellm.completion(model=model, messages=messages)
    return response.choices[0].message.content
