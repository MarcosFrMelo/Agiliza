import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { Router, RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Usuario } from './usuario.model';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterModule, HttpClientModule]
})
export class LoginPage implements OnInit {

  usuario: Usuario = {
    username: '',
    password: ''
  };

  constructor(
    private http: HttpClient, 
    private router: Router,
    private toastController: ToastController
  ) { }

  ngOnInit() {}

  async logar() {
    if (!this.usuario.username || !this.usuario.password) {
      this.exibirToast('Preencha todos os campos');
      return;
    }

    const url = `${environment.apiUrl}/autenticacao-api/`;

    this.http.post<any>(url, this.usuario).subscribe({
      next: (resposta) => {
        localStorage.setItem('token', resposta.token);
        this.router.navigate(['/projetos']);
      },
      error: (erro) => {
        console.error(erro);
        this.exibirToast('Usuário ou senha incorretos');
      }
    });
  }

  async exibirToast(mensagem: string) {
    const toast = await this.toastController.create({
      message: mensagem,
      duration: 2000,
      position: 'bottom'
    });
    toast.present();
  }
}