from django.urls import path
from projeto.views import *

urlpatterns = [
    path('', ProjetoListar.as_view(), name='listar-projetos'),
    path('novo/', ProjetoNovo.as_view(), name='novo-projeto'),
    path('editar/<int:pk>/', ProjetoEditar.as_view(), name='editar-projeto'),
    path('deletar/<int:pk>/', ProjetoDeletar.as_view(), name='deletar-projeto'),
    path('fotos/<str:arquivo>/', FotoProjeto.as_view(), name='foto-projeto'),
]