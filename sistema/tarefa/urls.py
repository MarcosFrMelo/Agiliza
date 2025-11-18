from django.urls import path
from .views import TarefaNova, TarefaEditar, TarefaDeletar

urlpatterns = [
    path('nova/<int:projeto_id>/', TarefaNova.as_view(), name='nova-tarefa'),
    path('editar/<int:pk>/', TarefaEditar.as_view(), name='editar-tarefa'),
    path('deletar/<int:pk>/', TarefaDeletar.as_view(), name='deletar-tarefa'),
]