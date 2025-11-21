from django.urls import path
from projeto.views import *

urlpatterns = [
    path('', ProjetoListar.as_view(), name='listar-projetos'),
    path('novo/', ProjetoNovo.as_view(), name='novo-projeto'),
    path('editar/<int:pk>/', ProjetoEditar.as_view(), name='editar-projeto'),
    path('deletar/<int:pk>/', ProjetoDeletar.as_view(), name='deletar-projeto'),
    path('fotos/<str:arquivo>/', FotoProjeto.as_view(), name='foto-projeto'),
    path('quadro/<int:pk>/', ProjetoQuadro.as_view(), name='quadro-projeto'),
    path('api/listar/', APIListarProjetos.as_view(), name='api-listar-projetos'),
    path('api/cadastrar/', APICriarProjeto.as_view(), name='api-cadastrar-projeto'),
    path('api/editar/<int:pk>/', APIEditarProjeto.as_view(), name='api-editar-projeto'),
    path('api/deletar/<int:pk>/', APIExcluirProjeto.as_view(), name='api-deletar-projeto'),
]