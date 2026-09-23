import json
from concurrent.futures import ThreadPoolExecutor

import litellm

from app.agents.tools import TOOL_SCHEMAS, build_tool_agents

MAX_TOOL_TURNS = 4


def run_primary_agent(
    persona_prompt: str,
    world_context: str,
    narrative: str,
    question: str,
    primary_model: str,
    tool_model: str,
    history: list[dict] | None = None,
) -> str:
    """Run a primary agent with its three tool agents until it produces a final analysis."""
    tools = build_tool_agents(world_context, narrative, tool_model)
    messages = [{"role": "system", "content": persona_prompt}]
    messages.extend(history or [])
    messages.append({"role": "user", "content": question})
    for _ in range(MAX_TOOL_TURNS):
        response = litellm.completion(model=primary_model, messages=messages, tools=TOOL_SCHEMAS)
        message = response.choices[0].message
        if not message.tool_calls:
            return message.content
        messages.append(message.model_dump())
        with ThreadPoolExecutor(max_workers=len(message.tool_calls)) as executor:
            futures = {
                tool_call.id: executor.submit(
                    tools[tool_call.function.name], **json.loads(tool_call.function.arguments)
                )
                for tool_call in message.tool_calls
            }
        for tool_call in message.tool_calls:
            messages.append(
                {
                    "role": "tool",
                    "tool_call_id": tool_call.id,
                    "content": futures[tool_call.id].result(),
                }
            )
    return messages[-1]["content"]
