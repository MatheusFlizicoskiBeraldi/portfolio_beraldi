import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app'; // Aqui está o segredo: importando o AppComponent do arquivo app.ts

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));