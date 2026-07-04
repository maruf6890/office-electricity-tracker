from pydantic import BaseModel, Field
from typing import List, Literal

class EnergyInsightModel(BaseModel):
    usage_insights: List[str] = Field(
        ...,
        description="Key observations about current energy usage across rooms and devices."
    )

    waste_insights: List[str] = Field(
        ...,
        description="Detected inefficiencies, such as unnecessary power usage, after-hours activity, or idle devices."
    )

    cost_insights: List[str] = Field(
        ...,
        description="Insights related to energy cost, including daily cost, room-wise contribution, and projections."
    )

    overall_status: Literal["Normal", "High Usage", "Critical"] = Field(
        ...,
        description="Overall energy status of the system based on current consumption patterns."
    )

    recommendation: List[str] = Field(
        ...,
        description="Actionable suggestions to reduce energy usage and improve efficiency."
    )