from fastapi import APIRouter, Depends
from app.core.dependencies import require_role

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/dashboard")
def admin_dashboard(
    admin = Depends(require_role("ADMIN"))
):
    return {"message": "Welcome Admin"}