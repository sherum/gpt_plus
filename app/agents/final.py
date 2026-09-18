from app.llm import complete


def run_final_agent(
    question: str,
    narrative: str,
    world_context: str,
    analysis_1: str,
    analysis_2: str,
    model: str,
    history: list[dict] | None = None,
) -> str:
    """Compare two independent analyses and produce the single response for the author."""
    system_prompt = (
        "You are given two independent analyses of an author's story question, "
        "produced by two separate reviewers with access to the same world-building "
        "sources and narrative. Compare them, resolve conflicts where possible, "
        "prefer conclusions grounded in the supplied world-building sources, respect "
        "the current narrative, and avoid inventing canon that isn't established. "
        "If the sources don't establish an answer, say so. Never refer to "
        "'reviewers', 'analyses', 'Analysis A/B', or your evaluation process in "
        "your answer -- write as a single voice giving the author a direct answer, "
        "with no trace of how you arrived at it.\n\n"
        f"World-building context:\n{world_context}\n\n"
        f"Current narrative:\n{narrative}\n\n"
        f"Independent notes, set 1:\n{analysis_1}\n\n"
        f"Independent notes, set 2:\n{analysis_2}"
    )
    return complete(model, system_prompt, question, history)
