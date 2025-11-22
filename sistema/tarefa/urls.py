from django.urls import path
from .views import *

urlpatterns = [
    path('nova/<int:projeto_id>/', TarefaNova.as_view(), name='nova-tarefa'),
    path('editar/<int:pk>/', TarefaEditar.as_view(), name='editar-tarefa'),
    path('deletar/<int:pk>/', TarefaDeletar.as_view(), name='deletar-tarefa'),
    path('api/listar/', APIListarTarefas.as_view(), name='api-listar-tarefas'),
    path('api/cadastrar/', APICriarTarefa.as_view(), name='api-cadastrar-tarefa'),
    path('api/editar/<int:pk>/', APIEditarTarefa.as_view(), name='api-editar-tarefa'),
    path('api/deletar/<int:pk>/', APIExcluirTarefa.as_view(), name='api-deletar-tarefa'),
]