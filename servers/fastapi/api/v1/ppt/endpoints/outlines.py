import asyncio
import json
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from models.presentation_outline_model import PresentationOutlineModel
from models.sql.presentation import PresentationModel
from models.sse_response import SSECompleteResponse, SSEResponse, SSEStatusResponse
from services import TEMP_FILE_SERVICE
from services.database import get_async_session, async_session_maker
from utils.auth_utils import get_user_id_from_request, validate_presentation_ownership
from services.documents_loader import DocumentsLoader
from services.score_based_chunker import ScoreBasedChunker
from utils.llm_calls.generate_presentation_outlines import generate_ppt_outline

OUTLINES_ROUTER = APIRouter(prefix="/outlines", tags=["Outlines"])


@OUTLINES_ROUTER.get("/stream")
async def stream_outlines(
    presentation_id: str,
    request: Request,
    sql_session: AsyncSession = Depends(get_async_session),
):
    # Validate ownership and fetch presentation using the request's user context
    user_id = get_user_id_from_request(request)
    presentation = await validate_presentation_ownership(presentation_id, user_id, sql_session)

    temp_dir = TEMP_FILE_SERVICE.create_temp_dir()

    async def inner():
        yield SSEStatusResponse(
            status="Generating presentation outlines..."
        ).to_string()

        presentation_outlines = None
        additional_context = ""
        if presentation.file_paths:
            documents_loader = DocumentsLoader(file_paths=presentation.file_paths)
            await documents_loader.load_documents(temp_dir)
            documents = documents_loader.documents
            if documents:
                additional_context = documents[0]
                chunker = ScoreBasedChunker()
                try:
                    chunks = await chunker.get_n_chunks(
                        documents[0], presentation.n_slides
                    )
                    presentation_outlines = PresentationOutlineModel(
                        slides=[chunk.to_slide_outline() for chunk in chunks]
                    )
                except Exception as e:
                    print(e)

        if not presentation_outlines:
            presentation_outlines_text = ""
            async for chunk in generate_ppt_outline(
                presentation.prompt,
                presentation.n_slides,
                presentation.language,
                additional_context,
            ):
                # Give control to the event loop
                await asyncio.sleep(0)

                yield SSEResponse(
                    event="response",
                    data=json.dumps({"type": "chunk", "chunk": chunk}),
                ).to_string()

                presentation_outlines_text += chunk

            try:
                presentation_outlines_json = json.loads(presentation_outlines_text)
            except Exception as e:
                raise HTTPException(
                    status_code=400,
                    detail="Failed to generate presentation outlines. Please try again.",
                )

            presentation_outlines = PresentationOutlineModel(
                **presentation_outlines_json
            )

        presentation_outlines.slides = presentation_outlines.slides[
            : presentation.n_slides
        ]

        # Use a fresh DB session inside the streaming generator to avoid
        # lifecycle issues with dependency-managed sessions
        async with async_session_maker() as stream_session:
            # Re-fetch to ensure latest state and ownership in this session
            db_presentation = await stream_session.get(PresentationModel, presentation_id)
            if not db_presentation:
                raise HTTPException(status_code=404, detail="Presentation not found")
            db_presentation.outlines = presentation_outlines.model_dump()
            db_presentation.title = (
                presentation_outlines.slides[0]
                .content[:50]
                .replace("#", "")
                .replace("/", "")
                .replace("\\", "")
                .replace("\n", "")
            )
            stream_session.add(db_presentation)
            await stream_session.commit()

        # Return the persisted presentation snapshot
        yield SSECompleteResponse(
            key="presentation", value=db_presentation.model_dump(mode="json")
        ).to_string()

    return StreamingResponse(inner(), media_type="text/event-stream")
