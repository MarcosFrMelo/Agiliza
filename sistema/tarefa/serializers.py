from rest_framework import serializers
from .models import Tarefa

class TarefaSerializer(serializers.ModelSerializer):
    status_display = serializers.SerializerMethodField()
    etiqueta_display = serializers.SerializerMethodField()
    projeto_nome = serializers.SerializerMethodField()

    class Meta:
        model = Tarefa
        exclude = [] 

    def get_status_display(self, instancia):
        return instancia.get_status_display()

    def get_etiqueta_display(self, instancia):
        return instancia.get_etiqueta_display()

    def get_projeto_nome(self, instancia):
        return instancia.projeto.nome if instancia.projeto else None