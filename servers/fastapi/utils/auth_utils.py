from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from models.sql.presentation import PresentationModel
from models.sql.template import TemplateModel
from models.sql.presentation_layout_code import PresentationLayoutCodeModel


async def validate_presentation_ownership(
    presentation_id: str, 
    user_id: str, 
    sql_session: AsyncSession
) -> PresentationModel:
    """
    Validate that a user owns a specific presentation.
    
    Args:
        presentation_id: The ID of the presentation to check
        user_id: The ID of the user to validate ownership for
        sql_session: Database session
    
    Returns:
        PresentationModel if user owns the presentation
        
    Raises:
        HTTPException: 404 if presentation not found or user doesn't own it
    """
    presentation = await sql_session.scalar(
        select(PresentationModel)
        .where(PresentationModel.id == presentation_id)
        .where(PresentationModel.user_id == user_id)
    )
    if not presentation:
        raise HTTPException(404, "Presentation not found or access denied")
    return presentation


async def validate_template_ownership(
    template_id: str, 
    user_id: str, 
    sql_session: AsyncSession
) -> TemplateModel:
    """
    Validate that a user owns a specific template.
    
    Args:
        template_id: The ID of the template to check
        user_id: The ID of the user to validate ownership for
        sql_session: Database session
    
    Returns:
        TemplateModel if user owns the template
        
    Raises:
        HTTPException: 404 if template not found or user doesn't own it
    """
    template = await sql_session.scalar(
        select(TemplateModel)
        .where(TemplateModel.id == template_id)
        .where(TemplateModel.user_id == user_id)
    )
    if not template:
        raise HTTPException(404, "Template not found or access denied")
    return template


def get_user_id_from_request(request) -> str:
    """
    Extract user ID from authenticated request.
    
    Args:
        request: FastAPI Request object with user state set by auth middleware
        
    Returns:
        str: User ID
        
    Raises:
        HTTPException: 401 if user not authenticated
    """
    if not hasattr(request.state, 'user') or not request.state.user:
        raise HTTPException(401, "Authentication required")
    
    user_id = request.state.user.get("user_id")
    if not user_id:
        raise HTTPException(401, "Invalid authentication token")
    
    return user_id
