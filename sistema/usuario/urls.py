from django.urls import path
from .views import *

urlpatterns = [
    path('registrar/', Registrar.as_view(), name='registrar'),
    path('api/registrar/', RegisterAPI.as_view(), name='api_registrar'),
]