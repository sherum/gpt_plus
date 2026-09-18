from collections.abc import Callable

from app.llm import complete

TOOL_SCHEMAS = [
    {
        "type": "function",
        "function": {
            "name": "check_worldbuilding_consistency",
            "description": "Check whether an idea is consistent with the selected world-building sources.",
            "parameters": {
                "type": "object",
                "properties": {
                    "focus": {
                        "type": "string",
                        "description": "The specific idea or claim to check against the world-building sources.",
                    }
                },
                "required": ["focus"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "check_scientific_plausibility",
            "description": "Assess whether an idea is plausible according to real-world science, independent of the fictional setting.",
            "parameters": {
                "type": "object",
                "properties": {
                    "focus": {
                        "type": "string",
                        "description": "The specific idea or claim to assess for real-world scientific plausibility.",
                    }
                },
                "required": ["focus"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "check_narrative_consistency",
            "description": "Check whether an idea is consistent with the current narrative text.",
            "parameters": {
                "type": "object",
                "properties": {
                    "focus": {
                        "type": "string",
                        "description": "The specific idea or claim to check against the current narrative.",
                    }
                },
                "required": ["focus"],
            },
        },
    },
]


def build_tool_agents(world_context: str, narrative: str, model: str) -> dict[str, Callable[[str], str]]:
    """Bind the tool agents to a request's world-building context, narrative, and model."""

    def check_worldbuilding_consistency(focus: str) -> str:
        system_prompt = (
            "You check whether an idea is consistent with the following world-building "
            "sources. Only rely on these sources; do not invent canon. Identify any "
            f"contradictions explicitly.\n\n{world_context}"
        )
        return complete(model, system_prompt, focus)

    def check_scientific_plausibility(focus: str) -> str:
        system_prompt = (
            "You assess the real-world scientific plausibility of an idea, independent "
            "of any fictional setting. Be concise and specific about what is and isn't "
            "plausible."
        )
        return complete(model, system_prompt, focus)

    def check_narrative_consistency(focus: str) -> str:
        system_prompt = (
            "You check whether an idea is consistent with the following current "
            f"narrative text. Identify any contradictions explicitly.\n\n{narrative}"
        )
        return complete(model, system_prompt, focus)

    return {
        "check_worldbuilding_consistency": check_worldbuilding_consistency,
        "check_scientific_plausibility": check_scientific_plausibility,
        "check_narrative_consistency": check_narrative_consistency,
    }
