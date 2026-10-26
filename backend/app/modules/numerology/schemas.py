from datetime import date
from pydantic import BaseModel, Field, field_validator


class NumerologyCalculateRequest(BaseModel):
    full_name: str = Field(min_length=1, max_length=200)
    date_of_birth: date
    target_year: int = Field(default_factory=lambda: date.today().year, ge=1900, le=2200)
    context: str | None = Field(default=None, max_length=100)

    @field_validator("full_name")
    @classmethod
    def normalize_name(cls, value: str) -> str:
        value = " ".join(value.split())
        if not value:
            raise ValueError("Full name cannot be blank.")
        return value


class KnowledgeRecordOut(BaseModel):
    record_id: str
    number: int
    compound_number: int | None
    planet: str | None
    numerology_component: str
    target_year: int | None
    context: str | None
    category: str
    trait: str
    claim: str
    polarity: str | None
    source_name: str
    source_url: str | None
    source_wording: str | None
    claim_type: str
    verification_status: str

    model_config = {"from_attributes": True}
