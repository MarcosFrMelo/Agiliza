import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { Router, RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Usuario } from '../login/usuario.model';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterModule, HttpClientModule]
})
export class RegisterPage implements OnInit {

  usuario: Usuario = {
    username: '',
    password: '',
    password_confirm: ''
  };

  constructor(
    private http: HttpClient,
    private router: Router,
    private toastController: ToastController
  ) { }

  ngOnInit() {}

  registrar() {
    if (this.usuario.password !== this.usuario.password_confirm) {
      this.exibirToast('As senhas não conferem!');
      return;
    }

    const url = `${environment.apiUrl}/usuario/api/registrar/`;

    this.http.post(url, this.usuario).subscribe({
      next: () => {
        this.exibirToast('Conta criada com sucesso! Faça login.');
        this.router.navigate(['/login']);
      },
      error: (erro) => {
        console.error(erro);
        this.exibirToast('Erro ao criar conta. Tente outro usuário.');
      }
    });
  }

  async exibirToast(mensagem: string) {
    const toast = await this.toastController.create({
      message: mensagem,
      duration: 2000,
      color: 'dark'
    });
    toast.present();
  }
}