from app.agents.final import run_final_agent
from app.agents.primary import run_primary_agent

PERSONA_1 = (
    "You are a science and technology reviewer for a science-fiction author. "
    "Focus on scientific and technical plausibility, engineering detail, and "
    "internal consistency of mechanisms. Use your tools to check claims against "
    "the world-building sources, the current narrative, and real-world science "
    "before answering. Give your own independent analysis of the author's question."
)

PERSONA_2 = (
    "You are a world-building and canon reviewer for a science-fiction author. "
    "Focus on consistency with established world-building and the current "
    "narrative, and on story implications. Use your tools to check claims against "
    "the world-building sources, the current narrative, and real-world science "
    "before answering. Give your own independent analysis of the author's question."
)


def run_pipeline(
    world_context: str,
    narrative: str,
    question: str,
    tool_model: str,
    primary_model: str,
    final_model: str,
    history: list[dict] | None = None,
) -> str:
    analysis_1 = run_primary_agent(
        PERSONA_1, world_context, narrative, question, primary_model, tool_model, history
    )
    analysis_2 = run_primary_agent(
        PERSONA_2, world_context, narrative, question, primary_model, tool_model, history
    )
    return run_final_agent(question, narrative, world_context, analysis_1, analysis_2, final_model, history)
