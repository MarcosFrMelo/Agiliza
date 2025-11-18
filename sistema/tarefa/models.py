from django.db import models
from projeto.models import Projeto
from .consts import STATUS_CHOICES, ETIQUETA_CHOICES

class Tarefa(models.Model):
    titulo = models.CharField(max_length=200)
    descricao = models.TextField(blank=True, null=True)
    status = models.PositiveSmallIntegerField(choices=STATUS_CHOICES, default=1)
    etiqueta = models.PositiveSmallIntegerField(choices=ETIQUETA_CHOICES, default=3)
    projeto = models.ForeignKey(Projeto, on_delete=models.CASCADE, related_name='tarefas')
    data_criacao = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.titulo} ({self.get_status_display()})"