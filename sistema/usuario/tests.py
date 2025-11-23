from django.test import TestCase, Client
from django.urls import reverse
from django.contrib.auth.models import User
from django.contrib.auth.forms import UserCreationForm

class TestesViewRegistrar(TestCase):
    def setUp(self):
        self.client = Client()
        self.url = reverse('registrar')

    def test_acesso_pagina_registro(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'registro.html')
        self.assertIsInstance(response.context['form'], UserCreationForm)

    def test_registro_usuario_sucesso(self):
        """Testa criar um usuário com o formulário padrão"""
        data = {
            'username': 'novousuario',
            'password1': 'Teste@123456', 
            'password2': 'Teste@123456'
        }
        
        response = self.client.post(self.url, data)

        self.assertEqual(response.status_code, 302)
        self.assertRedirects(response, reverse('login'))

        self.assertTrue(User.objects.filter(username='novousuario').exists())

    def test_registro_senhas_diferentes(self):
        data = {
            'username': 'usuarioerro',
            'password1': 'Teste@123456',
            'password2': 'SenhaErrada@000'
        }
        response = self.client.post(self.url, data)
        
        self.assertEqual(response.status_code, 200)
        self.assertFalse(User.objects.filter(username='usuarioerro').exists())