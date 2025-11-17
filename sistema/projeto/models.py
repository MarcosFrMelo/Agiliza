from django.db import models
from django.contrib.auth.models import User

class Projeto(models.Model):
    nome = models.CharField(max_length=100)
    descricao = models.TextField(blank=True, null=True)
    imagem_capa = models.ImageField(upload_to='projeto/fotos', blank=True, null=True)
    dono = models.ForeignKey(User, on_delete=models.CASCADE)

    def __str__(self):
        return self.nome