from django.contrib.auth.models import User
from django.test import TestCase
from django.urls import reverse
from projeto.models import Projeto
from projeto.forms import ProjetoForm
from rest_framework.test import APITestCase, APIClient
from rest_framework.authtoken.models import Token
from rest_framework import status
from django.core.files.uploadedfile import SimpleUploadedFile
import tempfile
from PIL import Image

class TestesModelProjeto(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='teste_model', password='12345')
        self.instancia = Projeto.objects.create(
            nome="Projeto Teste",
            descricao="Descrição do projeto teste",
            dono=self.user
        )
    
    def test_str(self):
        self.assertEqual(str(self.instancia), "Projeto Teste")

    def test_criacao(self):
        self.assertEqual(self.instancia.nome, "Projeto Teste")
        self.assertEqual(self.instancia.dono, self.user)

class TestesViewListarProjetos(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='teste', password='12345')
        self.client.login(username='teste', password='12345')
        self.url = reverse('listar-projetos')
        Projeto.objects.create(nome="Projeto 1", descricao="Desc 1", dono=self.user)
    
    def test_listar_projetos(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.context.get('projetos')), 1)
        self.assertEqual(response.context.get('projetos')[0].nome, "Projeto 1")

class TestesViewCadastrarProjeto(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='teste', password='12345')
        self.client.login(username='teste', password='12345')
        self.url = reverse('novo-projeto')
        
    def test_get(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.context.get('form'), ProjetoForm)

    def test_post(self):
        data = {
            'nome': 'Novo Projeto',
            'descricao': 'Descrição nova'
        }
        response = self.client.post(self.url, data)
        self.assertEqual(response.status_code, 302)
        self.assertRedirects(response, reverse('listar-projetos'))
        self.assertEqual(Projeto.objects.count(), 1)
        projeto_salvo = Projeto.objects.first()
        self.assertEqual(projeto_salvo.nome, 'Novo Projeto')
        self.assertEqual(projeto_salvo.dono, self.user)

class TestesViewEditarProjeto(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='teste', password='12345')
        self.client.login(username='teste', password='12345')
        
        self.instancia = Projeto.objects.create(
            nome="Projeto Original",
            descricao="Desc Original",
            dono=self.user
        )
        self.url = reverse('editar-projeto', kwargs={'pk': self.instancia.pk})

    def test_get(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.context.get('object'), Projeto)
        self.assertIsInstance(response.context.get('form'), ProjetoForm)
        self.assertEqual(response.context.get('object').pk, self.instancia.pk)

    def test_post(self):
        data = {
            'nome': 'Projeto Editado',
            'descricao': 'Desc Editada'
        }
        response = self.client.post(self.url, data)
        self.assertEqual(response.status_code, 302)
        self.assertRedirects(response, reverse('listar-projetos'))
        self.instancia.refresh_from_db()
        self.assertEqual(self.instancia.nome, 'Projeto Editado')
        self.assertEqual(self.instancia.descricao, 'Desc Editada')

class TestesViewExcluirProjeto(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='teste', password='12345')
        self.client.login(username='teste', password='12345')
        
        self.instancia = Projeto.objects.create(
            nome="Projeto Para Deletar",
            dono=self.user
        )
        self.url = reverse('deletar-projeto', kwargs={'pk': self.instancia.pk})

    def test_get(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.context.get('object'), Projeto)

    def test_post(self):
        response = self.client.post(self.url)
        self.assertEqual(response.status_code, 302)
        self.assertRedirects(response, reverse('listar-projetos'))
        self.assertEqual(Projeto.objects.count(), 0)

class TestesAPIListarProjetos(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='api_list', password='12345')
        self.token = Token.objects.create(user=self.user)
        self.client = APIClient()
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token.key)
        Projeto.objects.create(nome="Projeto API", dono=self.user)
        self.url = reverse('api-listar-projetos')

    def test_listar(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(len(response.data) >= 1)

class TestesAPICriarProjeto(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='api_create', password='12345')
        self.token = Token.objects.create(user=self.user)
        self.client = APIClient()
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token.key)
        self.url = reverse('api-cadastrar-projeto')

    def criar_imagem_temporaria(self):
        image = Image.new('RGB', (100, 100))
        tmp_file = tempfile.NamedTemporaryFile(suffix='.jpg')
        image.save(tmp_file)
        tmp_file.seek(0)
        return tmp_file

    def test_criar_sem_imagem(self):
        data = {'nome': 'Projeto Texto', 'descricao': 'Sem foto'}
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Projeto.objects.filter(nome='Projeto Texto').count(), 1)

    def test_criar_com_imagem(self):
        imagem = self.criar_imagem_temporaria()
        file = SimpleUploadedFile('teste.jpg', imagem.read(), content_type='image/jpeg')
        data = {'nome': 'Projeto Foto', 'imagem_capa': file}
        response = self.client.post(self.url, data, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Projeto.objects.get(nome='Projeto Foto').imagem_capa)

class TestesAPIEditarProjeto(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='api_edit', password='12345')
        self.token = Token.objects.create(user=self.user)
        self.client = APIClient()
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token.key)
        self.projeto = Projeto.objects.create(nome="Original", dono=self.user)
        self.url = reverse('api-editar-projeto', kwargs={'pk': self.projeto.pk})

    def test_editar(self):
        data = {'nome': 'Renomeado'}
        response = self.client.patch(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.projeto.refresh_from_db()
        self.assertEqual(self.projeto.nome, 'Renomeado')

class TestesAPIExcluirProjeto(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='api_delete', password='12345')
        self.token = Token.objects.create(user=self.user)
        self.client = APIClient()
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token.key)
        self.projeto = Projeto.objects.create(nome="Para Deletar", dono=self.user)
        self.url = reverse('api-deletar-projeto', kwargs={'pk': self.projeto.pk})

    def test_deletar(self):
        response = self.client.delete(self.url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Projeto.objects.count(), 0)