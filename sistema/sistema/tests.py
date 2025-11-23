from django.test import TestCase, Client
from django.urls import reverse
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status

class TestesViewLoginWeb(TestCase):
    def setUp(self):
        self.client = Client()
        self.user = User.objects.create_user(username='tester', password='12345')
        self.url = reverse('login')

    def test_login_sucesso(self):
        data = {
            'username': 'tester',
            'password': '12345'
        }
        response = self.client.post(self.url, data)

        self.assertEqual(response.status_code, 302)
        self.assertRedirects(response, '/projeto/')

        self.assertEqual(int(self.client.session['_auth_user_id']), self.user.pk)

    def test_login_invalido(self):
        data = {
            'username': 'tester',
            'password': 'senhaerrada'
        }
        response = self.client.post(self.url, data)

        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'autenticacao.html')
        self.assertContains(response, "Usuário ou senha inválidos!")

class TestesViewLogout(TestCase):
    def setUp(self):
        self.client = Client()
        self.user = User.objects.create_user(username='tester', password='12345')
        self.client.login(username='tester', password='12345')
        self.url = reverse('logout')

    def test_logout(self):
        response = self.client.get(self.url)

        self.assertEqual(response.status_code, 302)
        self.assertRedirects(response, '/')

        self.assertNotIn('_auth_user_id', self.client.session)

class TestesLoginAPI(TestCase):
    def setUp(self):
        self.client = APIClient()

        self.user = User.objects.create_user(
            username='apiuser', 
            password='12345',
            email='api@teste.com',
            first_name='ApiTester'
        )
        self.url = reverse('autenticacao-api')

    def test_login_api_sucesso(self):
        data = {
            'username': 'apiuser',
            'password': '12345'
        }
        response = self.client.post(self.url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.assertIn('token', response.data)
        self.assertEqual(response.data['email'], 'api@teste.com')
        self.assertEqual(response.data['nome'], 'ApiTester')

    def test_login_api_falha(self):
        data = {
            'username': 'apiuser',
            'password': 'errada'
        }
        response = self.client.post(self.url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertNotIn('token', response.data)