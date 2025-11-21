from django.urls import path
from .views import RegisterAPI

urlpatterns = [
    path('registrar-api/', RegisterAPI.as_view(), name='api_registrar'),
]