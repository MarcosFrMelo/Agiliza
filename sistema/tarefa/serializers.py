from rest_framework import serializers
from .models import Tarefa

class TarefaSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    etiqueta_display = serializers.CharField(source='get_etiqueta_display', read_only=True)
    projeto_nome = serializers.CharField(source='projeto.nome', read_only=True)

    class Meta:
        model = Tarefa
        fields = [
            'id', 'titulo', 'descricao', 
            'status', 'status_display', 
            'etiqueta', 'etiqueta_display', 
            'projeto', 'projeto_nome',
            'data_criacao'
        ]