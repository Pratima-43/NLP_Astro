from app.modules.integration.claims import contributions, select_relevant, themes_for_text


def _claim(cid, module, themes, weight):
    return {"claim_id": cid, "module": module, "themes": themes, "weight": weight}


def test_theme_keywords_match_word_starts_only():
    assert "career" in themes_for_text("How will my career go?")
    assert "creativity" in themes_for_text("artistic temperament")
    assert "creativity" not in themes_for_text("The heart line")


def test_contributions_are_weight_shares_that_sum_to_100():
    selected = {
        "numerology": [_claim("N:1", "numerology", ["career"], 1.0)],
        "astrology": [_claim("A:1", "astrology", ["career"], 1.0), _claim("A:2", "astrology", ["career"], 1.0)],
        "palmistry": [_claim("P:1", "palmistry", ["career"], 0.5)],
    }
    result = {r["module"]: r for r in contributions(["N:1", "A:1", "A:2", "P:1", "unknown"], selected)}
    assert sum(r["percent"] for r in result.values()) == 100
    assert result["astrology"]["percent"] > result["numerology"]["percent"] > result["palmistry"]["percent"]
    assert result["astrology"]["cited_claims"] == 2


def test_contributions_with_nothing_cited_are_zero():
    selected = {"numerology": [], "astrology": [], "palmistry": []}
    assert all(r["percent"] == 0 for r in contributions([], selected))


def test_selection_prefers_matching_themes():
    pool = {"numerology": [_claim("N:1", "numerology", ["relationships"], 1.0), _claim("N:2", "numerology", ["career"], 0.5)],
            "astrology": [], "palmistry": []}
    selected = select_relevant(pool, ["career"])
    assert selected["numerology"][0]["claim_id"] == "N:2"
