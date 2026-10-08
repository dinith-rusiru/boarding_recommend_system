from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base
from app.routes import auth, student, boarding, landlord, admin, recommendations, evaluation, facilities
from app.utils.seed_data import seed_database

# Create database tables automatically if they don't exist
Base.metadata.create_all(bind=engine)

# Populate realistic seed data
try:
    seed_database()
except Exception as e:
    print(f"Seed database warning: {e}")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Production-quality REST API & Context-Aware Boarding Recommendation Engine using Weighted Scoring Algorithm for Smart Bodim research project.",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in strict production if needed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(student.router, prefix=settings.API_V1_STR)
app.include_router(boarding.router, prefix=settings.API_V1_STR)
app.include_router(landlord.router, prefix=settings.API_V1_STR)
app.include_router(admin.router, prefix=settings.API_V1_STR)
app.include_router(recommendations.router, prefix=settings.API_V1_STR)
app.include_router(evaluation.router, prefix=settings.API_V1_STR)
app.include_router(facilities.router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "title": settings.PROJECT_NAME,
        "status": "Online",
        "version": settings.VERSION,
        "swagger_docs": "/docs",
        "recommendation_engine": "Weighted Scoring Algorithm with Haversine Distance"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
