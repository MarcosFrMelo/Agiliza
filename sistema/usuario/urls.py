from django.urls import path
from .views import RegisterAPI

urlpatterns = [
    path('registrar/', RegisterAPI.as_view(), name='api_registrar'),
]