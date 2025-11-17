from django.contrib import admin
from django.urls import path, include
from sistema.views import *
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', Login.as_view(), name='login'),
    path('registrar/', Registrar.as_view(), name='registrar'),
    path('projeto/', include('projeto.urls'), name='projeto'),
    path('logout/', Logout.as_view(), name='logout'),
    path('autenticacao-api/', LoginAPI.as_view(), name='autenticacao-api'),
]
