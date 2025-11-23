from django.contrib.auth import authenticate, login, logout
from django.views.generic import View, CreateView
from django.shortcuts import render, redirect
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from django.contrib.auth.forms import UserCreationForm
from django.urls import reverse_lazy

class Login(View):
    """
    Class based view para autenticação de usuarios.
    """
    def get(self, request):
        contexto = {}
        if request.user.is_authenticated:
            return redirect("/projeto/")
        
        return render(request, 'autenticacao.html', contexto)

    def post(self, request):
        usuario = request.POST.get('username', None)
        senha = request.POST.get('password', None)

        user = authenticate(request, username=usuario, password=senha)
        if user is not None:
            login(request, user)

            return redirect("/projeto/")
        return render(request, 'autenticacao.html', {"error": "Usuário ou senha inválidos!"})
    
class Logout(View):
    """
    Class based view para logout de usuarios.
    """
    def get(self, request):
        logout(request)
        return redirect("/")
    
class LoginAPI(ObtainAuthToken):
    
    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(
            data=request.data,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'id': user.id,
            'nome': user.first_name,
            'email': user.email,
            'token': token.key
        })
    